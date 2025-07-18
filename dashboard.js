// dashboard.js
const express = require('express');
const router = express.Router();
const pool = require('./config/database');

// Hapus CORS di sini, cukup di app.js

router.get('/', async (req, res) => {
  try {
    const stats = {};
    // Total artikel
    const [artikel] = await pool.query('SELECT COUNT(*) as total FROM artikel');
    stats.totalArtikel = artikel[0].total;
    // Total review
    const [review] = await pool.query('SELECT COUNT(*) as total FROM reviews');
    stats.totalReview = review[0].total;
    // Total galeri
    const [galeri] = await pool.query('SELECT COUNT(*) as total FROM galeri');
    stats.totalFoto = galeri[0].total;
    // Total best_of
    const [bestof] = await pool.query('SELECT COUNT(*) as total FROM best_of');
    stats.totalBestOf = bestof[0].total;
    // Average rating
    const [avg] = await pool.query('SELECT AVG(rating) as avg_rating FROM reviews');
    stats.averageRating = avg[0].avg_rating ? Math.round(avg[0].avg_rating * 10) / 10 : 0;
    // Recent reviews (last 5)
    const [recentReviews] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 5');
    stats.recentReviews = recentReviews;
    // Recent artikel (last 3)
    const [recentArtikel] = await pool.query('SELECT * FROM artikel ORDER BY created_at DESC LIMIT 3');
    stats.recentArtikel = recentArtikel;
    res.json({ success: true, data: stats });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

module.exports = router; 