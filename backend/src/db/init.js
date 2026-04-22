const db = require('./database');

// 建表：管理员账号
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 建表：商品
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('gold', 'silver', 'jade')),
    subcategory TEXT,
    image_path TEXT,
    stock INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 已有数据库迁移：添加 subcategory 字段（如果不存在）
try {
  db.exec(`ALTER TABLE products ADD COLUMN subcategory TEXT`);
} catch (e) {
  // 字段已存在，忽略
}

console.log('数据库初始化完成');

module.exports = db;
