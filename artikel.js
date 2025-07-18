// artikel.js
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

function validateInput(data) {
  if (typeof data !== 'string') return '';
  return data.trim();
}

// GET all artikel
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artikel ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// GET artikel by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artikel WHERE id = ?', [validateInput(req.params.id)]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Artikel tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// POST (create artikel)
router.post('/', upload.single('gambar'), async (req, res) => {
  try {
    let { judul, isi } = req.body;
    let gambar = req.body.gambar;
    if (req.file) {
      gambar = req.file.filename;
    }
    if (!judul || !isi || !gambar) {
      return res.status(400).json({ success: false, error: 'Judul, isi, dan gambar diperlukan' });
    }
    const [result] = await pool.query(
      'INSERT INTO artikel (judul, isi, gambar, created_at) VALUES (?, ?, ?, NOW())',
      [validateInput(judul), validateInput(isi), gambar]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Artikel berhasil ditambahkan' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// PUT (update artikel)
router.put('/:id', upload.single('gambar'), async (req, res) => {
  try {
    const { judul, isi } = req.body;
    let gambar = req.body.gambar;
    if (req.file) {
      gambar = req.file.filename;
    }
    if (!judul || !isi || !gambar) {
      return res.status(400).json({ success: false, error: 'Judul, isi, dan gambar diperlukan' });
    }
    const [result] = await pool.query(
      'UPDATE artikel SET judul = ?, isi = ?, gambar = ? WHERE id = ?',
      [validateInput(judul), validateInput(isi), gambar, validateInput(req.params.id)]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Artikel berhasil diperbarui' });
    } else {
      res.status(404).json({ success: false, error: 'Artikel tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// DELETE artikel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'ID diperlukan' });
    const [result] = await pool.query('DELETE FROM artikel WHERE id = ?', [validateInput(id)]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Artikel berhasil dihapus' });
    } else {
      res.status(404).json({ success: false, error: 'Artikel tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

module.exports = router; 