const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

// POST /api/auth/login — 管理员登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isValid = bcrypt.compareSync(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: '登录成功', token });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// POST /api/auth/register — 初始化管理员（只允许创建一次）
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  try {
    const existing = await pool.query('SELECT id FROM admins LIMIT 1');
    if (existing.rows.length > 0) {
      return res.status(403).json({ message: '管理员已存在' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await pool.query(
      'INSERT INTO admins (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    res.json({ message: '管理员创建成功，请登录' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
