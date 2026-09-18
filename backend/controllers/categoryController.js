const db = require('../config/db');

// GET /api/categories - Menampilkan semua kategori
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id DESC');
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data kategori',
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/categories/:id - Menampilkan detail kategori
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// POST /api/categories - Membuat kategori baru
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validasi input
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Field "name" wajib diisi' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: newCategory[0],
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Nama kategori sudah digunakan' });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PUT /api/categories/:id - Mengedit kategori
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Field "name" wajib diisi' });
    }

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    await db.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
      name.trim(),
      description || null,
      id,
    ]);

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Kategori berhasil diperbarui', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// DELETE /api/categories/:id - Menghapus kategori
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    // Foreign key constraint - kategori masih dipakai oleh posts
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'Kategori tidak bisa dihapus karena masih digunakan oleh artikel',
      });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};
