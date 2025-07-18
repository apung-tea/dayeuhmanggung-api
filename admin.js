// admin.js
const express = require('express');
const router = express.Router();
const pool = require('./config/database');
const multer = require('multer');
const bcrypt = require('bcryptjs');

// Hapus CORS di sini, cukup di app.js

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET data admin (asumsi id=1)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nama, email, username, no_telp, alamat, foto, role, tempat_lahir, tanggal_lahir, negara, kota, kode_pos, update_at, create_at FROM admin WHERE id = 1 LIMIT 1');
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.json({ success: false, message: 'Data admin tidak ditemukan' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

// GET hash password (opsional)
router.get('/hash', (req, res) => {
  const plain = req.query.hash;
  if (!plain) return res.status(400).send('No hash param');
  const hash = bcrypt.hashSync(plain, 10);
  res.send(hash);
});

// POST (update data admin, login, upload foto)
router.post('/', upload.single('foto'), async (req, res) => {
  const id = 1;
  try {
    // Login
    if (req.body.login) {
      const { username, password } = req.body;
      const [rows] = await pool.query('SELECT * FROM admin WHERE username = ? LIMIT 1', [username]);
      if (rows.length > 0) {
        const admin = rows[0];
        if (bcrypt.compareSync(password, admin.password)) {
          return res.json({ success: true, message: 'Login berhasil' });
        } else {
          return res.json({ success: false, message: 'Password salah!' });
        }
      } else {
        return res.json({ success: false, message: 'Username tidak ditemukan!' });
      }
    }
    // Upload foto profil (base64)
    if (req.file) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      await pool.query('UPDATE admin SET foto=?, update_at=NOW() WHERE id=?', [base64, id]);
      return res.json({ success: true, message: 'Foto profil berhasil diupload', foto: base64 });
    }
    // Update data admin
    const fields = ['nama','username','email','password','no_telp','alamat','foto','role','tempat_lahir','tanggal_lahir','negara','kota','kode_pos'];
    const updates = [];
    const values = [];
    fields.forEach(f => {
      if (req.body[f]) {
        if (f === 'password') {
          updates.push('password=?');
          values.push(bcrypt.hashSync(req.body[f], 10));
        } else {
          updates.push(`${f}=?`);
          values.push(req.body[f]);
        }
      }
    });
    if (updates.length === 0) {
      return res.json({ success: false, message: 'Tidak ada data yang diupdate' });
    }
    updates.push('update_at=NOW()');
    const sql = `UPDATE admin SET ${updates.join(', ')} WHERE id=?`;
    values.push(id);
    await pool.query(sql, values);
    res.json({ success: true, message: 'Profile berhasil diupdate' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

module.exports = router; 