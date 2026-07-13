const API = '/api';
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ===== Navigation =====
function navigate(page, data) {
  window.scrollTo(0, 0);
  const app = document.getElementById('app');
  switch (page) {
    case 'home': renderHome(app); break;
    case 'products': renderProducts(app); break;
    case 'product-detail': renderProductDetail(app, data); break;
    case 'login': renderLogin(app); break;
    case 'register': renderRegister(app); break;
    case 'cart': renderCart(app); break;
    case 'checkout': renderCheckout(app); break;
    case 'orders': renderOrders(app); break;
    case 'admin': renderAdmin(app); break;
  }
  updateNavbar();
  const navbar = document.getElementById('navbar');
  navbar.classList.remove('mobile-nav-open');
}

function toggleMobileMenu() {
  document.getElementById('navbar').classList.toggle('mobile-nav-open');
}

function updateNavbar() {
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  const navOrderHistory = document.getElementById('navOrderHistory');
  const navAdmin = document.getElementById('navAdmin');

  if (currentUser) {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    document.getElementById('userGreeting').textContent = `สวัสดี ${currentUser.firstName}`;
    navOrderHistory.style.display = 'inline';
    navAdmin.style.display = currentUser.role === 'admin' ? 'inline' : 'none';
  } else {
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
    navOrderHistory.style.display = 'none';
    navAdmin.style.display = 'none';
  }
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ===== API Helpers =====
async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
  return data;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatPrice(n) {
  return n.toLocaleString('th-TH') + ' ฿';
}

function addToCart(product, qty = 1) {
  const existing = cart.find(item => item._id === product._id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ _id: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, origin: product.origin, quantity: qty });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item._id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartQty(productId, qty) {
  const item = cart.find(i => i._id === productId);
  if (item) {
    item.quantity = Math.max(1, qty);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
  }
}

// ===== Auth =====
async function login(email, password) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('token', data.token);
  currentUser = data.user;
  showToast(`สวัสดี ${currentUser.firstName}!`);
  navigate('home');
}

async function register(userData) {
  const data = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  localStorage.setItem('token', data.token);
  currentUser = data.user;
  showToast('สมัครสมาชิกสำเร็จ!');
  navigate('home');
}

function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  showToast('ออกจากระบบแล้ว', 'info');
  navigate('home');
}

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      currentUser = await api('/auth/me');
    } catch {
      localStorage.removeItem('token');
      currentUser = null;
    }
  }
  updateNavbar();
}

// ===== Render Pages =====
function renderHome(app) {
  app.innerHTML = `
    <div class="hero">
      <div class="hero-content">
        <h1>เมล็ดกาแฟคุณภาพ คัดสรรจากทั่วโลก</h1>
        <p>ค้นพบกาแฟคุณภาพเยี่ยมจากแหล่งผลิตชั้นนำ คั่วสดใหม่ทุกสัปดาห์ เพื่อรสชาติที่สมบูรณ์แบบในทุกแก้ว</p>
        <button class="btn btn-accent btn-lg" onclick="navigate('products')">เลือกซื้อสินค้า</button>
      </div>
    </div>
    <div class="section">
      <h2 class="section-title">ทำไมต้องเลือกเรา?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">🌱</div>
          <h3>คัดสรรคุณภาพ</h3>
          <p>เมล็ดกาแฟจากแหล่งปลูกชั้นนำทั่วโลก ผ่านการคัดสรรอย่างพิถีพิถัน</p>
        </div>
        <div class="feature-card">
          <div class="icon">🔥</div>
          <h3>คั่วสดใหม่</h3>
          <p>คั่วสดทุกสัปดาห์ เพื่อรักษากลิ่นหอมและรสชาติที่ดีที่สุด</p>
        </div>
        <div class="feature-card">
          <div class="icon">🚚</div>
          <h3>จัดส่งทั่วประเทศ</h3>
          <p>บรรจุภัณฑ์คุณภาพสูง รักษาความสดตลอดการจัดส่ง</p>
        </div>
      </div>
    </div>
    <div class="section">
      <h2 class="section-title">สินค้าแนะนำ</h2>
      <p class="section-subtitle">เมล็ดกาแฟยอดนิยมที่คัดสรรมาเพื่อคุณ</p>
      <div class="product-grid" id="featuredProducts"><div class="loading">กำลังโหลด...</div></div>
    </div>
  `;
  loadFeaturedProducts();
}

