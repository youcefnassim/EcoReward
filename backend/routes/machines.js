import express from 'express';
import { getDB } from '../db/database.js';

const router = express.Router();

// ─── GET /api/machines ────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  const db = getDB();
  const machines = db.prepare(`
    SELECT id, name, address, lat, lng, type, status, last_updated
    FROM machines
    ORDER BY name ASC
  `).all();
  res.json(machines);
});

// ─── GET /api/machines/:id ────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const db = getDB();
  const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!machine) return res.status(404).json({ error: 'Machine introuvable' });
  res.json(machine);
});

import crypto from 'node:crypto';

// ─── Middleware de Sécurité pour les Machines ─────────────────────────────
const verifyMachineKey = (req, res, next) => {
  const machineKey = req.headers['x-machine-key'];
  // Dans un vrai projet, utilise process.env.MACHINE_SECRET. Ici on met une clé statique forte pour la démo.
  const EXPECTED_KEY = process.env.MACHINE_SECRET || 'eco_rx94_v2_secure_99182xyz';
  
  if (!machineKey || machineKey !== EXPECTED_KEY) {
    console.warn(`[SECURITY] Tentative de triche détectée depuis l'IP: ${req.ip}`);
    return res.status(403).json({ error: 'Accès refusé. Clé machine invalide.' });
  }
  next();
};

// ─── POST /api/machines/smart-recycle ─────────────────────────────────────────
// Endpoint for Arduino/ESP32 to report physical recycling
router.post('/smart-recycle', verifyMachineKey, (req, res) => {
  const { rfid_uid, bottlesCount, machineId } = req.body;
  const db = getDB();

  if (!rfid_uid || !bottlesCount) {
    return res.status(400).json({ error: 'Missing rfid_uid or bottlesCount' });
  }

  // 1. Identify User (For demo, we map any new RFID to demo user)
  let user = db.prepare('SELECT * FROM users WHERE student_id = ?').get(rfid_uid);
  if (!user) {
    // Fallback to demo user if the RFID doesn't match a student ID
    user = db.prepare("SELECT * FROM users WHERE email = 'demo@univ.edu'").get();
    if (!user) return res.status(404).json({ error: 'User not found' });
  }

  // 2. Calculate points (e.g., 10 DA per bottle)
  const pointsEarned = bottlesCount * 10;
  const rid = crypto.randomUUID();

  // 3. Record History
  db.prepare(`
    INSERT INTO recycle_history (id, user_id, machine_id, item_type, points_earned)
    VALUES (?, ?, ?, ?, ?)
  `).run(rid, user.id, machineId || 'm1', 'plastic', pointsEarned);

  // 4. Update User stats
  db.prepare(`
    UPDATE users SET
      points = points + ?,
      total_recycled = total_recycled + ?,
      weekly_recycled = weekly_recycled + ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(pointsEarned, bottlesCount, bottlesCount, user.id);

  res.json({
    success: true,
    message: `Recycling recorded! Added ${pointsEarned} DA to ${user.full_name}`,
    pointsEarned,
    newTotal: user.points + pointsEarned
  });
});

export default router;
