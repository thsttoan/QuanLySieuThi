// ===== THU NGÂN (POS) — Bách Hóa Xanh =====

let allProducts = [];
let allCategories = [];
let cart = [];
let currentCategory = 'all';
let customerData = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    const tennv = sessionStorage.getItem('tennv') || 'Thu ngân';
    document.getElementById('userInfo').textContent = `Xin chào, ${tennv}`;
    loadCategories();
    loadProducts();
});

// ===== FORMAT CURRENCY =====
function fmt(n) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}

// ===== LOAD CATEGORIES =====
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        allCategories = await res.json();
        const bar = document.getElementById('categoryBar');

        const icons = {
            'Thịt, Cá': 'fa-drumstick-bite',
            'Rau, Củ, Quả': 'fa-carrot',
            'Trái cây': 'fa-apple-whole',
            'Mì, Phở ăn liền': 'fa-bowl-rice',
            'Sữa, Bơ, Phô mai': 'fa-glass-water',
            'Gia vị, Nước chấm': 'fa-jar',
            'Nước giải khát': 'fa-bottle-water',
            'Bia, Rượu': 'fa-beer-mug-empty',
            'Bánh kẹo': 'fa-cookie-bite',
            'Hóa mỹ phẩm': 'fa-pump-soap',
            'Đồ dùng gia đình': 'fa-house',
            'Đồ đông lạnh': 'fa-snowflake',
            'Dầu ăn': 'fa-oil-can',
            'Gạo, Bột': 'fa-wheat-awn',
            'Snack': 'fa-cookie',
        };

        allCategories.forEach(cat => {
            const icon = icons[cat.TenDanhMuc] || 'fa-tag';
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.onclick = function() { selectCategory(cat.MaDanhMuc, this); };
            btn.innerHTML = `<i class="fa-solid ${icon}"></i>${cat.TenDanhMuc}`;
            bar.appendChild(btn);
        });
    } catch (e) {
        console.error('Load categories error:', e);
    }
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderProducts();
    } catch (e) {
        console.error('Load products error:', e);
    }
}

// ===== SELECT CATEGORY =====
function selectCategory(catId, btnEl) {
    currentCategory = catId;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    renderProducts();
}

// ===== FILTER BY SEARCH =====
function filterProducts() {
    renderProducts();
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const search = document.getElementById('searchInput').value.toLowerCase().trim();

    let filtered = allProducts;
    if (currentCategory !== 'all') {
        const catName = allCategories.find(c => c.MaDanhMuc === currentCategory)?.TenDanhMuc;
        if (catName) filtered = filtered.filter(p => p.TenDanhMuc === catName);
    }
    if (search) {
        filtered = filtered.filter(p =>
            p.TenSP.toLowerCase().includes(search) ||
            p.MaSP.toLowerCase().includes(search)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-products"><i class="fa-solid fa-box-open"></i>Không tìm thấy sản phẩm</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const giaKhuyenMai = parseFloat(p.GiaKhuyenMai);
        const giaBan = parseFloat(p.GiaBan);
        const hasPromo = giaKhuyenMai && giaKhuyenMai < giaBan;
        const price = hasPromo ? giaKhuyenMai : giaBan;
        const imgSrc = `/static/image/${p.MaSP}.jpg`;
        const discount = hasPromo ? Math.round((1 - giaKhuyenMai / giaBan) * 100) : 0;

        return `
        <div class="product-card" ondblclick="addToCart('${p.MaSP}')">
            ${hasPromo ? `<div class="badge-promo">-${discount}%</div>` : ''}
            <div class="card-img">
                <img src="${imgSrc}" alt="${p.TenSP}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ccc%22 font-size=%2224%22>🛒</text></svg>'">
            </div>
            <div class="card-body">
                <div class="card-name" title="${p.TenSP}">${p.TenSP}</div>
                <div class="card-unit">
                    ${p.DonViTinh || ''}
                    <span style="float: right; color: var(--text-muted); font-size: 0.85em; font-weight: 500;">
                        Tồn: ${p.TongTonKho || 0}
                    </span>
                </div>
                <div class="card-prices">
                    <span class="price-sale">${fmt(price)}</span>
                    ${hasPromo ? `<span class="price-original">${fmt(p.GiaBan)}</span>` : ''}
                </div>
                <button class="btn-add" onclick="event.stopPropagation(); addToCart('${p.MaSP}')">
                    <i class="fa-solid fa-cart-plus"></i> Thêm
                </button>
            </div>
        </div>`;
    }).join('');
}