async function loadFeaturedProducts() {
  try {
    const products = await api('/products');
    const container = document.getElementById('featuredProducts');
    container.innerHTML = products.slice(0, 4).map(p => productCard(p)).join('');
  } catch (e) {
    document.getElementById('featuredProducts').innerHTML = '<p style="text-align:center;color:#666">ไม่สามารถโหลดสินค้าได้</p>';
  }
}

function productCard(p) {
  return `
    <div class="product-card" onclick="navigate('product-detail','${p._id}')">
      <img src="${p.imageUrl}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'">
      <div class="product-card-body">
        <div class="product-origin">${p.origin}</div>
        <h3>${p.name}</h3>
        <div class="product-roast">${p.roastLevel}</div>
        <div class="price">${formatPrice(p.price)} <span>/ ${p.weight} ${p.unit}</span></div>
        <button class="add-btn" onclick="event.stopPropagation();addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">เพิ่มลงตะกร้า</button>
      </div>
    </div>
  `;
}

function renderProducts(app) {
  app.innerHTML = `
    <div class="section">
      <h1 class="section-title">สินค้าทั้งหมด</h1>
      <div class="filter-bar">
        <input type="text" id="searchInput" placeholder="🔍 ค้นหาสินค้า..." oninput="filterProducts()">
        <select id="originFilter" onchange="filterProducts()">
          <option value="">ทุกแหล่งที่มา</option>
        </select>
        <select id="roastFilter" onchange="filterProducts()">
          <option value="">ทุกระดับการคั่ว</option>
          <option value="Light">Light</option>
          <option value="Medium">Medium</option>
          <option value="Medium-Dark">Medium-Dark</option>
          <option value="Dark">Dark</option>
        </select>
      </div>
      <div class="product-grid" id="productGrid"><div class="loading">กำลังโหลด...</div></div>
    </div>
  `;
  loadAllProducts();
}

let allProducts = [];

async function loadAllProducts() {
  try {
    allProducts = await api('/products');
    const origins = [...new Set(allProducts.map(p => p.origin))];
    const originSelect = document.getElementById('originFilter');
    origins.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o; opt.textContent = o;
      originSelect.appendChild(opt);
    });
    renderProductGrid(allProducts);
  } catch (e) {
    document.getElementById('productGrid').innerHTML = '<p style="text-align:center;color:#666">ไม่สามารถโหลดสินค้าได้</p>';
  }
}

function filterProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const origin = document.getElementById('originFilter').value;
  const roast = document.getElementById('roastFilter').value;

  let filtered = allProducts;
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.origin.toLowerCase().includes(search));
  if (origin) filtered = filtered.filter(p => p.origin === origin);
  if (roast) filtered = filtered.filter(p => p.roastLevel === roast);
  renderProductGrid(filtered);
}

function renderProductGrid(products) {
  const grid = document.getElementById('productGrid');
  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;padding:40px">ไม่พบสินค้าที่ค้นหา</p>';
    return;
  }
  grid.innerHTML = products.map(p => productCard(p)).join('');
}

function renderProductDetail(app, productId) {
  app.innerHTML = '<div class="loading">กำลังโหลด...</div>';
  loadProductDetail(app, productId);
}

