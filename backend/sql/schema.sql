-- ============================================================
-- db_blog_app - Skema Database Aplikasi Blog
-- Sesuai ketentuan soal: minimal 2 tabel (posts & categories)
-- dengan relasi Foreign Key antar tabel.
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_blog_app;
USE db_blog_app;

-- ------------------------------------------------------------
-- Tabel: categories
-- Menyimpan data kategori artikel
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabel: posts
-- Menyimpan data artikel. category_id adalah Foreign Key
-- yang berelasi ke tabel categories (relasi 1 kategori -> banyak post).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    content     TEXT NOT NULL,
    category_id INT NOT NULL,
    author      VARCHAR(100) DEFAULT 'Admin',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ------------------------------------------------------------
-- Data awal (opsional, untuk memudahkan testing)
-- ------------------------------------------------------------
INSERT INTO categories (name, description) VALUES
    ('Teknologi', 'Artikel seputar teknologi dan pemrograman'),
    ('Edukasi', 'Artikel seputar dunia pendidikan'),
    ('Lifestyle', 'Artikel seputar gaya hidup');

INSERT INTO posts (title, content, category_id, author) VALUES
    ('Mengenal REST API', 'REST API adalah salah satu arsitektur yang umum digunakan untuk komunikasi antara client dan server...', 1, 'Admin'),
    ('Tips Belajar Pemrograman', 'Belajar pemrograman akan lebih mudah jika dilakukan secara konsisten dan bertahap...', 2, 'Admin');
