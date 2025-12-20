import { query } from './db';

export async function initializeDatabase() {
  try {
    // Create profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        tax_office TEXT NOT NULL,
        tax_number TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create requests table
    await query(`
      CREATE TABLE IF NOT EXISTS requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) NOT NULL,
        request_number TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        sub_category TEXT,
        status TEXT DEFAULT 'pending',
        total_items INTEGER DEFAULT 0,
        project_description TEXT,
        delivery_to_address BOOLEAN DEFAULT false,
        delivery_address TEXT,
        requested_delivery_date DATE,
        files_cleaned BOOLEAN DEFAULT false,
        last_activity_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create request_items table
    await query(`
      CREATE TABLE IF NOT EXISTS request_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        material TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size BIGINT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create quotes table
    await query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
        admin_id UUID REFERENCES profiles(id) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'TRY',
        delivery_date DATE NOT NULL,
        delivery_cost DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        status TEXT DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create quote_items table
    await query(`
      CREATE TABLE IF NOT EXISTS quote_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
        request_item_id UUID REFERENCES request_items(id),
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        notes TEXT
      )
    `);

    // Create messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
        request_item_id UUID REFERENCES request_items(id),
        sender_id UUID REFERENCES profiles(id) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create comments table
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_item_id UUID REFERENCES request_items(id) ON DELETE CASCADE,
        user_id UUID REFERENCES profiles(id) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create reorder_templates table
    await query(`
      CREATE TABLE IF NOT EXISTS reorder_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) NOT NULL,
        original_request_id UUID REFERENCES requests(id),
        template_name TEXT NOT NULL,
        category TEXT NOT NULL,
        sub_category TEXT,
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create file_cleanup_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS file_cleanup_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID REFERENCES requests(id),
        files_deleted JSONB,
        reason TEXT,
        cleaned_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = false`);
    await query(`CREATE INDEX IF NOT EXISTS idx_requests_last_activity ON requests(last_activity_at)`);

    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error: error.message };
  }
}

export async function generateRequestNumber() {
  const year = new Date().getFullYear();
  const result = await query(
    `SELECT COUNT(*) + 1 as next_num FROM requests WHERE request_number LIKE $1`,
    [`REQ-${year}-%`]
  );
  const nextNum = result.rows[0].next_num;
  return `REQ-${year}-${String(nextNum).padStart(4, '0')}`;
}
