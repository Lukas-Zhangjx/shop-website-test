// ===== 国际化 / Internationalization =====

const TRANSLATIONS = {
  zh: {
    // 导航
    'nav.gold':    '黄金系列',
    'nav.silver':  '白银系列',
    'nav.jade':    '翡翠玉石',
    'nav.about':   '关于我们',
    'nav.contact': '联系我们',

    // Hero
    'hero.tag':      'YIPIN CUIFANG · 金银珠宝',
    'hero.title':    '匠心传承<br>一品成就',
    'hero.subtitle': '甄选上品翡翠 · 精工黄金白银 · 传承东方美学',
    'hero.enquiry':  '立即询价',
    'hero.browse':   '浏览商品',
    'hero.scroll':   '向下探索',

    // 分类区
    'section.collections.tag':   'COLLECTIONS',
    'section.collections.title': '甄选系列',
    'cat.gold.name':   '黄金系列',
    'cat.gold.desc':   '足金 · 千足金 · 黄金镶嵌',
    'cat.silver.name': '白银系列',
    'cat.silver.desc': 'S999 · S990 · 银镶宝石',
    'cat.jade.name':   '翡翠玉石',
    'cat.jade.desc':   'A货翡翠 · 和田玉 · 南红玛瑙',

    // 商品区
    'section.hot.tag':   'HOT ITEMS',
    'products.title':    '热门臻品',
    'products.loading':  '加载中...',
    'products.empty':    '暂无商品，敬请期待',
    'products.error':    '加载失败，请刷新重试',
    'products.enquiry':  '询价优惠',
    'subcategory.all':   '全部',

    // 品牌故事
    'section.story.tag':   'BRAND STORY',
    'story.title':         '匠心铸造<br>岁月为证',
    'story.text1':         '一品翠坊创立于2008年，扎根本地珠宝行业逾十六载。我们秉承"诚信为本、品质为先"的经营理念，专注于甄选上乘翡翠、足金黄金及精工白银饰品。',
    'story.text2':         '每一件商品均经过严格质检，翡翠制品提供权威鉴定证书，黄金制品按当日金价透明计价，让每一位顾客买得放心、戴得安心。',
    'stat.years':          '年匠心经营',
    'stat.customers':      '服务客户',
    'stat.quality':        '正品保证',

    // 页脚
    'footer.address.label': '地址',
    'footer.address':       '珠宝街88号一品翠坊旗舰店',
    'footer.phone.label':   '电话',
    'footer.hours.label':   '营业时间',
    'footer.hours':         '每日 09:00 — 20:00',
    'footer.copy':          '© 2024 一品翠坊 · 版权所有',

    // AI 客服
    'chat.name':        '翠坊智能客服',
    'chat.status':      '在线 · 随时为您服务',
    'chat.greeting':    '您好！欢迎光临一品翠坊 ✨\n请问您对哪类珠宝感兴趣？',
    'chat.placeholder': '输入您的问题...',
    'chat.send':        '发送',
    'chat.error':       '网络错误，请稍后重试',

    // 分类名（动态渲染用）
    'category.gold':   '黄金系列',
    'category.silver': '白银系列',
    'category.jade':   '翡翠玉石',

    // 商品详情页
    'detail.home':       '首页',
    'detail.loading':    '加载中...',
    'detail.not.found':  '商品不存在或已下架',
    'detail.price.note': '价格仅供参考，以当日报价为准',
    'detail.cat.label':  '分类',
    'detail.stock.label':'库存',
    'detail.stock.unit': '件',
    'detail.stock.out':  '暂时缺货',
    'detail.enquiry':    '立即询价',
    'detail.back':       '← 返回',
    'detail.no.desc':    '暂无描述',
  },

  en: {
    // Nav
    'nav.gold':    'Gold',
    'nav.silver':  'Silver',
    'nav.jade':    'Jade',
    'nav.about':   'About',
    'nav.contact': 'Contact',

    // Hero
    'hero.tag':      'YIPIN CUIFANG · FINE JEWELRY',
    'hero.title':    'Crafted with<br>Devotion',
    'hero.subtitle': 'Premium Jade · Fine Gold & Silver · Eastern Artistry',
    'hero.enquiry':  'Enquire Now',
    'hero.browse':   'Browse Items',
    'hero.scroll':   'Explore',

    // Collections
    'section.collections.tag':   'COLLECTIONS',
    'section.collections.title': 'Our Collections',
    'cat.gold.name':   'Gold Collection',
    'cat.gold.desc':   '24K · 999 Gold · Gold Inlay',
    'cat.silver.name': 'Silver Collection',
    'cat.silver.desc': 'S999 · S990 · Silver & Gems',
    'cat.jade.name':   'Jade & Gemstone',
    'cat.jade.desc':   'Grade-A Jade · Hetian Jade · Carnelian',

    // Products
    'section.hot.tag':   'HOT ITEMS',
    'products.title':    'Featured Items',
    'products.loading':  'Loading...',
    'products.empty':    'No products yet, stay tuned',
    'products.error':    'Failed to load, please refresh',
    'products.enquiry':  'Enquire',
    'subcategory.all':   'All',

    // Story
    'section.story.tag':   'BRAND STORY',
    'story.title':         'Mastercraft<br>Stands the Test of Time',
    'story.text1':         'Founded in 2008, Yipin Cuifang has been rooted in the local jewelry industry for over 16 years. We uphold "integrity first, quality foremost," specializing in premium jade, fine gold and silver jewelry.',
    'story.text2':         'Every piece undergoes rigorous quality inspection. Jade pieces come with authoritative certificates, and gold pricing is transparently tied to daily market rates — so every customer shops with confidence.',
    'stat.years':          'Years of Excellence',
    'stat.customers':      'Happy Customers',
    'stat.quality':        'Authenticity Guaranteed',

    // Footer
    'footer.address.label': 'Address',
    'footer.address':       'No.88 Jewelry Street, Yipin Cuifang Flagship',
    'footer.phone.label':   'Phone',
    'footer.hours.label':   'Hours',
    'footer.hours':         'Daily 09:00 — 20:00',
    'footer.copy':          '© 2024 Yipin Cuifang · All Rights Reserved',

    // AI Chat
    'chat.name':        'Cuifang Assistant',
    'chat.status':      'Online · Always here to help',
    'chat.greeting':    'Hello! Welcome to Yipin Cuifang ✨\nWhat type of jewelry can I help you with?',
    'chat.placeholder': 'Ask us anything...',
    'chat.send':        'Send',
    'chat.error':       'Network error, please try again',

    // Category names (dynamic)
    'category.gold':   'Gold Collection',
    'category.silver': 'Silver Collection',
    'category.jade':   'Jade & Gemstone',

    // Product detail
    'detail.home':       'Home',
    'detail.loading':    'Loading...',
    'detail.not.found':  'Product not found or unavailable',
    'detail.price.note': 'Price for reference only, subject to daily rates',
    'detail.cat.label':  'Category',
    'detail.stock.label':'Stock',
    'detail.stock.unit': 'pcs',
    'detail.stock.out':  'Out of stock',
    'detail.enquiry':    'Enquire Now',
    'detail.back':       '← Back',
    'detail.no.desc':    'No description available',
  },
};

// ===== 核心函数 =====

function getCurrentLang() {
  return localStorage.getItem('lang') || 'zh';
}

function t(key) {
  const lang = getCurrentLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key])
      || (TRANSLATIONS['zh'] && TRANSLATIONS['zh'][key])
      || key;
}

function applyI18n() {
  const lang = getCurrentLang();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  // 普通文本
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  // 含 HTML 标签（如 <br>）
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });

  // placeholder
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });

  // 语言切换按钮文字
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中';
}

function toggleLang() {
  const next = getCurrentLang() === 'zh' ? 'en' : 'zh';
  localStorage.setItem('lang', next);
  applyI18n();
  // 通知页面重新渲染动态内容
  if (typeof onLangChange === 'function') onLangChange();
}
