const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件存在 backend/src/db/shop.db
const dbPath = path.join(__dirname, 'shop.db');
const db = new Database(dbPath);

// 开启 WAL 模式，提升性能
db.pragma('journal_mode = WAL');

module.exports = db;
