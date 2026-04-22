const API_BASE = 'https://shop-website-test.onrender.com/api';

const CATEGORY_MAP = {
  gold: '黄金系列',
  silver: '白银系列',
  jade: '翡翠玉石',
};

// ===== Token 管理 =====
function getToken() { return localStorage.getItem('admin_token'); }
function setToken(token) { localStorage.setItem('admin_token', token); }
function clearToken() { localStorage.removeItem('admin_token'); }

// ===== 页面切换 =====
function showAdmin() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'block';
  loadProducts();
}

function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('adminPage').style.display = 'none';
}

// ===== 登录 =====
async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const errorEl = document.getElementById('loginError');

  errorEl.style.display = 'none';

  if (!username || !password) {
    errorEl.textContent = '请填写用户名和密码';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || '登录失败';
      errorEl.style.display = 'block';
      return;
    }

    setToken(data.token);
    showAdmin();
  } catch (err) {
    errorEl.textContent = '网络错误，请检查后端是否启动';
    errorEl.style.display = 'block';
  }
}

function logout() {
  clearToken();
  showLogin();
}

// ===== 商品列表 =====
async function loadProducts() {
  const tbody = document.getElementById('productTable');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999">加载中...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/products/admin/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (res.status === 401) { logout(); return; }

    const products = await res.json();

    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999">暂无商品，点击右上角新增</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(product => {
      const imgHtml = product.image_path
        ? `<img src="${API_BASE.replace('/api', '')}${product.image_path}" style="width:60px;height:60px;object-fit:cover">`
        : `<div style="width:60px;height:60px;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:1.5rem">✦</div>`;

      const catBadge = `badge-${product.category}`;
      const statusBadge = product.is_active ? 'badge-active' : 'badge-inactive';
      const statusText = product.is_active ? '上架' : '下架';
      const toggleText = product.is_active ? '下架' : '上架';

      return `
        <tr>
          <td>${imgHtml}</td>
          <td style="font-size:0.95rem">${product.name}</td>
          <td><span class="badge ${catBadge}">${CATEGORY_MAP[product.category] || product.category}</span></td>
          <td style="color:#c9a84c">¥ ${Number(product.price).toLocaleString()}</td>
          <td>${product.stock}</td>
          <td><span class="badge ${statusBadge}">${statusText}</span></td>
          <td>
            <button class="btn-edit" onclick="openModal(${product.id})">编辑</button>
            <button class="btn-toggle" onclick="toggleProduct(${product.id}, ${product.is_active})">${toggleText}</button>
            <button class="btn-delete" onclick="deleteProduct(${product.id}, '${product.name}')">删除</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#c0392b">加载失败，请刷新重试</td></tr>';
  }
}

// ===== 弹窗 =====
let editingProduct = null;

async function openModal(id = null) {
  editingProduct = null;
  document.getElementById('editId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('imgPreview').innerHTML =
    '<div class="img-preview-text">点击上传图片<br><small>支持 jpg、png、webp，最大 5MB</small></div>';

  if (id) {
    // 编辑模式：加载已有数据
    document.getElementById('modalTitle').textContent = '编辑商品';
    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      const product = await res.json();
      editingProduct = product;

      document.getElementById('editId').value = product.id;
      document.getElementById('fieldName').value = product.name;
      document.getElementById('fieldCategory').value = product.category;
      document.getElementById('fieldPrice').value = product.price;
      document.getElementById('fieldStock').value = product.stock;
      document.getElementById('fieldDesc').value = product.description || '';

      if (product.image_path) {
        document.getElementById('imgPreview').innerHTML =
          `<img src="${API_BASE.replace('/api', '')}${product.image_path}" alt="商品图">`;
      }
    } catch (err) {
      showToast('加载商品数据失败');
      return;
    }
  } else {
    document.getElementById('modalTitle').textContent = '新增商品';
  }

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// 图片预览
function previewImage(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('imgPreview').innerHTML =
      `<img src="${e.target.result}" alt="预览">`;
  };
  reader.readAsDataURL(input.files[0]);
}

// ===== 保存商品 =====
async function saveProduct() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('fieldName').value.trim();
  const category = document.getElementById('fieldCategory').value;
  const price = document.getElementById('fieldPrice').value;
  const stock = document.getElementById('fieldStock').value;
  const description = document.getElementById('fieldDesc').value.trim();
  const imageFile = document.getElementById('fieldImage').files[0];

  if (!name || !category || !price) {
    showToast('商品名、分类、价格为必填项');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('price', price);
  formData.append('stock', stock || 1);
  formData.append('description', description);
  if (imageFile) formData.append('image', imageFile);

  try {
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || '保存失败');
      return;
    }

    showToast(id ? '商品更新成功' : '商品添加成功');
    closeModal();
    loadProducts();
  } catch (err) {
    showToast('网络错误，请重试');
  }
}

// ===== 上下架 =====
async function toggleProduct(id, currentStatus) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: currentStatus ? 0 : 1 }),
    });

    if (!res.ok) { showToast('操作失败'); return; }
    showToast(currentStatus ? '已下架' : '已上架');
    loadProducts();
  } catch (err) {
    showToast('网络错误');
  }
}

// ===== 删除商品 =====
async function deleteProduct(id, name) {
  if (!confirm(`确定要删除「${name}」吗？此操作不可撤销。`)) return;

  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!res.ok) { showToast('删除失败'); return; }
    showToast('商品已删除');
    loadProducts();
  } catch (err) {
    showToast('网络错误');
  }
}

// ===== Toast 提示 =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 已登录则直接进后台
  if (getToken()) {
    showAdmin();
  } else {
    showLogin();
  }
});
