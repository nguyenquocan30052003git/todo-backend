const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 1️⃣ GET - Lấy tất cả todos với category
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.completed, t.created_at, 
              t.category_id, c.name as category_name, c.color
       FROM todos t
       LEFT JOIN categories c ON t.category_id = c.id
       ORDER BY t.created_at DESC`
    );

    // try thành công thì sẽ thông báo success là true và data là result.rows
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Lỗi GET todos:', error);
    //nguoc lai neu try that bao thi se la fule va thong bao loi
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 2️⃣ POST - Tạo todo mới
router.post('/', async (req, res) => {
  try {
    const { title, category_id } = req.body;
    
    // Validate
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title không được để trống'
      });
    }

    const result = await pool.query(
      `INSERT INTO todos (title, completed, category_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, title, completed, category_id, created_at`,
      [title.trim(), false, category_id || null]
    );
    //pool.query() là lệnh gửi câu SQL đến PostgreSQL
    //$1 và $2 là placeholder (chỗ trống) để tránh lỗi SQL injection    
    //RETURNING * nghĩa là sau khi chèn xong, trả lại toàn bộ hàng mới thêm (cực kỳ hữu ích).


    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi POST todo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 3️⃣ PUT - Cập nhật todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, category_id } = req.body;
    //Lấy id từ URL parameter
    //URL: /api/todos/5 → id = 5
    //req.params → Thông số từ URL
    
     const result = await pool.query(
      `UPDATE todos SET title = $1, completed = $2, category_id = $3 
       WHERE id = $4 
       RETURNING id, title, completed, category_id, created_at`,
      [title, completed, category_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy todo'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Lỗi PUT todo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// 4️⃣ DELETE - Xóa todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy todo'
      });
    }

    res.json({
      success: true,
      message: 'Xóa thành công'
    });
  } catch (error) {
    console.error('Lỗi DELETE todo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;