// ===== ADD TO CART =====
function addToCart(maSP) {
    const product = allProducts.find(p => p.MaSP === maSP);
    if (!product) return;

    const existing = cart.find(c => c.ma_sp === maSP);
    if (existing) {
        existing.so_luong++;
    } else {
        cart.push({
            ma_sp: maSP,
            ten_sp: product.TenSP,
            gia_ban: product.GiaBan,
            gia_km: product.GiaKhuyenMai || product.GiaBan,
            so_luong: 1
        });
    }
    renderCart();
    showToast(`✓ Đã thêm "${product.TenSP}"`);
}

// ===== RENDER CART =====
function renderCart() {
    const container = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const countEl = document.getElementById('cartCount');
    const btnCheckout = document.getElementById('btnCheckout');

    countEl.textContent = cart.reduce((s, c) => s + c.so_luong, 0);

    if (cart.length === 0) {
        document.getElementById('cartList').innerHTML = '';
        empty.style.display = 'flex';
        btnCheckout.disabled = true;
        calculateTotals();
        return;
    }

    empty.style.display = 'none';
    btnCheckout.disabled = false;

    document.getElementById('cartList').innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <div class="item-info">
                <div class="item-name">${item.ten_sp}</div>
                <div class="item-price">${fmt(item.gia_km)} × ${item.so_luong} = ${fmt(item.gia_km * item.so_luong)}</div>
            </div>
            <div class="qty-controls">
                <button onclick="changeQty(${i}, -1)">−</button>
                <span class="qty-value">${item.so_luong}</span>
                <button onclick="changeQty(${i}, 1)">+</button>
            </div>
            <button class="btn-remove" onclick="removeItem(${i})"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join('');

    calculateTotals();
}

// ===== CART OPERATIONS =====
function changeQty(index, delta) {
    cart[index].so_luong += delta;
    if (cart[index].so_luong <= 0) cart.splice(index, 1);
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}

// ===== CUSTOMER LOOKUP =====
async function lookupCustomer() {
    const sdt = document.getElementById('customerPhone').value.trim();
    if (!sdt) return;

    try {
        const res = await fetch(`/api/customers?sdt=${sdt}`);
        const data = await res.json();
        const infoEl = document.getElementById('customerInfo');
        const pointsRow = document.getElementById('pointsRow');

        if (data.length > 0) {
            customerData = data[0];
            infoEl.innerHTML = `<strong>${customerData.TenKH}</strong> — Điểm tích lũy: <strong>${customerData.DiemTichLuy}</strong>`;
            infoEl.classList.add('show');
            pointsRow.style.display = 'flex';
            document.getElementById('pointsAvail').textContent = `(tối đa ${customerData.DiemTichLuy})`;
            document.getElementById('pointsUse').max = customerData.DiemTichLuy;
        } else {
            infoEl.innerHTML = `⚠️ SĐT "${sdt}" chưa đăng ký hội viên`;
            infoEl.classList.add('show');
            infoEl.style.background = '#fff7ed';
            infoEl.style.color = '#c2410c';
            customerData = null;
            pointsRow.style.display = 'none';
        }
    } catch (e) {
        showToast('Lỗi tra cứu khách hàng!', true);
    }
    calculateTotals();
}

