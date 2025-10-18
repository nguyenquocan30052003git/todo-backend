const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 1️⃣ GET - Lấy tất cả categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY created_at ASC'
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Lỗi GET categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 2️⃣ POST - Tạo category mới
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name không được để trống'
      });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
      [name.trim(), color || '#4CAF50']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi POST category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 3️⃣ PUT - Cập nhật category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name, color, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy category'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi PUT category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 4️⃣ DELETE - Xóa category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy category'
      });
    }

    res.json({
      success: true,
      message: 'Xóa thành công'
    });
  } catch (error) {
    console.error('Lỗi DELETE category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;