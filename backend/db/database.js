import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'ecoreward.db');

// ─── Singleton DB connection ──────────────────────────────────────────────────
let db;

export const getDB = () => {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
};

// ─── Initialize Schema ────────────────────────────────────────────────────────
export const initDB = () => {
  const db = getDB();

  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      student_id  TEXT UNIQUE NOT NULL,
      full_name   TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      points      INTEGER DEFAULT 0,
      total_recycled INTEGER DEFAULT 0,
      weekly_recycled INTEGER DEFAULT 0,
      avatar      TEXT,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );

    -- Rewards table
    CREATE TABLE IF NOT EXISTS rewards (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      cost        INTEGER NOT NULL,
      icon        TEXT DEFAULT 'gift',
      color       TEXT DEFAULT 'green',
      category    TEXT DEFAULT 'general',
      stock       INTEGER DEFAULT -1,
      active      INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- Redemptions (history of reward claims)
    CREATE TABLE IF NOT EXISTS redemptions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      reward_id   TEXT NOT NULL,
      points_used INTEGER NOT NULL,
      redeemed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (reward_id) REFERENCES rewards(id)
    );

    -- Recycle history
    CREATE TABLE IF NOT EXISTS recycle_history (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      machine_id  TEXT,
      item_type   TEXT NOT NULL,
      points_earned INTEGER NOT NULL,
      recycled_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Machines (recycling points)
    CREATE TABLE IF NOT EXISTS machines (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      address     TEXT,
      lat         REAL NOT NULL,
      lng         REAL NOT NULL,
      type        TEXT DEFAULT 'plastic',
      status      TEXT DEFAULT 'active',
      last_updated TEXT DEFAULT (datetime('now'))
    );
  `);

  // ─── Seed default rewards if none exist ──────────────────────────────────
  const rewardCount = db.prepare('SELECT COUNT(*) as c FROM rewards').get().c;
  if (rewardCount === 0) {
    const insertReward = db.prepare(`
      INSERT INTO rewards (id, title, description, cost, icon, color, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const seedRewards = db.transaction(() => {
      insertReward.run('r1', 'Café Gratuit', 'Un café offert à la cafétéria du campus', 100, 'coffee', 'orange', 'food');
      insertReward.run('r2', 'Repas Resto U', 'Un repas complet au Restaurant Universitaire', 500, 'utensils', 'green', 'food');
      insertReward.run('r3', "Bon d'achat 1000 DA", 'Bon pour la librairie universitaire', 1000, 'book', 'purple', 'shopping');
      insertReward.run('r4', '10Go Internet', 'Crédit data mobile pour 30 jours', 750, 'wifi', 'blue', 'tech');
      insertReward.run('r5', 'Impression A4 x20', '20 feuilles imprimées au service reprographie', 300, 'printer', 'gray', 'services');
      insertReward.run('r6', 'Place Cinéma', 'Une place pour le cinéma étudiant', 1200, 'film', 'red', 'entertainment');
    });
    seedRewards();
    console.log('✅ Rewards seeded');
  }

  // ─── Seed machines if none exist or old seeds detected ───────────────────
  const oldMachine = db.prepare("SELECT * FROM machines WHERE name = 'Bibliothèque'").get();
  if (oldMachine) {
    db.prepare("DELETE FROM machines").run();
  }

  const machineCount = db.prepare('SELECT COUNT(*) as c FROM machines').get().c;
  if (machineCount === 0) {
    const insertMachine = db.prepare(`
      INSERT INTO machines (id, name, address, lat, lng, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const seedMachines = db.transaction(() => {
      insertMachine.run('m1', 'Grande Mosquée', 'Place de la Mairie, Tlemcen', 34.8825, -1.3115, 'mixed', 'active');
      insertMachine.run('m2', 'Palais El Mechouar', 'Centre Ville, Tlemcen', 34.8805, -1.3105, 'plastic', 'active');
      insertMachine.run('m3', 'Université (Nouveau Pôle)', 'Imama, Tlemcen', 34.8910, -1.3410, 'plastic', 'active');
      insertMachine.run('m4', 'Parc Lalla Setti', 'Plateau Lalla Setti', 34.8690, -1.3120, 'mixed', 'maintenance');
      insertMachine.run('m5', 'Ruines de Mansourah', 'Route de Mansourah', 34.8720, -1.3340, 'paper', 'active');
    });
    seedMachines();
    console.log('✅ Machines seeded in Tlemcen');
  }

  // ─── Seed demo user ───────────────────────────────────────────────────────
  const demoExists = db.prepare("SELECT id FROM users WHERE email = 'demo@univ.edu'").get();
  if (!demoExists) {
    const hash = bcrypt.hashSync('demo1234', 10);
    db.prepare(`
      INSERT INTO users (id, student_id, full_name, email, password, points, total_recycled, weekly_recycled, avatar)
      VALUES ('demo-user-001', 'STU12345', 'Étudiant Démo', 'demo@univ.edu', ?, 1500, 42, 7, 'É')
    `).run(hash);
    console.log('✅ Demo user created — email: demo@univ.edu | password: demo1234');
  }

  console.log('✅ Database initialized');
};
