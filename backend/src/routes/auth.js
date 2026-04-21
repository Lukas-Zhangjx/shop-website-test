const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

// POST /api/auth/login — 管理员登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

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
});

// POST /api/auth/register — 初始化管理员（只允许创建一次）
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  // 已有管理员则不允许再注册
  const existing = db.prepare('SELECT id FROM admins LIMIT 1').get();
  if (existing) {
    return res.status(403).json({ message: '管理员已存在' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run(
    username,
    hashedPassword
  );

  res.json({ message: '管理员创建成功，请登录' });
});

module.exports = router;
