const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const pool = require('../db/database');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 获取所有上架商品（RAG：商品数量少，全部给 AI 判断）
async function getAllProducts() {
  const result = await pool.query(
    `SELECT name, description, price, category, subcategory, stock
     FROM products
     WHERE is_active = 1
     ORDER BY category, name`
  );
  return result.rows;
}

// 从数据库搜索相关文档（RAG）
async function searchDocuments(question) {
  const keywords = question.replace(/[？?！!，,。.]/g, ' ').trim();
  const result = await pool.query(
    `SELECT filename, content FROM documents WHERE content ILIKE $1 LIMIT 3`,
    [`%${keywords}%`]
  );
  return result.rows;
}

// 格式化商品数据给 AI 看
function formatProducts(products) {
  if (!products.length) return '（暂无相关商品）';
  return products.map(p =>
    `- ${p.name}：${p.description || ''}，价格 ¥${p.price}，库存 ${p.stock} 件`
  ).join('\n');
}

// 格式化文档数据给 AI 看
function formatDocuments(docs) {
  if (!docs.length) return '';
  return docs.map(d => `【${d.filename}】\n${d.content.slice(0, 500)}`).join('\n\n');
}

// POST /api/chat — 客服对话
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: '请输入问题' });
  }

  try {
    // RAG：获取全部商品 + 搜索相关文档
    const [products, documents] = await Promise.all([
      getAllProducts(),
      searchDocuments(message),
    ]);

    const productContext = formatProducts(products);
    const documentContext = formatDocuments(documents);

    // 拼接 Prompt
    const systemPrompt = `你是一品翠坊珠宝店的智能客服，名叫"翠坊小助手"。
规则：
1. 态度亲切，语气专业，回答简洁
2. 只根据提供的商品和资料数据回答，不要编造信息
3. 如果问题超出数据范围，引导顾客来店或致电 138-0000-0000
4. 涉及价格时说明"以当日报价为准"
5. 回复用中文，控制在150字以内`;

    const userPrompt = `【当前商品库存】
${productContext}

${documentContext ? `【相关资料】\n${documentContext}\n` : ''}
顾客问题：${message}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || '抱歉，暂时无法回答，请拨打 138-0000-0000 咨询。';

    res.json({ reply });
  } catch (err) {
    console.error('Groq API 错误:', err.message);
    res.status(500).json({ reply: '客服暂时不可用，请拨打 138-0000-0000 咨询。' });
  }
});

module.exports = router;
