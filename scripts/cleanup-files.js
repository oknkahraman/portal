#!/usr/bin/env node

/**
 * IMALAT PORTAL - Dosya Temizlik Script'i
 * ==========================================
 * Bu script cron job olarak calistirilir:
 * 0 2 * * * /usr/bin/node /app/scripts/cleanup-files.js
 * 
 * Her gece saat 02:00'de calisir ve:
 * - Reddedilmis ve 7 gun gecmis taleplerin dosyalarini siler
 * - 1 yil boyunca islem gormemis taleplerin dosyalarini siler
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

async function cleanupFiles() {
  console.log('==========================================');
  console.log('Dosya Temizlik Script\'i Basladi');
  console.log('Tarih:', new Date().toISOString());
  console.log('==========================================');

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Reddedilmis ve 7 gun gecmis talepler
    console.log('\\n[1] Reddedilmis talepler kontrol ediliyor...');
    
    const rejectedRequests = await client.query(`
      SELECT r.id, r.request_number, ri.file_url, ri.file_name
      FROM requests r
      JOIN request_items ri ON ri.request_id = r.id
      WHERE r.status = 'rejected'
        AND r.created_at < NOW() - INTERVAL '7 days'
        AND r.files_cleaned = false
        AND ri.file_url IS NOT NULL
    `);

    console.log(`  - ${rejectedRequests.rows.length} dosya bulundu`);

    for (const row of rejectedRequests.rows) {
      await deleteFile(row.file_url);
      console.log(`  - Silindi: ${row.file_name} (Talep: ${row.request_number})`);
    }

    // Reddedilen talepleri isaretleme
    await client.query(`
      UPDATE requests 
      SET files_cleaned = true 
      WHERE status = 'rejected' 
        AND created_at < NOW() - INTERVAL '7 days'
        AND files_cleaned = false
    `);

    // 2. 1 yil boyunca islem gormemis talepler
    console.log('\\n[2] 1 yildir inaktif talepler kontrol ediliyor...');
    
    const inactiveRequests = await client.query(`
      SELECT r.id, r.request_number, ri.file_url, ri.file_name
      FROM requests r
      JOIN request_items ri ON ri.request_id = r.id
      WHERE r.last_activity_at < NOW() - INTERVAL '365 days'
        AND r.files_cleaned = false
        AND ri.file_url IS NOT NULL
    `);

    console.log(`  - ${inactiveRequests.rows.length} dosya bulundu`);

    for (const row of inactiveRequests.rows) {
      await deleteFile(row.file_url);
      console.log(`  - Silindi: ${row.file_name} (Talep: ${row.request_number})`);
    }

    // Inaktif talepleri isaretleme
    await client.query(`
      UPDATE requests 
      SET files_cleaned = true 
      WHERE last_activity_at < NOW() - INTERVAL '365 days'
        AND files_cleaned = false
    `);

    // 3. Tamamlanmis ve 1 yil gecmis talepler (tekrar siparis referansi yoksa)
    console.log('\\n[3] 1 yildir tamamlanmis talepler kontrol ediliyor...');
    
    const completedRequests = await client.query(`
      SELECT r.id, r.request_number, ri.file_url, ri.file_name
      FROM requests r
      JOIN request_items ri ON ri.request_id = r.id
      LEFT JOIN reorder_templates rt ON rt.original_request_id = r.id
      WHERE r.status = 'completed'
        AND r.updated_at < NOW() - INTERVAL '365 days'
        AND r.files_cleaned = false
        AND ri.file_url IS NOT NULL
        AND rt.id IS NULL
    `);

    console.log(`  - ${completedRequests.rows.length} dosya bulundu`);

    for (const row of completedRequests.rows) {
      await deleteFile(row.file_url);
      console.log(`  - Silindi: ${row.file_name} (Talep: ${row.request_number})`);
    }

    // Tamamlanmis talepleri isaretleme
    await client.query(`
      UPDATE requests 
      SET files_cleaned = true 
      WHERE id IN (
        SELECT r.id FROM requests r
        LEFT JOIN reorder_templates rt ON rt.original_request_id = r.id
        WHERE r.status = 'completed'
          AND r.updated_at < NOW() - INTERVAL '365 days'
          AND r.files_cleaned = false
          AND rt.id IS NULL
      )
    `);

    // Log kaydi
    const totalDeleted = rejectedRequests.rows.length + inactiveRequests.rows.length + completedRequests.rows.length;
    
    if (totalDeleted > 0) {
      await client.query(`
        INSERT INTO file_cleanup_logs (files_deleted, reason, cleaned_at)
        VALUES ($1, 'scheduled_cleanup', NOW())
      `, [JSON.stringify({
        rejected: rejectedRequests.rows.length,
        inactive: inactiveRequests.rows.length,
        completed: completedRequests.rows.length,
        total: totalDeleted
      })]);
    }

    await client.query('COMMIT');

    console.log('\\n==========================================');
    console.log('Temizlik Tamamlandi!');
    console.log(`Toplam silinen dosya: ${totalDeleted}`);
    console.log('==========================================');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('HATA:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function deleteFile(fileUrl) {
  if (!fileUrl) return;
  
  // /api/files/filename.ext formatindan dosya adini al
  const fileName = fileUrl.split('/').pop();
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error(`  - Dosya silinemedi: ${filePath}`, error.message);
  }
  return false;
}

// Script'i calistir
cleanupFiles().catch(console.error);
