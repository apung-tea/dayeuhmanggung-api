// review.js
const express = require('express');
const router = express.Router();
const pool = require('./config/database');

// Hapus CORS di sini, cukup di app.js

// GET all review
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET review by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Review tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST (tambah review)
router.post('/', async (req, res) => {
  try {
    const { nama, email, rating, review } = req.body;
    if (!nama || !email || !rating || !review) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }
    const [result] = await pool.query(
      'INSERT INTO reviews (nama, email, rating, review) VALUES (?, ?, ?, ?)',
      [nama.trim(), email.trim(), parseInt(rating), review.trim()]
    );
    res.status(201).json({ success: true, message: 'Review berhasil dikirim' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error: ' + e.message });
  }
});

// PUT (update status review)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status wajib diisi' });
    }
    const [result] = await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Status review berhasil diupdate' });
    } else {
      res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error: ' + e.message });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Review berhasil dihapus' });
    } else {
      res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error: ' + e.message });
  }
});

module.exports = router; 