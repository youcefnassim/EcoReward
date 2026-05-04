import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecoreward-secret-key-2024';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { studentId, fullName, email, password } = req.body;

  if (!studentId || !fullName || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  const db = getDB();

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR student_id = ?').get(email, studentId);
  if (existing) {
    return res.status(409).json({ error: 'Email ou ID étudiant déjà utilisé' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const uid = uuidv4();
  const avatar = fullName.charAt(0).toUpperCase();

  db.prepare(`
    INSERT INTO users (id, student_id, full_name, email, password, points, total_recycled, weekly_recycled, avatar)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)
  `).run(uid, studentId, fullName, email, hashed, avatar);

  const token = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: { uid, studentId, fullName, email, points: 0, totalRecycled: 0, weeklyRecycled: 0, avatar },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      uid: user.id,
      studentId: user.student_id,
      fullName: user.full_name,
      email: user.email,
      points: user.points,
      totalRecycled: user.total_recycled,
      weeklyRecycled: user.weekly_recycled,
      avatar: user.avatar,
    },
  });
});

export default router;
