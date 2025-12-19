import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/lib/db';
import { initializeDatabase, generateRequestNumber } from '@/lib/init-db';
import { hashPassword, comparePassword, generateToken, getUserFromToken, getTokenFromRequest } from '@/lib/auth';
import { registerSchema, loginSchema, messageSchema, commentSchema } from '@/lib/validations';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Auth middleware helper
async function authenticateRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return await getUserFromToken(token);
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path: pathSegments = [] } = params;
  const route = `/${pathSegments.join('/')}`;
  const method = request.method;

  try {
    // Initialize database on first request
    if (route === '/init' && method === 'POST') {
      const result = await initializeDatabase();
      return handleCORS(NextResponse.json(result));
    }

    // Health check
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Imalat Portal API is running', status: 'ok' }));
    }

    // ==================== AUTH ROUTES ====================
    
    // Register
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json();
      
      const validation = registerSchema.safeParse(body);
      if (!validation.success) {
        return handleCORS(NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 }));
      }

      // Check if email exists
      const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [body.email]);
      if (existingUser.rows.length > 0) {
        return handleCORS(NextResponse.json({ error: 'Bu email adresi zaten kayitli' }, { status: 400 }));
      }

      const passwordHash = await hashPassword(body.password);
      const userId = uuidv4();

      await query(
        `INSERT INTO profiles (id, email, password_hash, full_name, company_name, tax_office, tax_number, address, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [userId, body.email, passwordHash, body.full_name, body.company_name, body.tax_office, body.tax_number, body.address, body.phone, 'customer']
      );

      const token = generateToken({ id: userId, email: body.email, role: 'customer' });

      return handleCORS(NextResponse.json({
        success: true,
        token,
        user: { id: userId, email: body.email, full_name: body.full_name, company_name: body.company_name, role: 'customer' }
      }));
    }

    // Login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json();
      
      const validation = loginSchema.safeParse(body);
      if (!validation.success) {
        return handleCORS(NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 }));
      }

      const result = await query('SELECT * FROM profiles WHERE email = $1', [body.email]);
      if (result.rows.length === 0) {
        return handleCORS(NextResponse.json({ error: 'Email veya sifre hatali' }, { status: 401 }));
      }

      const user = result.rows[0];
      const isValid = await comparePassword(body.password, user.password_hash);
      if (!isValid) {
        return handleCORS(NextResponse.json({ error: 'Email veya sifre hatali' }, { status: 401 }));
      }

      const token = generateToken(user);

      return handleCORS(NextResponse.json({
        success: true,
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name, 
          company_name: user.company_name, 
          role: user.role,
          tax_office: user.tax_office,
          tax_number: user.tax_number,
          address: user.address,
          phone: user.phone
        }
      }));
    }

    // Get current user
    if (route === '/auth/me' && method === 'GET') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }
      
      const result = await query('SELECT * FROM profiles WHERE id = $1', [user.id]);
      const profile = result.rows[0];
      delete profile.password_hash;
      
      return handleCORS(NextResponse.json({ user: profile }));
    }

    // Update profile
    if (route === '/auth/profile' && method === 'PUT') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const body = await request.json();
      
      await query(
        `UPDATE profiles SET full_name = $1, company_name = $2, tax_office = $3, tax_number = $4, address = $5, phone = $6, updated_at = NOW()
         WHERE id = $7`,
        [body.full_name, body.company_name, body.tax_office, body.tax_number, body.address, body.phone, user.id]
      );

      return handleCORS(NextResponse.json({ success: true, message: 'Profil guncellendi' }));
    }

    // ==================== REQUESTS ROUTES ====================

    // Create request
    if (route === '/requests' && method === 'POST') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const body = await request.json();
      const requestNumber = await generateRequestNumber();
      const requestId = uuidv4();

      await query(
        `INSERT INTO requests (id, user_id, request_number, category, sub_category, project_description, delivery_to_address, delivery_address, total_items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [requestId, user.id, requestNumber, body.category, body.sub_category, body.project_description, body.delivery_to_address || false, body.delivery_address, body.items?.length || 0]
      );

      // Add items
      if (body.items && body.items.length > 0) {
        for (const item of body.items) {
          await query(
            `INSERT INTO request_items (id, request_id, item_name, material, quantity, file_url, file_name, file_size, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [uuidv4(), requestId, item.item_name, item.material, item.quantity, item.file_url, item.file_name, item.file_size, item.notes]
          );
        }
      }

      // Save as template if requested
      if (body.save_as_template && body.template_name) {
        await query(
          `INSERT INTO reorder_templates (id, user_id, original_request_id, template_name, category, sub_category, items)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), user.id, requestId, body.template_name, body.category, body.sub_category, JSON.stringify(body.items)]
        );
      }

      return handleCORS(NextResponse.json({ success: true, request_id: requestId, request_number: requestNumber }));
    }

    // Get user's requests
    if (route === '/requests' && method === 'GET') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      let result;
      if (user.role === 'admin') {
        result = await query(`
          SELECT r.*, p.full_name, p.company_name, p.email, p.phone,
            (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id AND m.is_read = false AND m.sender_id != $1) as unread_messages
          FROM requests r
          JOIN profiles p ON r.user_id = p.id
          ORDER BY r.created_at DESC
        `, [user.id]);
      } else {
        result = await query(`
          SELECT r.*,
            (SELECT COUNT(*) FROM messages m WHERE m.request_id = r.id AND m.is_read = false AND m.sender_id != $1) as unread_messages
          FROM requests r
          WHERE r.user_id = $1
          ORDER BY r.created_at DESC
        `, [user.id]);
      }

      return handleCORS(NextResponse.json({ requests: result.rows }));
    }

    // Get single request
    if (route.match(/^\/requests\/[^/]+$/) && method === 'GET') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const requestId = pathSegments[1];
      
      const requestResult = await query(`
        SELECT r.*, p.full_name, p.company_name, p.email, p.phone, p.tax_office, p.tax_number, p.address as profile_address
        FROM requests r
        JOIN profiles p ON r.user_id = p.id
        WHERE r.id = $1
      `, [requestId]);

      if (requestResult.rows.length === 0) {
        return handleCORS(NextResponse.json({ error: 'Talep bulunamadi' }, { status: 404 }));
      }

      const req = requestResult.rows[0];

      // Check authorization
      if (user.role !== 'admin' && req.user_id !== user.id) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
      }

      // Get items
      const itemsResult = await query('SELECT * FROM request_items WHERE request_id = $1', [requestId]);
      
      // Get quote if exists
      const quoteResult = await query(`
        SELECT q.*, 
          (SELECT json_agg(qi.*) FROM quote_items qi WHERE qi.quote_id = q.id) as items
        FROM quotes q WHERE q.request_id = $1 ORDER BY q.created_at DESC LIMIT 1
      `, [requestId]);

      // Get messages
      const messagesResult = await query(`
        SELECT m.*, p.full_name, p.role as sender_role
        FROM messages m
        JOIN profiles p ON m.sender_id = p.id
        WHERE m.request_id = $1
        ORDER BY m.created_at ASC
      `, [requestId]);

      // Get comments for each item
      for (const item of itemsResult.rows) {
        const commentsResult = await query(`
          SELECT c.*, p.full_name, p.role as commenter_role
          FROM comments c
          JOIN profiles p ON c.user_id = p.id
          WHERE c.request_item_id = $1
          ORDER BY c.created_at ASC
        `, [item.id]);
        item.comments = commentsResult.rows;
      }

      // Mark messages as read
      await query(`UPDATE messages SET is_read = true WHERE request_id = $1 AND sender_id != $2`, [requestId, user.id]);

      return handleCORS(NextResponse.json({
        request: req,
        items: itemsResult.rows,
        quote: quoteResult.rows[0] || null,
        messages: messagesResult.rows
      }));
    }

    // Update request status
    if (route.match(/^\/requests\/[^/]+\/status$/) && method === 'PUT') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const requestId = pathSegments[1];
      const body = await request.json();

      await query(
        'UPDATE requests SET status = $1, last_activity_at = NOW(), updated_at = NOW() WHERE id = $2',
        [body.status, requestId]
      );

      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== QUOTES ROUTES ====================

    // Create quote (admin only)
    if (route === '/quotes' && method === 'POST') {
      const user = await authenticateRequest(request);
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
      }

      const body = await request.json();
      const quoteId = uuidv4();

      await query(
        `INSERT INTO quotes (id, request_id, admin_id, total_price, delivery_date, delivery_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [quoteId, body.request_id, user.id, body.total_price, body.delivery_date, body.delivery_cost || 0, body.notes]
      );

      // Add quote items
      if (body.items && body.items.length > 0) {
        for (const item of body.items) {
          await query(
            `INSERT INTO quote_items (id, quote_id, request_item_id, unit_price, total_price, notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [uuidv4(), quoteId, item.request_item_id, item.unit_price, item.total_price, item.notes]
          );
        }
      }

      // Update request status
      await query('UPDATE requests SET status = $1, last_activity_at = NOW() WHERE id = $2', ['quoted', body.request_id]);

      return handleCORS(NextResponse.json({ success: true, quote_id: quoteId }));
    }

    // Accept/Reject quote
    if (route.match(/^\/quotes\/[^/]+\/respond$/) && method === 'POST') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const quoteId = pathSegments[1];
      const body = await request.json();
      const newStatus = body.accept ? 'accepted' : 'rejected';

      await query('UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, quoteId]);

      // Update request status
      const quoteResult = await query('SELECT request_id FROM quotes WHERE id = $1', [quoteId]);
      const requestStatus = body.accept ? 'approved' : 'rejected';
      await query('UPDATE requests SET status = $1, last_activity_at = NOW() WHERE id = $2', [requestStatus, quoteResult.rows[0].request_id]);

      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== MESSAGES ROUTES ====================

    // Send message
    if (route === '/messages' && method === 'POST') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const body = await request.json();
      
      const validation = messageSchema.safeParse(body);
      if (!validation.success) {
        return handleCORS(NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 }));
      }

      const messageId = uuidv4();
      await query(
        `INSERT INTO messages (id, request_id, request_item_id, sender_id, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [messageId, body.request_id, body.request_item_id || null, user.id, body.message]
      );

      // Update last activity
      await query('UPDATE requests SET last_activity_at = NOW() WHERE id = $1', [body.request_id]);

      return handleCORS(NextResponse.json({ success: true, message_id: messageId }));
    }

    // ==================== COMMENTS ROUTES ====================

    // Add comment to item
    if (route === '/comments' && method === 'POST') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const body = await request.json();
      
      const validation = commentSchema.safeParse(body);
      if (!validation.success) {
        return handleCORS(NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 }));
      }

      const commentId = uuidv4();
      await query(
        `INSERT INTO comments (id, request_item_id, user_id, comment)
         VALUES ($1, $2, $3, $4)`,
        [commentId, body.request_item_id, user.id, body.comment]
      );

      // Update last activity on request
      const itemResult = await query('SELECT request_id FROM request_items WHERE id = $1', [body.request_item_id]);
      if (itemResult.rows.length > 0) {
        await query('UPDATE requests SET last_activity_at = NOW() WHERE id = $1', [itemResult.rows[0].request_id]);
      }

      return handleCORS(NextResponse.json({ success: true, comment_id: commentId }));
    }

    // ==================== TEMPLATES ROUTES ====================

    // Get user's templates
    if (route === '/templates' && method === 'GET') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const result = await query('SELECT * FROM reorder_templates WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
      return handleCORS(NextResponse.json({ templates: result.rows }));
    }

    // Delete template
    if (route.match(/^\/templates\/[^/]+$/) && method === 'DELETE') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const templateId = pathSegments[1];
      await query('DELETE FROM reorder_templates WHERE id = $1 AND user_id = $2', [templateId, user.id]);
      return handleCORS(NextResponse.json({ success: true }));
    }

    // ==================== FILE UPLOAD ROUTE ====================

    // Upload file
    if (route === '/upload' && method === 'POST') {
      const user = await authenticateRequest(request);
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
      }

      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return handleCORS(NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 }));
      }

      const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 104857600; // 100MB
      if (file.size > MAX_SIZE) {
        return handleCORS(NextResponse.json({ error: 'Dosya boyutu 100 MB\'i asamaz' }, { status: 400 }));
      }

      const allowedExtensions = ['.step', '.stp', '.dxf', '.pdf', '.rar', '.zip'];
      const ext = path.extname(file.name).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return handleCORS(NextResponse.json({ error: 'Gecersiz dosya formati. Izin verilen: .step, .stp, .dxf, .pdf, .rar, .zip' }, { status: 400 }));
      }

      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);

      return handleCORS(NextResponse.json({
        success: true,
        file_url: `/api/files/${fileName}`,
        file_name: file.name,
        file_size: file.size
      }));
    }

    // Serve uploaded files
    if (route.match(/^\/files\/[^/]+$/) && method === 'GET') {
      const fileName = pathSegments[1];
      const filePath = path.join(UPLOAD_DIR, fileName);

      if (!fs.existsSync(filePath)) {
        return handleCORS(NextResponse.json({ error: 'Dosya bulunamadi' }, { status: 404 }));
      }

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(fileName).toLowerCase();
      
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.step': 'application/octet-stream',
        '.stp': 'application/octet-stream',
        '.dxf': 'application/octet-stream',
      };

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // ==================== ADMIN STATS ====================

    if (route === '/admin/stats' && method === 'GET') {
      const user = await authenticateRequest(request);
      if (!user || user.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 403 }));
      }

      const stats = {};
      
      const pendingResult = await query("SELECT COUNT(*) as count FROM requests WHERE status = 'pending'");
      stats.pending = parseInt(pendingResult.rows[0].count);

      const quotedResult = await query("SELECT COUNT(*) as count FROM requests WHERE status = 'quoted'");
      stats.quoted = parseInt(quotedResult.rows[0].count);

      const approvedResult = await query("SELECT COUNT(*) as count FROM requests WHERE status = 'approved'");
      stats.approved = parseInt(approvedResult.rows[0].count);

      const completedResult = await query("SELECT COUNT(*) as count FROM requests WHERE status = 'completed'");
      stats.completed = parseInt(completedResult.rows[0].count);

      const unreadResult = await query("SELECT COUNT(*) as count FROM messages WHERE is_read = false");
      stats.unread_messages = parseInt(unreadResult.rows[0].count);

      return handleCORS(NextResponse.json({ stats }));
    }

    // Route not found
    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 }));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
