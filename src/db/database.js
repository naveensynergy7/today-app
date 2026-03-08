import * as SQLite from 'expo-sqlite';

const DB_NAME = 'today.db';
let db = null;

export async function initDb() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export async function getTasksByDate(date) {
  const database = getDb();
  const rows = await database.getAllAsync(
    'SELECT * FROM tasks WHERE date = ? ORDER BY sort_order ASC, id ASC',
    date
  );
  return rows;
}

export async function addTask(title, description, date) {
  const database = getDb();
  const now = new Date().toISOString();
  const maxOrder = await database.getFirstAsync(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM tasks WHERE date = ?',
    date
  );
  const sortOrder = maxOrder?.next_order ?? 0;
  const result = await database.runAsync(
    'INSERT INTO tasks (title, description, date, done, sort_order, created_at) VALUES (?, ?, ?, 0, ?, ?)',
    title || 'Untitled',
    description || '',
    date,
    sortOrder,
    now
  );
  return result.lastInsertRowId;
}

export async function setTaskDone(id, done) {
  const database = getDb();
  await database.runAsync('UPDATE tasks SET done = ? WHERE id = ?', done ? 1 : 0, id);
}

export async function updateTaskOrder(date, orderedIds) {
  const database = getDb();
  for (let i = 0; i < orderedIds.length; i++) {
    await database.runAsync('UPDATE tasks SET sort_order = ? WHERE id = ? AND date = ?', i, orderedIds[i], date);
  }
}

export async function deleteTask(id) {
  const database = getDb();
  await database.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function rolloverIncompleteTasks(fromDate) {
  const database = getDb();
  const nextDate = getNextDate(fromDate);
  await database.runAsync(
    'UPDATE tasks SET date = ? WHERE date = ? AND done = 0',
    nextDate,
    fromDate
  );
}

function getNextDate(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function getCompletionStatsForDate(date) {
  const database = getDb();
  const row = await database.getFirstAsync(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done FROM tasks WHERE date = ?',
    date
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0 };
}

export async function getCompletionStatsForRange(startDate, endDate) {
  const database = getDb();
  const row = await database.getFirstAsync(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done FROM tasks WHERE date >= ? AND date <= ?',
    startDate,
    endDate
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0 };
}

export async function getAllTimeStats() {
  const database = getDb();
  const row = await database.getFirstAsync(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done FROM tasks'
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0 };
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
