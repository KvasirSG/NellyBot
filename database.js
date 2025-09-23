const sqlite3 = require('sqlite3').verbose();
const logtail = require('./utils/logger');

class Database {
    constructor() {
        this.db = new sqlite3.Database('./bot.db');
        this.init();
    }

    init() {
        this.db.serialize(() => {
            // Users table for RPG character data
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                street_name TEXT,
                background TEXT,
                backstory TEXT,
                level INTEGER DEFAULT 1,
                xp INTEGER DEFAULT 0,
                credits INTEGER DEFAULT 500,
                health INTEGER DEFAULT 100,
                max_health INTEGER DEFAULT 100,
                cybernetics INTEGER DEFAULT 0,
                street_cred INTEGER DEFAULT 0,
                netrunning INTEGER DEFAULT 0,
                combat INTEGER DEFAULT 0,
                tech INTEGER DEFAULT 0,
                last_daily DATETIME,
                last_hack DATETIME,
                last_failed_hack DATETIME,
                trace_level INTEGER DEFAULT 0,
                failed_hacks INTEGER DEFAULT 0,
                successful_hacks INTEGER DEFAULT 0,
                privacy_accepted DATETIME,
                character_created BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Items/Gear table
            this.db.run(`CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                rarity TEXT DEFAULT 'common',
                price INTEGER DEFAULT 0,
                stats TEXT,
                description TEXT
            )`);

            // User inventory
            this.db.run(`CREATE TABLE IF NOT EXISTS inventory (
                user_id TEXT,
                item_id INTEGER,
                quantity INTEGER DEFAULT 1,
                equipped BOOLEAN DEFAULT FALSE,
                FOREIGN KEY(user_id) REFERENCES users(user_id),
                FOREIGN KEY(item_id) REFERENCES items(id)
            )`);

            // Missions/Jobs table
            this.db.run(`CREATE TABLE IF NOT EXISTS missions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                difficulty TEXT DEFAULT 'easy',
                reward_credits INTEGER DEFAULT 100,
                reward_xp INTEGER DEFAULT 50,
                cooldown INTEGER DEFAULT 3600,
                requirements TEXT
            )`);

            logtail.info('🔌 Database initialized with cyberpunk RPG schema');
        });
    }

    getUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    createUser(userId, username) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)',
                [userId, username],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    updateUser(userId, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(userId);

        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE users SET ${fields} WHERE user_id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    getTopUsers(limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT username, level, xp, credits FROM users ORDER BY level DESC, xp DESC LIMIT ?',
                [limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    getUserCount() {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }

    getTotalCredits() {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT SUM(credits) as total FROM users', [], (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        });
    }

    resetUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE users SET
                level = 1,
                xp = 0,
                credits = 500,
                health = 100,
                max_health = 100,
                cybernetics = 0,
                street_cred = 0,
                netrunning = 0,
                combat = 0,
                tech = 0,
                last_daily = NULL,
                last_hack = NULL,
                last_failed_hack = NULL,
                trace_level = 0,
                failed_hacks = 0,
                successful_hacks = 0
                WHERE user_id = ?`,
                [userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    acceptPrivacy(userId, username) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            this.db.run(
                'INSERT OR REPLACE INTO users (user_id, username, privacy_accepted) VALUES (?, ?, ?)',
                [userId, username, now],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    createCharacter(userId, streetName, background, backstory) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET street_name = ?, background = ?, backstory = ?, character_created = TRUE WHERE user_id = ?',
                [streetName, background, backstory, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    hasCharacter(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT character_created, privacy_accepted FROM users WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? {
                        hasCharacter: row.character_created === 1,
                        hasPrivacyConsent: !!row.privacy_accepted
                    } : { hasCharacter: false, hasPrivacyConsent: false });
                }
            );
        });
    }

    deleteUserData(userId) {
        return new Promise((resolve, reject) => {
            // Also delete from inventory table
            this.db.serialize(() => {
                this.db.run('DELETE FROM inventory WHERE user_id = ?', [userId]);
                this.db.run('DELETE FROM users WHERE user_id = ?', [userId], function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        });
    }

    getUserPrivacyData(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;