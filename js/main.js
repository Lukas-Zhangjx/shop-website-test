const API_BASE = 'https://shop-website-test.onrender.com/api';

// 分类图标（不依赖语言）
const CATEGORY_ICONS = {
  gold: '✦',
  silver: '◈',
  jade: '❋',
};

function getCategoryMap() {
  return {
    gold:   { name: t('category.gold'),   icon: '✦' },
    silver: { name: t('category.silver'), icon: '◈' },
    jade:   { name: t('category.jade'),   icon: '❋' },
  };
}

function getCategoryFromUrl() {
  return new URLSearchParams(window.location.search).get('category');
}

function getSubcategoryFromUrl() {
  return new URLSearchParams(window.location.search).get('subcategory');
}

// 渲染单个商品卡片
function renderProductCard(product) {
  const CATEGORY_MAP = getCategoryMap();
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
        <div class="product-price">¥ ${Number(product.price).toLocaleString()} <small>${t('products.enquiry')}</small></div>
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
      <a href="index.html?category=${category}" class="sub-tag ${!currentSub ? 'active' : ''}">${t('subcategory.all')}</a>
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

  const CATEGORY_MAP = getCategoryMap();
  if (category && CATEGORY_MAP[category]) {
    title.textContent = CATEGORY_MAP[category].name;
  } else {
    title.textContent = t('products.title');
  }

  grid.innerHTML = `<div class="loading">${t('products.loading')}</div>`;

  try {
    let url = `${API_BASE}/products?`;
    if (category) url += `category=${category}&`;
    if (subcategory) url += `subcategory=${encodeURIComponent(subcategory)}&`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.products || data.products.length === 0) {
      grid.innerHTML = `<div class="empty">${t('products.empty')}</div>`;
      return;
    }

    grid.innerHTML = data.products.map(renderProductCard).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty">${t('products.error')}</div>`;
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

  const typingId = 'typing-' + Date.now();
  appendMsg('...', 'ai', typingId);

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    appendMsg(data.reply, 'ai');
  } catch (err) {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    appendMsg(t('chat.error'), 'ai');
  }
}

// 语言切换后重新渲染动态内容
window.onLangChange = function () {
  const category = getCategoryFromUrl();
  const subcategory = getSubcategoryFromUrl();
  loadSubcategories(category);
  loadProducts(category, subcategory);
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  applyI18n();

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
