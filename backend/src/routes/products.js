const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/database');
const authMiddleware = require('../middleware/auth');

// 配置图片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('只支持 jpg、png、webp 格式'));
    }
  },
});

// GET /api/products/subcategories — 获取小分类列表
router.get('/subcategories', async (req, res) => {
  const { category } = req.query;
  try {
    let query = `SELECT DISTINCT subcategory, category FROM products WHERE is_active = 1 AND subcategory IS NOT NULL AND subcategory != ''`;
    const params = [];
    if (category) { query += ` AND category = $1`; params.push(category); }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// GET /api/products — 获取商品列表
router.get('/', async (req, res) => {
  const { category, subcategory, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];
    let i = 1;

    if (category) { query += ` AND category = $${i++}`; params.push(category); }
    if (subcategory) { query += ` AND subcategory = $${i++}`; params.push(subcategory); }

    query += ` ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // 统计总数
    let countQuery = 'SELECT COUNT(*) FROM products WHERE is_active = 1';
    const countParams = [];
    let j = 1;
    if (category) { countQuery += ` AND category = $${j++}`; countParams.push(category); }
    if (subcategory) { countQuery += ` AND subcategory = $${j++}`; countParams.push(subcategory); }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      products: result.rows,
      total: Number(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// GET /api/products/admin/all — 后台获取所有商品
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// GET /api/products/:id — 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND is_active = 1',
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// POST /api/products — 新增商品
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, price, category, subcategory, stock } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: '商品名、价格、分类为必填项' });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, subcategory, image_path, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, description || '', Number(price), category, subcategory || '', imagePath, Number(stock) || 1]
    );
    res.status(201).json({ message: '商品添加成功', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// PUT /api/products/:id — 修改商品
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, description, price, category, subcategory, stock, is_active } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ message: '商品不存在' });
    }

    const product = existing.rows[0];

    if (req.file && product.image_path) {
      const oldPath = path.join(__dirname, '..', product.image_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : product.image_path;

    await pool.query(
      `UPDATE products SET
        name = $1, description = $2, price = $3, category = $4, subcategory = $5,
        image_path = $6, stock = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9`,
      [
        name || product.name,
        description ?? product.description,
        Number(price) || product.price,
        category || product.category,
        subcategory !== undefined ? subcategory : product.subcategory,
        imagePath,
        Number(stock) ?? product.stock,
        is_active !== undefined ? Number(is_active) : product.is_active,
        req.params.id,
      ]
    );

    res.json({ message: '商品更新成功' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// DELETE /api/products/:id — 删除商品
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ message: '商品不存在' });
    }

    const product = existing.rows[0];
    if (product.image_path) {
      const imgPath = path.join(__dirname, '..', product.image_path);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: '商品删除成功' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
