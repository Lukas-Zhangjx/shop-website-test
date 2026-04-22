const { Pool } = require('pg');

// 使用环境变量连接 Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase 需要 SSL
});

module.exports = pool;
