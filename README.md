# Aplikasi Blog — ATS Kejuruan RPL 2026/2027

Proyek ini memenuhi seluruh ketentuan soal:
- Backend REST API (Node.js + Express.js)
- Database MySQL (`db_blog_app`) dengan 2 tabel berelasi (Foreign Key)
- Aplikasi Mobile (Flutter) sebagai client yang mengonsumsi REST API
- CRUD penuh untuk artikel (list, detail, create, edit, delete)

```
blog_app/
├── backend/                 # REST API (Node.js + Express + MySQL)
│   ├── config/db.js         # Koneksi database (connection pool)
│   ├── controllers/         # Logika CRUD (posts & categories)
│   ├── routes/               # Definisi endpoint
│   ├── sql/schema.sql       # Struktur database + data awal
│   ├── sql/erd.png          # Diagram ERD (gambar)
│   ├── server.js            # Entry point server
│   └── .env.example         # Contoh konfigurasi koneksi DB
└── mobile/                  # Aplikasi Flutter (client)
    └── lib/
        ├── models/           # Model data Post & Category
        ├── services/         # api_service.dart -> pemanggilan REST API
        ├── screens/          # Tampilan: list, detail, form (create/edit)
        └── main.dart
```

## 1. Menjalankan Backend

```bash
cd backend
npm install
cp .env.example .env          # sesuaikan DB_USER / DB_PASSWORD
mysql -u root -p < sql/schema.sql   # membuat database & tabel
npm run dev                   # atau: npm start
```

Server berjalan di `http://localhost:3000`. Cek dengan membuka
`http://localhost:3000/api/posts` di browser — harus muncul JSON daftar artikel.

## 2. Menjalankan Aplikasi Mobile

```bash
cd mobile
flutter pub get
flutter run
```

Di `lib/services/api_service.dart`, `baseUrl` sudah diset ke `http://10.0.2.2:3000/api`
(alamat khusus agar Android Emulator bisa mengakses `localhost` komputer host).
Jika menjalankan di device fisik, ganti dengan alamat IP lokal komputer
(mis. `http://192.168.1.5:3000/api`), pastikan HP & komputer di jaringan WiFi yang sama.

## 3. Struktur Database & ERD

- **categories** (`id`, `name`, `description`, `created_at`, `updated_at`)
- **posts** (`id`, `title`, `content`, `category_id` FK → categories.id, `author`, `created_at`, `updated_at`)

Relasi: **1 categories → banyak posts** (one-to-many), diterapkan lewat
`FOREIGN KEY (category_id) REFERENCES categories(id)`.
Lihat `backend/sql/erd.png` untuk diagramnya.

## 4. Daftar Endpoint REST API

| Method | Endpoint              | Keterangan                         | Status Sukses |
|--------|------------------------|-------------------------------------|----------------|
| GET    | /api/posts             | List semua artikel                  | 200            |
| GET    | /api/posts?category_id=1 | Filter artikel per kategori       | 200            |
| GET    | /api/posts/:id          | Detail 1 artikel                    | 200            |
| POST   | /api/posts              | Buat artikel baru                   | 201            |
| PUT    | /api/posts/:id          | Edit artikel                        | 200            |
| DELETE | /api/posts/:id          | Hapus artikel                       | 200            |
| GET    | /api/categories         | List semua kategori                 | 200            |
| POST   | /api/categories         | Buat kategori baru                  | 201            |
| PUT    | /api/categories/:id     | Edit kategori                       | 200            |
| DELETE | /api/categories/:id     | Hapus kategori                      | 200            |

Kode status error yang diterapkan: `400` (validasi gagal / input tidak valid),
`404` (data tidak ditemukan), `409` (konflik, misal nama kategori duplikat atau
kategori masih dipakai artikel), `500` (kesalahan server).

Contoh body request `POST /api/posts`:
```json
{
  "title": "Judul Artikel",
  "content": "Isi artikel...",
  "category_id": 1,
  "author": "Budi"
}
```

## 5. Alur Kerja Aplikasi (untuk dijelaskan ke penguji)

1. **Mobile (Flutter)** memanggil `ApiService` yang melakukan HTTP request
   (`http` package) ke **Backend**.
2. **Backend (Express)** menerima request di `routes/`, meneruskan ke
   `controllers/` untuk validasi input dan eksekusi query.
3. **Controller** menjalankan query SQL ke **MySQL** lewat connection pool
   (`config/db.js`), lalu mengembalikan response JSON dengan status code
   yang sesuai (200/201/400/404/409/500).
4. Data artikel **selalu diambil dari database** — tidak ada data hardcode;
   setiap perubahan (create/update/delete) langsung tersimpan di tabel `posts`.
5. Relasi `category_id` (Foreign Key) memastikan setiap artikel wajib
   terhubung ke kategori yang valid — dicek di controller sebelum insert/update.

## 6. Ide Pengembangan Lanjutan (poin tambahan/inovasi)

- Pagination & pencarian artikel (`?search=`, `?page=`)
- Upload gambar cover artikel
- Autentikasi (JWT) untuk membedakan admin/penulis
- Soft delete (kolom `deleted_at`) daripada hapus permanen
