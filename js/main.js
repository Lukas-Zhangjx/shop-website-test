const API_BASE = 'https://shop-website-test.onrender.com/api';

const CATEGORY_MAP = {
  gold: { name: '黄金系列', icon: '✦' },
  silver: { name: '白银系列', icon: '◈' },
  jade: { name: '翡翠玉石', icon: '❋' },
};

function getCategoryFromUrl() {
  return new URLSearchParams(window.location.search).get('category');
}

function getSubcategoryFromUrl() {
  return new URLSearchParams(window.location.search).get('subcategory');
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
        <div class="product-tag">${product.subcategory || category.name}</div>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-sub">${product.description || ''}</div>
        <div class="product-price">¥ ${Number(product.price).toLocaleString()} <small>询价优惠</small></div>
      </div>
    </a>
  `;
}

// 加载小分类筛选栏
async function loadSubcategories(category) {
  const bar = document.getElementById('subcategoryBar');
  if (!bar || !category) return;

  try {
    const res = await fetch(`${API_BASE}/subcategories?category=${category}`);
    const data = await res.json();

    if (!data.length) { bar.style.display = 'none'; return; }

    const currentSub = getSubcategoryFromUrl();

    bar.innerHTML = `
      <a href="index.html?category=${category}" class="sub-tag ${!currentSub ? 'active' : ''}">全部</a>
      ${data.map(row => `
        <a href="index.html?category=${category}&subcategory=${encodeURIComponent(row.subcategory)}"
           class="sub-tag ${currentSub === row.subcategory ? 'active' : ''}">
          ${row.subcategory}
        </a>
      `).join('')}
    `;
    bar.style.display = 'flex';
  } catch (err) {
    bar.style.display = 'none';
  }
}

// 加载商品列表
async function loadProducts(category = null, subcategory = null) {
  const grid = document.getElementById('productGrid');
  const title = document.getElementById('productsTitle');

  if (category && CATEGORY_MAP[category]) {
    title.textContent = CATEGORY_MAP[category].name;
  } else {
    title.textContent = '热门臻品';
  }

  grid.innerHTML = '<div class="loading">加载中...</div>';

  try {
    let url = `${API_BASE}/products?`;
    if (category) url += `category=${category}&`;
    if (subcategory) url += `subcategory=${encodeURIComponent(subcategory)}&`;

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

function appendMsg(text, type, id = null) {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = `msg msg-${type}`;
  div.textContent = text;
  if (id) div.id = id;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMsg() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;

  appendMsg(text, 'user');
  input.value = '';

  // 显示"正在输入"提示
  const typingId = 'typing-' + Date.now();
  appendMsg('...', 'ai', typingId);

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    // 移除"正在输入"提示，显示真实回复
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    appendMsg(data.reply, 'ai');
  } catch (err) {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    appendMsg('网络错误，请稍后重试', 'ai');
  }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  const category = getCategoryFromUrl();
  const subcategory = getSubcategoryFromUrl();

  loadSubcategories(category);
  loadProducts(category, subcategory);

  if (category) {
    setTimeout(() => {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
});
