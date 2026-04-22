const express = require('express');
const cors = require('cors');
const path = require('path');

// 初始化数据库建表
const initDB = require('./db/init');
initDB().catch(err => console.error('数据库初始化失败:', err));

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

const app = express();

// 跨域配置（允许 GitHub Pages 前端访问）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 解析 JSON 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件：图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '一品翠坊后端运行中' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message || '服务器错误' });
});

module.exports = app;
