import express from 'express';
import crypto from 'node:crypto';
import { getDB } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ─── GET /api/rewards ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const db = getDB();
  const rewards = db.prepare(`
    SELECT id, title, description, cost, icon, color, category, stock, active
    FROM rewards
    WHERE active = 1
    ORDER BY cost ASC
  `).all();
  res.json(rewards);
});

// ─── POST /api/rewards/:id/redeem ─────────────────────────────────────────────
router.post('/:id/redeem', authenticate, (req, res) => {
  const db = getDB();
  const reward = db.prepare('SELECT * FROM rewards WHERE id = ? AND active = 1').get(req.params.id);

  if (!reward) {
    return res.status(404).json({ error: 'Récompense introuvable ou inactive' });
  }

  const user = db.prepare('SELECT id, points FROM users WHERE id = ?').get(req.user.uid);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  if (user.points < reward.cost) {
    return res.status(400).json({
      error: 'Points insuffisants',
      required: reward.cost,
      available: user.points,
    });
  }

  // Check stock
  if (reward.stock === 0) {
    return res.status(400).json({ error: 'Récompense épuisée' });
  }

  // Atomic transaction
  const redeem = db.transaction(() => {
    db.prepare('UPDATE users SET points = points - ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(reward.cost, req.user.uid);

    if (reward.stock > 0) {
      db.prepare('UPDATE rewards SET stock = stock - 1 WHERE id = ?').run(reward.id);
    }

    db.prepare(`
      INSERT INTO redemptions (id, user_id, reward_id, points_used)
      VALUES (?, ?, ?, ?)
    `).run(crypto.randomUUID(), req.user.uid, reward.id, reward.cost);
  });

  redeem();

  const updatedUser = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.uid);

  res.json({
    success: true,
    message: `${reward.title} échangé avec succès !`,
    newPoints: updatedUser.points,
    pointsUsed: reward.cost,
  });
});

export default router;
