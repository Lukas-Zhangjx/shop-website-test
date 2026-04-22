const API_BASE = 'https://shop-website-test.onrender.com/api';

// 分类中文映射
const CATEGORY_MAP = {
  gold: { name: '黄金系列', icon: '✦' },
  silver: { name: '白银系列', icon: '◈' },
  jade: { name: '翡翠玉石', icon: '❋' },
};

// 获取 URL 参数中的分类
function getCategoryFromUrl() {
  return new URLSearchParams(window.location.search).get('category');
}

// 渲染单个商品卡片
function renderProductCard(product) {
  const category = CATEGORY_MAP[product.category] || { name: product.category, icon: '✦' };
  const imageHtml = product.image_path
    ? `<img src="${API_BASE.replace('/api', '')}${product.image_path}" alt="${product.name}">`
    : `<div class="product-img-placeholder">${category.icon}</div>`;

  return `
    <a href="pages/product.html?id=${product.id}" class="product-card">
      <div class="product-img">
        ${imageHtml}
        <div class="product-tag">${category.name}</div>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-sub">${product.description || ''}</div>
        <div class="product-price">¥ ${Number(product.price).toLocaleString()} <small>询价优惠</small></div>
      </div>
    </a>
  `;
}

// 加载商品列表
async function loadProducts(category = null) {
  const grid = document.getElementById('productGrid');
  const title = document.getElementById('productsTitle');

  // 更新标题
  if (category && CATEGORY_MAP[category]) {
    title.textContent = CATEGORY_MAP[category].name;
  } else {
    title.textContent = '热门臻品';
  }

  grid.innerHTML = '<div class="loading">加载中...</div>';

  try {
    const url = category
      ? `${API_BASE}/products?category=${category}`
      : `${API_BASE}/products`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.products || data.products.length === 0) {
      grid.innerHTML = '<div class="empty">暂无商品，敬请期待</div>';
      return;
    }

    grid.innerHTML = data.products.map(renderProductCard).join('');
  } catch (err) {
    grid.innerHTML = '<div class="empty">加载失败，请刷新重试</div>';
  }
}

// AI 客服
function toggleChat() {
  document.getElementById('aiChat').classList.toggle('open');
}

function appendMsg(text, type) {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = `msg msg-${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMsg() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;

  appendMsg(text, 'user');
  input.value = '';

  // TODO: 接入真实 AI API（RAG）
  // 目前先用关键词匹配模拟
  setTimeout(() => {
    const keyword = text.toLowerCase();
    let reply = '感谢您的询问！建议您直接来店体验，或拨打 138-0000-0000 咨询。';

    if (keyword.includes('翡翠') || keyword.includes('jade')) {
      reply = '我们翡翠系列均为A货，提供权威鉴定证书。目前有手镯、吊坠、平安扣等款式，欢迎来店鉴赏！';
    } else if (keyword.includes('黄金') || keyword.includes('gold')) {
      reply = '黄金系列按当日金价计算，足金999/千足金999.9均有，款式包括项链、戒指、手镯等。';
    } else if (keyword.includes('白银') || keyword.includes('silver')) {
      reply = '白银系列采用S990/S999足银，价格亲民，款式精美，适合日常佩戴和送礼。';
    } else if (keyword.includes('价格') || keyword.includes('多少钱')) {
      reply = '价格因款式和克重不同而异，欢迎来店或拨打 138-0000-0000 获取最新报价！';
    } else if (keyword.includes('地址') || keyword.includes('在哪')) {
      reply = '我们位于珠宝街88号，营业时间每日 09:00-20:00，欢迎光临！';
    }

    appendMsg(reply, 'ai');
  }, 600);
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  const category = getCategoryFromUrl();
  loadProducts(category);

  // 如果有分类参数，自动滚动到商品区域
  if (category) {
    setTimeout(() => {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
});
