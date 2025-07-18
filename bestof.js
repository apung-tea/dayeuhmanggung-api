// bestof.js
const express = require('express');
const router = express.Router();
const pool = require('./config/database');
const multer = require('multer');
const path = require('path');

// Hapus CORS di sini, cukup di app.js

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});
const upload = multer({ storage });

// GET all best_of
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM best_of ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// GET best_of by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM best_of WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Best of tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// POST (tambah best_of)
router.post('/', upload.single('gambar'), async (req, res) => {
  try {
    const { judul, lokasi, deskripsi, durasi, jam_buka, harga_tiket } = req.body;
    let gambar = req.body.gambar;
    if (req.file) {
      gambar = req.file.filename;
    }
    if (!judul || !lokasi || !deskripsi || !durasi || !jam_buka || !harga_tiket || !gambar) {
      return res.status(400).json({ success: false, error: 'Semua field diperlukan dan gambar harus diupload' });
    }
    const [result] = await pool.query(
      'INSERT INTO best_of (judul, lokasi, deskripsi, durasi, jam_buka, harga_tiket, gambar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [judul, lokasi, deskripsi, durasi, jam_buka, harga_tiket, gambar]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Best of berhasil ditambahkan' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// PUT (update best_of)
router.put('/:id', upload.single('gambar'), async (req, res) => {
  try {
    const { judul, lokasi, deskripsi, durasi, jam_buka, harga_tiket } = req.body;
    let gambar = req.body.gambar;
    if (req.file) {
      gambar = req.file.filename;
    } else {
      // Jika tidak upload gambar baru, ambil gambar lama dari DB
      const [rows] = await pool.query('SELECT gambar FROM best_of WHERE id = ?', [req.params.id]);
      gambar = rows.length > 0 ? rows[0].gambar : null;
    }
    if (!judul || !lokasi || !deskripsi || !durasi || !jam_buka || !harga_tiket || !gambar) {
      return res.status(400).json({ success: false, error: 'Semua field diperlukan' });
    }
    const [result] = await pool.query(
      'UPDATE best_of SET judul=?, lokasi=?, deskripsi=?, durasi=?, jam_buka=?, harga_tiket=?, gambar=? WHERE id=?',
      [judul, lokasi, deskripsi, durasi, jam_buka, harga_tiket, gambar, req.params.id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Best of berhasil diupdate' });
    } else {
      res.status(404).json({ success: false, error: 'Best of tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// DELETE best_of
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'ID diperlukan' });
    const [result] = await pool.query('DELETE FROM best_of WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Best of berhasil dihapus' });
    } else {
      res.status(404).json({ success: false, error: 'Best of tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

module.exports = router; 