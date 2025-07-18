// galeri.js
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

// GET all galeri
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM galeri ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET galeri by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM galeri WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Galeri tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST (tambah galeri)
router.post('/', upload.single('file_foto'), async (req, res) => {
  try {
    let file_foto = req.body.file_foto;
    if (req.file) {
      file_foto = req.file.filename;
    }
    if (!file_foto) {
      return res.status(400).json({ success: false, error: 'File foto diperlukan' });
    }
    const [result] = await pool.query(
      'INSERT INTO galeri (file_foto, created_at) VALUES (?, NOW())',
      [file_foto]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Galeri berhasil ditambahkan' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT (update galeri)
router.put('/:id', upload.single('file_foto'), async (req, res) => {
  try {
    const { id } = req.params;
    let file_foto = req.body.file_foto;
    if (req.file) {
      // Hapus file lama jika ada
      const [rows] = await pool.query('SELECT file_foto FROM galeri WHERE id = ?', [id]);
      const oldFile = rows.length > 0 ? rows[0].file_foto : null;
      const uploadDir = path.join(__dirname, '../public/images/');
      if (oldFile && oldFile !== req.file.filename) {
        const oldPath = path.join(uploadDir, oldFile);
        try { require('fs').unlinkSync(oldPath); } catch {}
      }
      file_foto = req.file.filename;
    } else {
      // Jika tidak upload file baru, ambil file lama dari DB
      const [rows] = await pool.query('SELECT file_foto FROM galeri WHERE id = ?', [id]);
      file_foto = rows.length > 0 ? rows[0].file_foto : null;
    }
    if (!file_foto) {
      return res.status(400).json({ success: false, error: 'File foto diperlukan untuk update' });
    }
    const [result] = await pool.query(
      'UPDATE galeri SET file_foto = ? WHERE id = ?',
      [file_foto, id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Galeri berhasil diupdate' });
    } else {
      res.status(404).json({ success: false, error: 'Galeri tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE galeri
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'ID diperlukan' });
    // Hapus file dari server jika ada
    const [rows] = await pool.query('SELECT file_foto FROM galeri WHERE id = ?', [id]);
    const file_foto = rows.length > 0 ? rows[0].file_foto : null;
    if (file_foto) {
      const uploadDir = path.join(__dirname, '../public/images/');
      const filePath = path.join(uploadDir, file_foto);
      try { require('fs').unlinkSync(filePath); } catch {}
    }
    const [result] = await pool.query('DELETE FROM galeri WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Galeri berhasil dihapus' });
    } else {
      res.status(404).json({ success: false, error: 'Galeri tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router; 