async function loadProductDetail(app, productId) {
  try {
    const p = await api(`/products/${productId}`);
    app.innerHTML = `
      <div class="product-detail">
        <div class="back-link" onclick="navigate('products')">← กลับไปหน้าสินค้า</div>
        <div class="product-detail-grid">
          <img class="product-detail-img" src="${p.imageUrl}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'">
          <div class="product-detail-info">
            <div class="origin-badge">${p.origin}</div>
            <h1>${p.name}</h1>
            <div class="product-roast">${p.roastLevel}</div>
            <p class="desc">${p.description}</p>
            <div class="detail-row"><span class="label">น้ำหนัก</span><span>${p.weight} ${p.unit}</span></div>
            <div class="detail-row"><span class="label">ระดับการคั่ว</span><span>${p.roastLevel}</span></div>
            <div class="detail-row"><span class="label">แหล่งที่มา</span><span>${p.origin}</span></div>
            <div class="price-big">${formatPrice(p.price)}</div>
            <div class="qty-control">
              <button onclick="changeDetailQty(-1)">−</button>
              <span id="detailQty">1</span>
              <button onclick="changeDetailQty(1)">+</button>
            </div>
            <button class="btn btn-primary btn-lg" style="width:100%" onclick="addDetailToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">เพิ่มลงตะกร้า</button>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    app.innerHTML = '<div class="section"><p style="text-align:center">ไม่พบสินค้า</p></div>';
  }
}

let detailQty = 1;
function changeDetailQty(d) {
  detailQty = Math.max(1, detailQty + d);
  document.getElementById('detailQty').textContent = detailQty;
}

function addDetailToCart(product) {
  addToCart(product, detailQty);
  detailQty = 1;
}

function renderLogin(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h2>เข้าสู่ระบบ</h2>
        <p class="subtitle">ยินดีต้อนรับกลับมา</p>
        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>อีเมล</label>
            <input type="email" id="loginEmail" required placeholder="example@email.com">
          </div>
          <div class="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" id="loginPassword" required placeholder="กรอกรหัสผ่าน">
          </div>
          <button class="btn btn-primary btn-lg" type="submit">เข้าสู่ระบบ</button>
        </form>
        <div class="link">ยังไม่มีบัญชี? <a onclick="navigate('register')">สมัครสมาชิก</a></div>
      </div>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    await login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRegister(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h2>สมัครสมาชิก</h2>
        <p class="subtitle">สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง</p>
        <form onsubmit="handleRegister(event)">
          <div class="form-row">
            <div class="form-group">
              <label>ชื่อ</label>
              <input type="text" id="regFirstName" required placeholder="ชื่อ">
            </div>
            <div class="form-group">
              <label>นามสกุล</label>
              <input type="text" id="regLastName" required placeholder="นามสกุล">
            </div>
          </div>
          <div class="form-group">
            <label>อีเมล</label>
            <input type="email" id="regEmail" required placeholder="example@email.com">
          </div>
          <div class="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input type="tel" id="regPhone" required placeholder="08X-XXX-XXXX">
          </div>
          <div class="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" id="regPassword" required minlength="6" placeholder="อย่างน้อย 6 ตัวอักษร">
          </div>
          <button class="btn btn-primary btn-lg" type="submit">สมัครสมาชิก</button>
        </form>
        <div class="link">มีบัญชีอยู่แล้ว? <a onclick="navigate('login')">เข้าสู่ระบบ</a></div>
      </div>
    </div>
  `;
}

async function handleRegister(e) {
  e.preventDefault();
  try {
    await register({
      firstName: document.getElementById('regFirstName').value,
      lastName: document.getElementById('regLastName').value,
      email: document.getElementById('regEmail').value,
      phone: document.getElementById('regPhone').value,
      password: document.getElementById('regPassword').value
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderCart(app) {
  if (cart.length === 0) {
    app.innerHTML = `
      <div class="cart-page">
        <h1>ตะกร้าสินค้า</h1>
        <div class="cart-empty">
          <p>🛒 ตะกร้าสินค้าว่างเปล่า</p>
          <button class="btn btn-primary" onclick="navigate('products')">เลือกซื้อสินค้า</button>
        </div>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  app.innerHTML = `
    <div class="cart-page">
      <h1>ตะกร้าสินค้า</h1>
      ${cart.map(item => `
        <div class="cart-item">
          <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'">
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            <div class="origin">${item.origin}</div>
            <div>${formatPrice(item.price)}/ชิ้น</div>
          </div>
          <div class="cart-item-qty">
            <button onclick="updateCartQty('${item._id}',${item.quantity - 1});renderCart(document.getElementById('app'))">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQty('${item._id}',${item.quantity + 1});renderCart(document.getElementById('app'))">+</button>
          </div>
          <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${item._id}');renderCart(document.getElementById('app'))">✕</button>
        </div>
      `).join('')}
      <div class="cart-summary">
        <div class="cart-summary-row"><span>ราคารวม</span><span>${formatPrice(subtotal)}</span></div>
        <div class="cart-summary-row"><span>ค่าจัดส่ง</span><span>${formatPrice(shipping)}</span></div>
        <div class="cart-summary-row total"><span>ยอดรวมทั้งหมด</span><span>${formatPrice(total)}</span></div>
        <button class="btn btn-primary btn-lg" onclick="${currentUser ? "navigate('checkout')" : "navigate('login')"}">ดำเนินการชำระเงิน</button>
      </div>
    </div>
  `;
}

function renderCheckout(app) {
  if (!currentUser) { navigate('login'); return; }
  if (cart.length === 0) { navigate('cart'); return; }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  app.innerHTML = `
    <div class="checkout-page">
      <h1>ชำระเงิน</h1>
      <div class="checkout-section">
        <h3>สรุปคำสั่งซื้อ</h3>
        ${cart.map(item => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding:8px 0"><span>ค่าจัดส่ง</span><span>${formatPrice(shipping)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:1.1rem;border-top:2px solid var(--border);margin-top:8px"><span>ยอดรวมทั้งหมด</span><span>${formatPrice(total)}</span></div>
      </div>
      <form onsubmit="handleCheckout(event)">
        <div class="checkout-section">
          <h3>ที่อยู่ในการจัดส่ง</h3>
          <div class="form-row">
            <div class="form-group"><label>ชื่อผู้รับ</label><input type="text" id="shipName" required value="${currentUser.firstName} ${currentUser.lastName}"></div>
            <div class="form-group"><label>เบอร์โทร</label><input type="tel" id="shipPhone" required value="${currentUser.phone}"></div>
          </div>
          <div class="form-group"><label>ที่อยู่</label><input type="text" id="shipAddress" required placeholder="บ้านเลขที่ ซอย ถนน"></div>
          <div class="form-row">
            <div class="form-group"><label>เขต/อำเภอ</label><input type="text" id="shipDistrict" required placeholder="เขต/อำเภอ"></div>
            <div class="form-group"><label>จังหวัด</label><input type="text" id="shipProvince" required placeholder="จังหวัด"></div>
          </div>
          <div class="form-group"><label>รหัสไปรษณีย์</label><input type="text" id="shipPostal" required placeholder="10XXX"></div>
        </div>
        <div class="checkout-section">
          <h3>ช่องทางการชำระเงิน</h3>
          <div class="payment-options">
            <div class="payment-option selected" onclick="selectPayment(this,'promptpay')">
              <div>📱</div><div>PromptPay</div>
            </div>
            <div class="payment-option" onclick="selectPayment(this,'bank_transfer')">
              <div>🏦</div><div>โอนผ่านธนาคาร</div>
            </div>
            <div class="payment-option" onclick="selectPayment(this,'credit_card')">
              <div>💳</div><div>บัตรเครดิต</div>
            </div>
            <div class="payment-option" onclick="selectPayment(this,'cod')">
              <div>💵</div><div>เก็บเงินปลายทาง</div>
            </div>
          </div>
        </div>
        <button class="btn btn-accent btn-lg" style="width:100%" type="submit">ยืนยันคำสั่งซื้อ</button>
      </form>
    </div>
  `;
}

let selectedPayment = 'promptpay';

function selectPayment(el, method) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedPayment = method;
}

async function handleCheckout(e) {
  e.preventDefault();
  if (!currentUser) { navigate('login'); return; }

  try {
    const items = cart.map(item => ({
      product: item._id,
      productName: item.name,
      unitPrice: item.price,
      quantity: item.quantity
    }));

    await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        paymentMethod: selectedPayment,
        shippingAddress: {
          name: document.getElementById('shipName').value,
          phone: document.getElementById('shipPhone').value,
          address: document.getElementById('shipAddress').value,
          district: document.getElementById('shipDistrict').value,
          province: document.getElementById('shipProvince').value,
          postalCode: document.getElementById('shipPostal').value
        }
      })
    });

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast('สั่งซื้อสำเร็จ! ขอบคุณครับ');
    navigate('orders');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function renderOrders(app) {
  if (!currentUser) { navigate('login'); return; }

  app.innerHTML = '<div class="orders-page"><div class="loading">กำลังโหลด...</div></div>';

  try {
    const orders = await api('/orders');
    const statusMap = { pending: 'รอดำเนินการ', confirmed: 'ยืนยันแล้ว', shipped: 'จัดส่งแล้ว', delivered: 'จัดส่งสำเร็จ', cancelled: 'ยกเลิก' };

    app.innerHTML = `
      <div class="orders-page">
        <h1>คำสั่งซื้อของฉัน</h1>
        ${orders.length === 0 ? '<p style="text-align:center;color:var(--text-secondary);padding:40px">ยังไม่มีคำสั่งซื้อ</p>' : ''}
        ${orders.map(o => `
          <div class="order-card">
            <div class="order-header">
              <div>
                <div class="order-id">คำสั่งซื้อ #${o._id.slice(-8).toUpperCase()}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary)">${new Date(o.createdAt).toLocaleDateString('th-TH')}</div>
              </div>
              <span class="order-status status-${o.status}">${statusMap[o.status] || o.status}</span>
            </div>
            <div class="order-body">
              <div class="order-items">
                ${o.items.map(item => `
                  <div class="order-item">
                    <span>${item.productName} x ${item.quantity}</span>
                    <span>${formatPrice(item.subtotal)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="order-total">ยอดรวม: ${formatPrice(o.totalAmount + (o.shippingFee || 0))}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    app.innerHTML = '<div class="orders-page"><p style="text-align:center;color:var(--danger)">ไม่สามารถโหลดคำสั่งซื้อได้</p></div>';
  }
}

async function renderAdmin(app) {
  if (!currentUser || currentUser.role !== 'admin') { navigate('home'); return; }

  app.innerHTML = `
    <div class="admin-page">
      <h1>จัดการร้านค้า</h1>
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="showAdminTab('products',this)">สินค้า</button>
        <button class="admin-tab" onclick="showAdminTab('inventory',this)">คลังสินค้า</button>
        <button class="admin-tab" onclick="showAdminTab('orders',this)">คำสั่งซื้อ</button>
        <button class="admin-tab" onclick="showAdminTab('users',this)">ผู้ใช้งาน</button>
      </div>
      <div id="adminContent"><div class="loading">กำลังโหลด...</div></div>
    </div>
  `;
  showAdminTab('products', document.querySelector('.admin-tab'));
}

async function showAdminTab(tab, el) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const content = document.getElementById('adminContent');
  content.innerHTML = '<div class="loading">กำลังโหลด...</div>';

  try {
    switch (tab) {
      case 'products': await loadAdminProducts(content); break;
      case 'inventory': await loadAdminInventory(content); break;
      case 'orders': await loadAdminOrders(content); break;
      case 'users': await loadAdminUsers(content); break;
    }
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

async function loadAdminProducts(content) {
  const products = await api('/products/all');
  content.innerHTML = `
    <div style="margin-bottom:16px">
      <button class="btn btn-primary" onclick="showProductForm()">+ เพิ่มสินค้า</button>
    </div>
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>รูป</th><th>ชื่อ</th><th>แหล่งที่มา</th><th>การคั่ว</th><th>น้ำหนัก</th><th>ราคา</th><th>สถานะ</th></tr></thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td><img src="${p.imageUrl}" style="width:50px;height:50px;border-radius:6px;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100'"></td>
            <td>${p.name}</td><td>${p.origin}</td><td>${p.roastLevel}</td>
            <td>${p.weight} ${p.unit}</td><td>${formatPrice(p.price)}</td>
            <td>${p.isActive ? '✅' : '❌'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

async function loadAdminInventory(content) {
  const items = await api('/inventory');
  content.innerHTML = `
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>สินค้า</th><th>คงเหลือ</th><th>ขั้นต่ำ</th><th>สูงสุด</th><th>สถานะ</th><th>แก้ไข</th></tr></thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.product?.name || '-'}</td>
            <td>${item.quantity}</td><td>${item.minimumStock}</td><td>${item.maximumStock}</td>
            <td>${item.quantity <= item.minimumStock ? '⚠️ ใกล้หมด' : '✅ ปกติ'}</td>
            <td><button class="btn btn-sm btn-outline" onclick="showInventoryForm('${item.product?._id}','${item.product?.name}',${item.quantity},${item.minimumStock},${item.maximumStock})">แก้ไข</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

async function loadAdminOrders(content) {
  const orders = await api('/orders');
  const statusMap = { pending: 'รอดำเนินการ', confirmed: 'ยืนยันแล้ว', shipped: 'จัดส่งแล้ว', delivered: 'จัดส่งสำเร็จ', cancelled: 'ยกเลิก' };
  content.innerHTML = `
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>ออเดอร์</th><th>ลูกค้า</th><th>ยอดรวม</th><th>สถานะ</th><th>ชำระเงิน</th><th>จัดการ</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>#${o._id.slice(-8).toUpperCase()}</td>
            <td>${o.customer?.firstName || '-'}</td>
            <td>${formatPrice(o.totalAmount)}</td>
            <td><span class="order-status status-${o.status}">${statusMap[o.status]}</span></td>
            <td>${o.paymentStatus}</td>
            <td>
              <select onchange="updateOrderStatus('${o._id}',this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid var(--border)">
                <option value="pending" ${o.status==='pending'?'selected':''}>รอดำเนินการ</option>
                <option value="confirmed" ${o.status==='confirmed'?'selected':''}>ยืนยัน</option>
                <option value="shipped" ${o.status==='shipped'?'selected':''}>จัดส่ง</option>
                <option value="delivered" ${o.status==='delivered'?'selected':''}>สำเร็จ</option>
                <option value="cancelled" ${o.status==='cancelled'?'selected':''}>ยกเลิก</option>
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

async function loadAdminUsers(content) {
  const users = await api('/auth/me');
  content.innerHTML = `
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>เบอร์โทร</th><th>บทบาท</th></tr></thead>
      <tbody>
        <tr><td>${users.firstName} ${users.lastName}</td><td>${users.email}</td><td>${users.phone}</td><td>${users.role}</td></tr>
      </tbody>
    </table>
    </div>
    <p style="margin-top:16px;color:var(--text-secondary);font-size:0.9rem">ระบบมีผู้ใช้ทั้งหมด 2 ราย (Admin + Customer) จากข้อมูล seed</p>
  `;
}

async function updateOrderStatus(orderId, status) {
  try {
    await api(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showToast('อัปเดตสถานะสำเร็จ');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showProductForm() {
  const overlay = document.createElement('div');
  overlay.className = 'admin-form-overlay';
  overlay.innerHTML = `
    <div class="admin-form-modal">
      <h3>เพิ่มสินค้าใหม่</h3>
      <form onsubmit="handleAddProduct(event)">
        <div class="form-group"><label>ชื่อสินค้า</label><input type="text" id="pfName" required></div>
        <div class="form-group"><label>คำอธิบาย</label><input type="text" id="pfDesc" required></div>
        <div class="form-row">
          <div class="form-group"><label>แหล่งที่มา</label><input type="text" id="pfOrigin" required></div>
          <div class="form-group"><label>ระดับการคั่ว</label>
            <select id="pfRoast"><option>Light</option><option>Medium</option><option>Medium-Dark</option><option>Dark</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>น้ำหนัก (กรัม)</label><input type="number" id="pfWeight" required></div>
          <div class="form-group"><label>ราคา (฿)</label><input type="number" id="pfPrice" required></div>
        </div>
        <div class="form-group"><label>URL รูปภาพ</label><input type="text" id="pfImage" required placeholder="https://..."></div>
        <div style="display:flex;gap:12px;margin-top:20px">
          <button class="btn btn-primary" type="submit">บันทึก</button>
          <button class="btn btn-outline" type="button" onclick="this.closest('.admin-form-overlay').remove()">ยกเลิก</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function handleAddProduct(e) {
  e.preventDefault();
  try {
    await api('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('pfName').value,
        description: document.getElementById('pfDesc').value,
        origin: document.getElementById('pfOrigin').value,
        roastLevel: document.getElementById('pfRoast').value,
        weight: Number(document.getElementById('pfWeight').value),
        price: Number(document.getElementById('pfPrice').value),
        imageUrl: document.getElementById('pfImage').value,
        isActive: true
      })
    });
    document.querySelector('.admin-form-overlay').remove();
    showToast('เพิ่มสินค้าสำเร็จ');
    showAdminTab('products', document.querySelector('.admin-tab'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showInventoryForm(productId, name, qty, min, max) {
  const overlay = document.createElement('div');
  overlay.className = 'admin-form-overlay';
  overlay.innerHTML = `
    <div class="admin-form-modal">
      <h3>แก้ไขคลังสินค้า: ${name}</h3>
      <form onsubmit="handleUpdateInventory(event,'${productId}')">
        <div class="form-group"><label>จำนวนคงเหลือ</label><input type="number" id="invQty" value="${qty}" required></div>
        <div class="form-row">
          <div class="form-group"><label>Stock ขั้นต่ำ</label><input type="number" id="invMin" value="${min}" required></div>
          <div class="form-group"><label>Stock สูงสุด</label><input type="number" id="invMax" value="${max}" required></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:20px">
          <button class="btn btn-primary" type="submit">บันทึก</button>
          <button class="btn btn-outline" type="button" onclick="this.closest('.admin-form-overlay').remove()">ยกเลิก</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function handleUpdateInventory(e, productId) {
  e.preventDefault();
  try {
    await api(`/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity: Number(document.getElementById('invQty').value),
        minimumStock: Number(document.getElementById('invMin').value),
        maximumStock: Number(document.getElementById('invMax').value)
      })
    });
    document.querySelector('.admin-form-overlay').remove();
    showToast('อัปเดตคลังสินค้าสำเร็จ');
    showAdminTab('inventory', document.querySelectorAll('.admin-tab')[1]);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ===== Init =====
checkAuth();
navigate('home');
