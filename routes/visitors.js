// routes/visitors.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ✅ Middleware để lấy client IP
function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
}

// 1️⃣ GET - Lấy tất cả visitors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM visitors ORDER BY last_visited DESC LIMIT 100'
    );
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Lỗi GET visitors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 2️⃣ GET - Lấy stats khách truy cập
router.get('/stats/overview', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(*) as total_visits,
        COUNT(DISTINCT device_type) as device_types,
        COUNT(DISTINCT country) as countries
      FROM visitors
    `);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi GET stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 3️⃣ POST - Thêm/Cập nhật visitor mới
router.post('/', async (req, res) => {
  try {
    const {
      user_agent,
      referer,
      country,
      city,
      device_type,
      page_url,
      session_id,
      visit_duration
    } = req.body;

    const ip_address = getClientIp(req);

    // Kiểm tra xem visitor này đã tồn tại chưa (dựa trên IP + Session)
    const checkResult = await pool.query(
      'SELECT id, visit_count FROM visitors WHERE ip_address = $1 AND session_id = $2',
      [ip_address, session_id]
    );

    if (checkResult.rows.length > 0) {
      // Cập nhật visitor cũ
      const visitor = checkResult.rows[0];
      const result = await pool.query(
        `UPDATE visitors 
         SET visit_count = $1, last_visited = NOW(), visit_duration = $2
         WHERE id = $3
         RETURNING *`,
        [visitor.visit_count + 1, visit_duration || 0, visitor.id]
      );
      res.json({
        success: true,
        message: 'Cập nhật visitor',
        data: result.rows[0]
      });
    } else {
      // Thêm visitor mới
      const result = await pool.query(
        `INSERT INTO visitors (ip_address, user_agent, referer, country, city, device_type, page_url, session_id, visit_duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [ip_address, user_agent, referer, country, city, device_type, page_url, session_id, visit_duration || 0]
      );
      res.status(201).json({
        success: true,
        message: 'Thêm visitor mới',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Lỗi POST visitor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 4️⃣ GET - Lấy visitors theo quốc gia
router.get('/by-country', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT country, COUNT(*) as count 
       FROM visitors 
       WHERE country IS NOT NULL
       GROUP BY country 
       ORDER BY count DESC`
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Lỗi GET by-country:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 5️⃣ GET - Lấy visitors theo device type
router.get('/by-device', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT device_type, COUNT(*) as count 
       FROM visitors 
       WHERE device_type IS NOT NULL
       GROUP BY device_type 
       ORDER BY count DESC`
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Lỗi GET by-device:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 6️⃣ DELETE - Xóa visitor cũ (cleanup)
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM visitors WHERE created_at < NOW() - INTERVAL \'30 days\''
    );
    res.json({
      success: true,
      message: `Đã xóa ${result.rowCount} visitor cũ`
    });
  } catch (error) {
    console.error('Lỗi DELETE cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;