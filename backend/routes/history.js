import express from 'express';
import { getDB } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ─── GET /api/history ─────────────────────────────────────────────────────────
// Combined recycle + redemptions history
router.get('/', authenticate, (req, res) => {
  const db = getDB();
  const limit = parseInt(req.query.limit) || 20;

  const recycles = db.prepare(`
    SELECT
      id, 'recycle' AS type, item_type, points_earned AS points,
      machine_id, NULL AS reward_title, recycled_at AS created_at
    FROM recycle_history
    WHERE user_id = ?
  `).all(req.user.uid);

  const redemptions = db.prepare(`
    SELECT
      rd.id, 'redeem' AS type, NULL AS item_type, rd.points_used AS points,
      NULL AS machine_id, r.title AS reward_title, rd.redeemed_at AS created_at
    FROM redemptions rd
    JOIN rewards r ON rd.reward_id = r.id
    WHERE rd.user_id = ?
  `).all(req.user.uid);

  const combined = [...recycles, ...redemptions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

  res.json(combined);
});

export default router;
