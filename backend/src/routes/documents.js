const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const pool = require('../db/database');
const authMiddleware = require('../middleware/auth');

// PDF 存内存，解析完不保存文件
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 最大 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只支持 PDF 格式'));
    }
  },
});

// GET /api/documents — 获取所有文档
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, filename, created_at FROM documents ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// POST /api/documents — 上传 PDF
router.post('/', authMiddleware, upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '请选择 PDF 文件' });
  }

  try {
    // 解析 PDF 提取文字
    const data = await pdfParse(req.file.buffer);
    const content = data.text.trim();

    if (!content) {
      return res.status(400).json({ message: 'PDF 内容为空或无法解析' });
    }

    await pool.query(
      'INSERT INTO documents (filename, content) VALUES ($1, $2)',
      [req.file.originalname, content]
    );

    res.status(201).json({ message: `PDF 上传成功，已提取 ${content.length} 字` });
  } catch (err) {
    console.error('PDF 解析错误:', err.message);
    res.status(500).json({ message: 'PDF 解析失败，请确认文件有效' });
  }
});

// DELETE /api/documents/:id — 删除文档
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id FROM documents WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: '文档不存在' });
    }
    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
    res.json({ message: '文档已删除' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
