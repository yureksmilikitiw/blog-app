const db = require('../config/db');

const POST_SELECT = `
  SELECT posts.id, posts.title, posts.content, posts.author,
         posts.category_id, categories.name AS category_name,
         posts.created_at, posts.updated_at
  FROM posts
  JOIN categories ON posts.category_id = categories.id
`;

// GET /api/posts - Menampilkan daftar artikel (mendukung ?category_id=)
exports.getAllPosts = async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = POST_SELECT;
    const params = [];

    if (category_id) {
      query += ' WHERE posts.category_id = ?';
      params.push(category_id);
    }
    query += ' ORDER BY posts.created_at DESC';

    const [rows] = await db.query(query, params);
    res.status(200).json({ success: true, message: 'Berhasil mengambil data artikel', data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/posts/:id - Menampilkan detail artikel
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`${POST_SELECT} WHERE posts.id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// POST /api/posts - Membuat artikel baru
exports.createPost = async (req, res) => {
  try {
    const { title, content, category_id, author } = req.body;

    // Validasi input
    const errors = [];
    if (!title || title.trim() === '') errors.push('Field "title" wajib diisi');
    if (!content || content.trim() === '') errors.push('Field "content" wajib diisi');
    if (!category_id) errors.push('Field "category_id" wajib diisi');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validasi gagal', errors });
    }

    // Pastikan category_id valid
    const [category] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (category.length === 0) {
      return res.status(400).json({ success: false, message: 'category_id tidak valid' });
    }

    const [result] = await db.query(
      'INSERT INTO posts (title, content, category_id, author) VALUES (?, ?, ?, ?)',
      [title.trim(), content.trim(), category_id, author || 'Admin']
    );

    const [newPost] = await db.query(`${POST_SELECT} WHERE posts.id = ?`, [result.insertId]);

    res.status(201).json({ success: true, message: 'Artikel berhasil dibuat', data: newPost[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PUT /api/posts/:id - Mengedit artikel
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category_id, author } = req.body;

    const errors = [];
    if (!title || title.trim() === '') errors.push('Field "title" wajib diisi');
    if (!content || content.trim() === '') errors.push('Field "content" wajib diisi');
    if (!category_id) errors.push('Field "category_id" wajib diisi');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validasi gagal', errors });
    }

    const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }

    const [category] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (category.length === 0) {
      return res.status(400).json({ success: false, message: 'category_id tidak valid' });
    }

    await db.query(
      'UPDATE posts SET title = ?, content = ?, category_id = ?, author = ? WHERE id = ?',
      [title.trim(), content.trim(), category_id, author || 'Admin', id]
    );

    const [updated] = await db.query(`${POST_SELECT} WHERE posts.id = ?`, [id]);
    res.status(200).json({ success: true, message: 'Artikel berhasil diperbarui', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// DELETE /api/posts/:id - Menghapus artikel
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};
