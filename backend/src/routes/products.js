const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// 配置图片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 文件名：时间戳 + 原始扩展名，避免重名
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 最大 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('只支持 jpg、png、webp 格式'));
    }
  },
});

// GET /api/products — 获取商品列表（用户端，只返回上架商品）
router.get('/', (req, res) => {
  const { category, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const products = db.prepare(query).all(...params);
  const total = db
    .prepare(
      `SELECT COUNT(*) as count FROM products WHERE is_active = 1${category ? ' AND category = ?' : ''}`
    )
    .get(...(category ? [category] : [])).count;

  res.json({ products, total, page: Number(page), limit: Number(limit) });
});

// GET /api/products/:id — 获取单个商品详情
router.get('/:id', (req, res) => {
  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND is_active = 1')
    .get(req.params.id);

  if (!product) {
    return res.status(404).json({ message: '商品不存在' });
  }

  res.json(product);
});

// ===== 以下接口需要管理员登录 =====

// GET /api/products/admin/all — 后台获取所有商品（含下架）
router.get('/admin/all', authMiddleware, (req, res) => {
  const products = db
    .prepare('SELECT * FROM products ORDER BY created_at DESC')
    .all();
  res.json(products);
});

// POST /api/products — 新增商品
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: '商品名、价格、分类为必填项' });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db
    .prepare(
      'INSERT INTO products (name, description, price, category, image_path, stock) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(name, description || '', Number(price), category, imagePath, Number(stock) || 1);

  res.status(201).json({ message: '商品添加成功', id: result.lastInsertRowid });
});

// PUT /api/products/:id — 修改商品
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const { name, description, price, category, stock, is_active } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: '商品不存在' });
  }

  // 如果上传了新图片，删除旧图片
  if (req.file && existing.image_path) {
    const oldPath = path.join(__dirname, '..', existing.image_path);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : existing.image_path;

  db.prepare(
    `UPDATE products SET
      name = ?, description = ?, price = ?, category = ?,
      image_path = ?, stock = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).run(
    name || existing.name,
    description ?? existing.description,
    Number(price) || existing.price,
    category || existing.category,
    imagePath,
    Number(stock) ?? existing.stock,
    is_active !== undefined ? Number(is_active) : existing.is_active,
    req.params.id
  );

  res.json({ message: '商品更新成功' });
});

// DELETE /api/products/:id — 删除商品
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: '商品不存在' });
  }

  // 删除对应图片文件
  if (existing.image_path) {
    const imgPath = path.join(__dirname, '..', existing.image_path);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: '商品删除成功' });
});

module.exports = router;
