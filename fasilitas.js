// fasilitas.js
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

// GET all fasilitas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fasilitas ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET fasilitas by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fasilitas WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Fasilitas tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST (tambah fasilitas)
router.post('/', upload.single('gambar'), async (req, res) => {
  try {
    const { nama, deskripsi, status_aktif } = req.body;
    let gambar = req.body.gambar;
    if (req.file) {
      gambar = req.file.filename;
    }
    const now = new Date();
    if (!nama || !deskripsi || !gambar) {
      return res.status(400).json({ success: false, error: 'Nama, deskripsi, dan gambar diperlukan' });
    }
    const [result] = await pool.query(
      'INSERT INTO fasilitas (nama, deskripsi, gambar, status_aktif, create_at, update_at) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, deskripsi, gambar, status_aktif ? parseInt(status_aktif) : 1, now, now]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Fasilitas berhasil ditambahkan' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT (update fasilitas)
router.put('/:id', upload.single('gambar'), async (req, res) => {
  try {
    const { nama, deskripsi, status_aktif } = req.body;
    let gambar = req.body.gambar;
    if (req.file) {
      gambar = req.file.filename;
    } else {
      // Jika tidak upload gambar baru, ambil gambar lama dari DB
      const [rows] = await pool.query('SELECT gambar FROM fasilitas WHERE id = ?', [req.params.id]);
      gambar = rows.length > 0 ? rows[0].gambar : null;
    }
    const now = new Date();
    if (!nama || !deskripsi || !gambar) {
      return res.status(400).json({ success: false, error: 'Nama, deskripsi, dan gambar diperlukan' });
    }
    const [result] = await pool.query(
      'UPDATE fasilitas SET nama=?, deskripsi=?, gambar=?, status_aktif=?, update_at=? WHERE id=?',
      [nama, deskripsi, gambar, status_aktif ? parseInt(status_aktif) : 1, now, req.params.id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Fasilitas berhasil diupdate' });
    } else {
      res.status(404).json({ success: false, error: 'Fasilitas tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE fasilitas
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'ID diperlukan' });
    const [result] = await pool.query('DELETE FROM fasilitas WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Fasilitas berhasil dihapus' });
    } else {
      res.status(404).json({ success: false, error: 'Fasilitas tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router; 