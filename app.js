// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== Middleware =====
app.use(cors()); // <--- Tambahkan ini
// CORS untuk development & produksi

// Static file untuk gambar
app.use('/images', express.static(path.join(__dirname, '../public/images')));
// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Routes =====
app.use('/api/artikel', require('./artikel'));
app.use('/api/admin', require('./admin'));
app.use('/api/review', require('./review'));
app.use('/api/galeri', require('./galeri'));
app.use('/api/fasilitas', require('./fasilitas'));
app.use('/api/tentang', require('./tentang'));
app.use('/api/dashboard', require('./dashboard'));
app.use('/api/bestof', require('./bestof'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API Dayeuhmanggung Node.js aktif!' });
});

// ===== 404 Not Found Handler =====
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// ===== Error Handler Global =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
}); 