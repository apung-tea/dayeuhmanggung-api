// tentang.js
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

// GET data tentang (asumsi id=1)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tentang LIMIT 1');
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      // Return default data if no record exists
      res.json({
        success: true,
        data: {
          deskripsi_perkebunan: 'Perkebunan Dayeuhmanggung adalah perkebunan yang terletak di daerah yang subur dan memiliki pemandangan yang indah.',
          visi_misi: 'Visi: Menjadi perkebunan terdepan dalam pengelolaan sumber daya alam yang berkelanjutan. Misi: Mengembangkan perkebunan yang ramah lingkungan dan memberikan manfaat ekonomi bagi masyarakat sekitar.'
        }
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// PUT (update tentang, JSON)
router.put('/', async (req, res) => {
  try {
    const { deskripsi_perkebunan, visi_misi } = req.body;
    if (!deskripsi_perkebunan || !visi_misi) {
      return res.status(400).json({ success: false, error: 'Deskripsi perkebunan dan visi misi diperlukan' });
    }
    // Check if record exists
    const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM tentang');
    if (countRows[0].cnt > 0) {
      // Update existing record
      const [result] = await pool.query('UPDATE tentang SET deskripsi_perkebunan = ?, visi_misi = ? WHERE id = 1', [deskripsi_perkebunan, visi_misi]);
      res.json({ success: true, message: 'Data tentang berhasil diperbarui' });
    } else {
      // Insert new record
      const [result] = await pool.query('INSERT INTO tentang (deskripsi_perkebunan, visi_misi) VALUES (?, ?)', [deskripsi_perkebunan, visi_misi]);
      res.json({ success: true, message: 'Data tentang berhasil ditambahkan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// POST (upload/update file_foto dan/atau deskripsi)
router.post('/', upload.single('file_foto'), async (req, res) => {
  try {
    const deskripsi = req.body.deskripsi;
    let file_foto = null;
    if (req.file) {
      file_foto = req.file.filename;
    }
    if (!deskripsi && !file_foto) {
      return res.status(400).json({ success: false, error: 'Deskripsi atau file foto diperlukan' });
    }
    if (file_foto) {
      await pool.query('UPDATE tentang SET file_foto = ? WHERE id = 1', [file_foto]);
    }
    if (deskripsi) {
      await pool.query('UPDATE tentang SET deskripsi = ?, updated_at = NOW() WHERE id = 1', [deskripsi]);
    }
    res.json({ success: true, message: 'Data tentang berhasil diperbarui' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

module.exports = router; 