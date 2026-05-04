import express from 'express';
import { getDB } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { randomUUID } from 'node:crypto';

const router = express.Router();

// ─── Get Leaderboard ────────────────────────────────────────────────────────
router.get('/leaderboard', authenticate, (req, res) => {
  const db = getDB();
  try {
    const leaderboard = db.prepare(`
      SELECT full_name AS fullName, points, student_id AS studentId, avatar 
      FROM users 
      ORDER BY points DESC 
      LIMIT 10
    `).all();
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ─── Simulate Scan & Recycle ────────────────────────────────────────────────
router.post('/scan', authenticate, (req, res) => {
  const { machineId } = req.body;
  const userId = req.user.uid;
  const db = getDB();

  try {
    const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(machineId);
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    if (machine.status !== 'active') return res.status(400).json({ error: 'Machine is not active' });

    // Generate random items and points (simulation)
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const pointsPerItem = machine.type === 'mixed' ? 15 : 10;
    const totalPoints = itemCount * pointsPerItem;

    const transaction = db.transaction(() => {
      // 1. Update user points
      db.prepare('UPDATE users SET points = points + ?, total_recycled = total_recycled + 1 WHERE id = ?').run(totalPoints, userId);
      
      // 2. Add to history
      db.prepare(`
        INSERT INTO recycle_history (id, user_id, machine_id, item_type, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `).run(randomUUID(), userId, machineId, machine.type, totalPoints);
    });

    transaction();

    const updatedUser = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
    
    res.json({
      message: 'Recyclage réussi !',
      pointsEarned: totalPoints,
      itemCount,
      newTotal: updatedUser.points
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process recycling' });
  }
});

// ─── Get User Badges ────────────────────────────────────────────────────────
router.get('/badges', authenticate, (req, res) => {
  const db = getDB();
  const userId = req.user.uid;
  try {
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
    const recycleCount = db.prepare('SELECT COUNT(*) as count FROM recycle_history WHERE user_id = ?').get(userId).count;

    const badges = [];
    if (recycleCount >= 1) badges.push({ id: 'b1', name: 'Éco-Pionnier', icon: '🌱', desc: 'Premier recyclage effectué' });
    if (user.points >= 500) badges.push({ id: 'b2', name: 'Gardien Vert', icon: '🛡️', desc: 'A cumulé 500 points' });
    if (recycleCount >= 10) badges.push({ id: 'b3', name: 'Recycleur Expert', icon: '♻️', desc: '10 sessions de recyclage' });
    if (user.points >= 2000) badges.push({ id: 'b4', name: 'Légende Éco', icon: '👑', desc: 'Niveau d\'impact légendaire' });

    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

export default router;
