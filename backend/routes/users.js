import express from 'express';
import crypto from 'node:crypto';
import { getDB } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ─── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid);

  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  res.json({
    uid: user.id,
    studentId: user.student_id,
    fullName: user.full_name,
    email: user.email,
    points: user.points,
    totalRecycled: user.total_recycled,
    weeklyRecycled: user.weekly_recycled,
    avatar: user.avatar,
    createdAt: user.created_at,
  });
});

// ─── PUT /api/users/me ────────────────────────────────────────────────────────
router.put('/me', authenticate, (req, res) => {
  const { fullName, avatar } = req.body;
  const db = getDB();

  db.prepare(`
    UPDATE users SET
      full_name = COALESCE(?, full_name),
      avatar = COALESCE(?, avatar),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(fullName || null, avatar || null, req.user.uid);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid);
  res.json({
    uid: updated.id,
    studentId: updated.student_id,
    fullName: updated.full_name,
    email: updated.email,
    points: updated.points,
    totalRecycled: updated.total_recycled,
    weeklyRecycled: updated.weekly_recycled,
    avatar: updated.avatar,
  });
});

// ─── POST /api/users/recycle ─────────────────────────────────────────────────
// Simulate scanning a recycling machine → earn points
router.post('/recycle', authenticate, (req, res) => {
  const { machineId, itemType } = req.body;

  const pointsMap = { plastic: 10, paper: 5, glass: 15, metal: 20, mixed: 8 };
  const pointsEarned = pointsMap[itemType] || 10;

  const db = getDB();
  const rid = crypto.randomUUID();

  db.prepare(`
    INSERT INTO recycle_history (id, user_id, machine_id, item_type, points_earned)
    VALUES (?, ?, ?, ?, ?)
  `).run(rid, req.user.uid, machineId || null, itemType || 'plastic', pointsEarned);

  db.prepare(`
    UPDATE users SET
      points = points + ?,
      total_recycled = total_recycled + 1,
      weekly_recycled = weekly_recycled + 1,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(pointsEarned, req.user.uid);

  const user = db.prepare('SELECT points, total_recycled FROM users WHERE id = ?').get(req.user.uid);

  res.json({
    success: true,
    pointsEarned,
    newTotal: user.points,
    totalRecycled: user.total_recycled,
  });
});

export default router;
