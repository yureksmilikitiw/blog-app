const express = require('express');
const cors = require('cors');
require('dotenv').config();

const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);

// Root endpoint - cek server hidup
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blog App REST API is running',
    endpoints: {
      posts: '/api/posts',
      categories: '/api/categories',
    },
  });
});

// 404 handler - endpoint tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