// ===== CALCULATE TOTALS =====
async function calculateTotals() {
    let subtotal = 0, discount = 0;
    cart.forEach(item => {
        subtotal += item.gia_ban * item.so_luong;
        discount += (item.gia_ban - item.gia_km) * item.so_luong;
    });

    const pointsUse = parseInt(document.getElementById('pointsUse').value) || 0;
    const pointsDeduct = pointsUse * 100;

    let voucherDiscount = 0;
    const voucherCode = document.getElementById('voucherCode').value.trim();
    if (voucherCode) {
        try {
            const res = await fetch('/api/vouchers');
            const vouchers = await res.json();
            const voucher = vouchers.find(v => v.MaVoucher === voucherCode);
            if (voucher) {
                if (voucher.LoaiVoucher === 'GiamGia') {
                    voucherDiscount = (subtotal - discount) * (voucher.GiaTri / 100.0);
                } else if (voucher.LoaiVoucher === 'TangSanPham') {
                    const spTang = allProducts.find(p => p.MaSP === voucher.MaSPTang);
                    if (spTang) {
                        showToast(`🎁 Tặng kèm: ${voucher.SoLuongTang} x ${spTang.TenSP}`);
                    }
                }
            }
        } catch(e) {}
    }

    const grandTotal = Math.max(0, subtotal - discount - voucherDiscount - pointsDeduct);

    document.getElementById('subtotal').textContent = fmt(subtotal);
    document.getElementById('discount').textContent = `-${fmt(discount)}`;
    document.getElementById('voucherDiscount').textContent = `-${fmt(voucherDiscount)}`;
    document.getElementById('pointsDeduct').textContent = `-${fmt(pointsDeduct)}`;
    document.getElementById('grandTotal').textContent = fmt(grandTotal);
}

// ===== CHECKOUT =====
async function processCheckout() {
    if (cart.length === 0) return;
    const btn = document.getElementById('btnCheckout');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Đang xử lý...';

    const payload = {
        cart: cart.map(c => ({ ma_sp: c.ma_sp, so_luong: c.so_luong })),
        ma_nv: sessionStorage.getItem('manv') || 'NV001',
        sdt_kh: document.getElementById('customerPhone').value.trim(),
        diem_su_dung: parseInt(document.getElementById('pointsUse').value) || 0,
        ma_voucher: document.getElementById('voucherCode').value.trim(),
        pt_thanh_toan: document.getElementById('paymentMethod').value
    };

    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === 'success') {
            showReceipt(data);
            cart = [];
            renderCart();
            // Reset customer
            customerData = null;
            document.getElementById('customerPhone').value = '';
            document.getElementById('customerInfo').classList.remove('show');
            document.getElementById('pointsRow').style.display = 'none';
            document.getElementById('pointsUse').value = 0;
        } else {
            showToast(data.error || data.message || 'Lỗi thanh toán!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối server!', true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-credit-card"></i>&nbsp; THANH TOÁN';
    }
}

// ===== RECEIPT MODAL =====
function showReceipt(data) {
    const info = document.getElementById('receiptInfo');
    info.innerHTML = `
        <div class="row"><span>Mã hóa đơn:</span><span>${data.ma_hd}</span></div>
        <div class="row"><span>Thanh toán:</span><span>${document.getElementById('paymentMethod').value}</span></div>
        <div class="row"><span>Điểm đã dùng:</span><span>${data.diem_su_dung}</span></div>
        <div class="row"><span>Điểm tích lũy mới:</span><span>+${data.diem_tich_luy_moi}</span></div>
        <div class="row total"><span>Thành tiền:</span><span>${fmt(data.thanh_tien)}</span></div>
    `;
    document.getElementById('receiptModal').classList.add('show');
}

function closeReceipt() {
    document.getElementById('receiptModal').classList.remove('show');
}

// ===== TOAST =====
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${isError ? 'error' : ''}`;
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== MOBILE CART TOGGLE =====
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
}

// ===== LOGOUT =====
function logout() {
    sessionStorage.clear();
    window.location.href = '/login';
}
