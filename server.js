const express = require('express');
const cors = require('cors');
require('dotenv').config();

const todosRouter = require('./routes/todos');
const categoriesRouter = require('./routes/categories');
const visitorsRouter = require('./routes/visitors');  // 👈 Thêm dòng này


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép frontend gọi API
app.use(express.json()); // Parse JSON body

// Routes
app.use('/api/todos', todosRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/visitors', visitorsRouter);  // 👈 Thêm dòng này


// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Todo API đang chạy! 🚀' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});