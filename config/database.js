const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Lỗi kết nối database:', err.stack);
  }
  console.log('✅ Kết nối database thành công!');
  release();
});

module.exports = pool;