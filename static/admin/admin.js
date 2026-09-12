// ===== ADMIN — Quản trị Bách Hóa Xanh =====

let productsData = [];
let promosData = [];
let employeesData = [];
let categoriesData = [];
let editingProduct = null;
let searchTerm = '';
let adminSuppliersData = [];
let editingSupplier = null;
let editingPromo = null;
let editingVoucher = null;

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadCategories(),
        loadProducts(),
        loadPromos(),
        loadEmployees(),
        loadCustomers(),
        loadInvoices(),
        loadImportHistory(),
        loadSuppliersSelect(),
        loadVouchers(),
        loadDestroyHistory(),
        loadAdminSuppliers()
    ]);
    loadRevenue();
});

function fmt(n) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}

function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN');
}

// ===== TAB SWITCHING =====
function switchTab(tabId, el) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');

    const titles = {
        'tab-products': '<i class="fa-solid fa-box"></i> Quản Lý Sản Phẩm',
        'tab-promos': '<i class="fa-solid fa-percent"></i> Khuyến Mãi',
        'tab-employees': '<i class="fa-solid fa-users"></i> Quản Lý Nhân Viên',
        'tab-revenue': '<i class="fa-solid fa-chart-line"></i> Thống Kê Doanh Thu',
        'tab-destroy-history': '<i class="fa-solid fa-fire"></i> Lịch Sử Tiêu Hủy',
        'tab-suppliers': '<i class="fa-solid fa-truck"></i> Quản Lý Nhà Cung Cấp'
    };
    document.getElementById('pageTitle').innerHTML = titles[tabId] || '';
}

// ===== SEARCH =====
function handleSearch() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    renderProducts();
    renderPromos();
    renderEmployees();
    renderVouchers();
    renderAdminSuppliers();
}

// ===== CATEGORIES =====
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        categoriesData = await res.json();
        const sel = document.getElementById('pf-danhmuc');
        sel.innerHTML = '<option value="">-- Chọn --</option>';
        categoriesData.forEach(c => {
            sel.innerHTML += `<option value="${c.MaDanhMuc}">${c.TenDanhMuc}</option>`;
        });
    } catch (e) { console.error(e); }
}

// ===== PRODUCTS =====
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        productsData = await res.json();
        renderProducts();
    } catch (e) { console.error(e); }
}

function renderProducts() {
    const tbody = document.getElementById('productsBody');
    let data = productsData;
    if (searchTerm) {
        data = data.filter(p =>
            p.TenSP.toLowerCase().includes(searchTerm) ||
            p.MaSP.toLowerCase().includes(searchTerm)
        );
    }

    tbody.innerHTML = data.map(p => `
        <tr>
            <td>
                <img src="/static/image/${p.MaSP}.jpg" style="width: 48px; height: 48px; object-fit: contain; background: #fff; border-radius: 6px; border: 1px solid #eee;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ccc%22 font-size=%2224%22>🛒</text></svg>'">
            </td>
            <td><strong>${p.MaSP}</strong></td>
            <td>${p.TenSP}</td>
            <td><span class="badge badge-green">${p.TenDanhMuc || '-'}</span></td>
            <td>${p.DonViTinh || '-'}</td>
            <td><strong>${fmt(p.GiaBan)}</strong></td>
            <td>${p.TongTonKho ?? '-'}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editProduct('${p.MaSP}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                <button class="btn-danger" onclick="deleteProduct('${p.MaSP}')"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

function toggleProductForm() {
    const form = document.getElementById('productForm');
    form.classList.toggle('show');
    if (!form.classList.contains('show')) {
        editingProduct = null;
        document.getElementById('productFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Thêm Sản Phẩm Mới';
        document.getElementById('pf-masp').disabled = false;
        document.getElementById('pf-masp').value = '';
        document.getElementById('pf-tensp').value = '';
        document.getElementById('pf-gia').value = '';
        document.getElementById('pf-dvt').value = '';
    }
}

function editProduct(masp) {
    const p = productsData.find(x => x.MaSP === masp);
    if (!p) return;
    editingProduct = masp;
    document.getElementById('productForm').classList.add('show');
    document.getElementById('productFormTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Sửa Sản Phẩm';
    document.getElementById('pf-masp').value = p.MaSP;
    document.getElementById('pf-masp').disabled = true;
    document.getElementById('pf-tensp').value = p.TenSP;
    document.getElementById('pf-danhmuc').value = p.MaDanhMuc || '';
    document.getElementById('pf-dvt').value = p.DonViTinh || '';
    document.getElementById('pf-gia').value = p.GiaBan;
    document.getElementById('pf-tuoisong').value = p.LaHangTuoiSong ? '1' : '0';
}

async function submitProduct(e) {
    e.preventDefault();
    const currentUser = sessionStorage.getItem('manv') || 'admin';
    const data = {
        MaSP: document.getElementById('pf-masp').value,
        TenSP: document.getElementById('pf-tensp').value,
        MaDanhMuc: document.getElementById('pf-danhmuc').value,
        DonViTinh: document.getElementById('pf-dvt').value,
        GiaBan: parseFloat(document.getElementById('pf-gia').value),
        LaHangTuoiSong: parseInt(document.getElementById('pf-tuoisong').value),
        MaNVSuaCuoi: currentUser
    };

    try {
        let res;
        if (editingProduct) {
            res = await fetch(`/api/products/${editingProduct}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        const result = await res.json();
        if (result.status === 'success') {
            showToast(editingProduct ? '✓ Cập nhật thành công!' : '✓ Thêm sản phẩm thành công!');
            toggleProductForm();
            loadProducts();
        } else {
            showToast(result.error || 'Lỗi!', true);
        }
    } catch (err) {
        showToast('Lỗi kết nối!', true);
    }
}

async function deleteProduct(masp) {
    if (!confirm(`Xóa sản phẩm ${masp}?`)) return;
    try {
        const res = await fetch(`/api/products/${masp}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('✓ Đã xóa!');
            loadProducts();
        } else {
            showToast(data.error || 'Không thể xóa!', true);
        }
    } catch (e) {
        showToast('Lỗi!', true);
    }
}

// ===== PROMOS =====
async function loadPromos() {
    try {
        const res = await fetch('/api/promotions');
        promosData = await res.json();
        renderPromos();
    } catch (e) { console.error(e); }
}

function renderPromos() {
    const tbody = document.getElementById('promosBody');
    let data = promosData;
    if (searchTerm) {
        data = data.filter(p => p.TenKM.toLowerCase().includes(searchTerm));
    }

    tbody.innerHTML = data.map(p => `
        <tr>
            <td><strong>${p.MaKM}</strong></td>
            <td><span class="badge badge-green">Sản Phẩm</span></td>
            <td>${p.TenKM}</td>
            <td><span class="badge badge-orange">${p.PhanTramGiam}%</span></td>
            <td>${fmtDate(p.NgayBatDau)}</td>
            <td>${fmtDate(p.NgayKetThuc)}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editPromo('${p.MaKM}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                <button class="btn-danger" onclick="deletePromo('${p.MaKM}')"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

let isPromoUiBuilt = false;
function buildPromoProductsUI() {
    if (isPromoUiBuilt) return;
    const list = document.getElementById('km-products-list');
    if (!list) return;

    let html = '';
    categoriesData.forEach(cat => {
        const catProds = productsData.filter(p => p.TenDanhMuc === cat.TenDanhMuc);
        if (catProds.length === 0) return;

        html += `
            <div class="promo-cat-block" data-catname="${cat.TenDanhMuc.toLowerCase()}" style="background: #f9fafb; padding: 5px; border-radius: 4px; border-left: 3px solid var(--primary-color);">
                <label style="font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" onchange="toggleCategoryProducts(this, '${cat.MaDanhMuc}')"> 
                    ${cat.TenDanhMuc}
                </label>
                <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 3px; margin-top: 5px;" class="cat-group-${cat.MaDanhMuc}">
                    ${catProds.map(p => `
                        <label class="promo-prod-item" data-prodname="${p.TenSP.toLowerCase()}" data-prodid="${p.MaSP.toLowerCase()}" style="font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" class="promo-product-cb" value="${p.MaSP}"> 
                            ${p.TenSP} <span style="color:var(--text-muted)">(${p.MaSP})</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
    isPromoUiBuilt = true;
}

function filterPromoProducts() {
    const text = document.getElementById('km-product-search').value.toLowerCase().trim();
    document.querySelectorAll('.promo-cat-block').forEach(block => {
        let hasVisibleProd = false;
        const catName = block.getAttribute('data-catname');
        
        block.querySelectorAll('.promo-prod-item').forEach(item => {
            const prodName = item.getAttribute('data-prodname');
            const prodId = item.getAttribute('data-prodid');
            
            if (prodName.includes(text) || prodId.includes(text) || catName.includes(text)) {
                item.style.display = 'flex';
                hasVisibleProd = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        block.style.display = hasVisibleProd ? 'block' : 'none';
    });
}

function toggleCategoryProducts(cb, catId) {
    const group = document.querySelector(`.cat-group-${catId}`);
    if (group) {
        group.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = cb.checked;
        });
    }
}

function togglePromoForm() {
    const form = document.getElementById('promoForm');
    form.classList.toggle('show');
    if (form.classList.contains('show')) {
        buildPromoProductsUI();
    } else {
        editingPromo = null;
        document.getElementById('km-makm').disabled = false;
        document.getElementById('km-makm').value = '';
        document.getElementById('km-tenkm').value = '';
        document.getElementById('km-phantram').value = '';
        document.getElementById('km-start').value = '';
        document.getElementById('km-end').value = '';
        document.querySelectorAll('.promo-product-cb').forEach(cb => cb.checked = false);
    }
}

function editPromo(makm) {
    const p = promosData.find(x => x.MaKM === makm);
    if (!p) return;
    editingPromo = makm;
    
    document.getElementById('promoForm').classList.add('show');
    buildPromoProductsUI();
    
    document.getElementById('km-makm').value = p.MaKM;
    document.getElementById('km-makm').disabled = true;
    document.getElementById('km-tenkm').value = p.TenKM;
    document.getElementById('km-phantram').value = p.PhanTramGiam;
    document.getElementById('km-start').value = p.NgayBatDau || '';
    document.getElementById('km-end').value = p.NgayKetThuc || '';
    
    // Check products
    document.querySelectorAll('.promo-product-cb').forEach(cb => {
        cb.checked = (p.SanPhams && p.SanPhams.includes(cb.value));
    });
}

async function submitPromo(e) {
    e.preventDefault();
    const selectedProducts = Array.from(document.querySelectorAll('.promo-product-cb:checked')).map(cb => cb.value);
    const payload = {
        MaKM: document.getElementById('km-makm').value,
        LoaiKM: 'SanPham',
        TenKM: document.getElementById('km-tenkm').value,
        PhanTramGiam: parseInt(document.getElementById('km-phantram').value),
        NgayBatDau: document.getElementById('km-start').value,
        NgayKetThuc: document.getElementById('km-end').value,
        SanPhams: selectedProducts
    };

    if (payload.LoaiKM === 'SanPham' && payload.SanPhams.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 sản phẩm cho khuyến mãi!', true);
        return;
    }

    const url = editingPromo ? `/api/promotions/${editingPromo}` : '/api/promotions';
    const method = editingPromo ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.status === 'success') {
            showToast(editingPromo ? '✓ Đã cập nhật!' : '✓ Tạo khuyến mãi thành công!');
            togglePromoForm();
            loadPromos();
        } else {
            showToast(result.error || 'Lỗi!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối!', true);
    }
}

async function deletePromo(makm) {
    if (!confirm(`Xóa khuyến mãi ${makm}?`)) return;
    try {
        const res = await fetch(`/api/promotions/${makm}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('✓ Đã xóa!');
            loadPromos();
        } else {
            showToast(data.error || 'Không thể xóa!', true);
        }
    } catch (e) {
        showToast('Lỗi!', true);
    }
}

// ===== VOUCHERS =====
let vouchersData = [];

async function loadVouchers() {
    try {
        const res = await fetch('/api/vouchers');
        vouchersData = await res.json();
        renderVouchers();
    } catch (e) { console.error(e); }
}

function renderVouchers() {
    const tbody = document.getElementById('vouchersBody');
    let data = vouchersData;
    if (searchTerm) {
        data = data.filter(p => p.TenVoucher.toLowerCase().includes(searchTerm) || p.MaVoucher.toLowerCase().includes(searchTerm));
    }

    tbody.innerHTML = data.map(v => `
        <tr>
            <td><strong>${v.MaVoucher}</strong></td>
            <td>${v.TenVoucher}</td>
            <td><span class="badge ${v.LoaiVoucher === 'GiamGia' ? 'badge-orange' : 'badge-green'}">${v.LoaiVoucher === 'GiamGia' ? 'Giảm Hóa Đơn' : 'Tặng Sản Phẩm'}</span></td>
            <td>${v.LoaiVoucher === 'GiamGia' ? `Giảm ${v.GiaTri}%` : `Tặng ${v.SoLuongTang} x ${v.MaSPTang}`}</td>
            <td>${fmtDate(v.NgayBatDau)}</td>
            <td>${fmtDate(v.NgayKetThuc)}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editVoucher('${v.MaVoucher}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                <button class="btn-danger" onclick="deleteVoucher('${v.MaVoucher}')"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

function toggleVoucherForm() {
    const form = document.getElementById('voucherForm');
    form.classList.toggle('show');
    const sel = document.getElementById('v-masptang');
    if (sel.options.length === 0) {
        sel.innerHTML = productsData.map(p => `<option value="${p.MaSP}">${p.TenSP}</option>`).join('');
    }
    
    if (!form.classList.contains('show')) {
        editingVoucher = null;
        document.getElementById('v-mavoucher').disabled = false;
        document.getElementById('v-mavoucher').value = '';
        document.getElementById('v-tenvoucher').value = '';
        document.getElementById('v-giatri').value = '';
        document.getElementById('v-soluongtang').value = '';
        document.getElementById('v-start').value = '';
        document.getElementById('v-end').value = '';
    }
}

function editVoucher(maVoucher) {
    const v = vouchersData.find(x => x.MaVoucher === maVoucher);
    if (!v) return;
    editingVoucher = maVoucher;
    
    const form = document.getElementById('voucherForm');
    form.classList.add('show');
    
    const sel = document.getElementById('v-masptang');
    if (sel.options.length === 0) {
        sel.innerHTML = productsData.map(p => `<option value="${p.MaSP}">${p.TenSP}</option>`).join('');
    }
    
    document.getElementById('v-mavoucher').value = v.MaVoucher;
    document.getElementById('v-mavoucher').disabled = true;
    document.getElementById('v-tenvoucher').value = v.TenVoucher;
    document.getElementById('v-loaivoucher').value = v.LoaiVoucher;
    document.getElementById('v-start').value = v.NgayBatDau || '';
    document.getElementById('v-end').value = v.NgayKetThuc || '';
    
    if (v.LoaiVoucher === 'GiamGia') {
        document.getElementById('v-giatri').value = v.GiaTri;
    } else {
        document.getElementById('v-masptang').value = v.MaSPTang;
        document.getElementById('v-soluongtang').value = v.SoLuongTang;
    }
    handleVoucherTypeChange();
}

function handleVoucherTypeChange() {
    const type = document.getElementById('v-loaivoucher').value;
    document.getElementById('v-giatri-group').style.display = type === 'GiamGia' ? 'flex' : 'none';
    document.getElementById('v-masptang-group').style.display = type === 'TangSanPham' ? 'flex' : 'none';
    document.getElementById('v-soluongtang-group').style.display = type === 'TangSanPham' ? 'flex' : 'none';
}

async function submitVoucher(e) {
    e.preventDefault();
    const type = document.getElementById('v-loaivoucher').value;
    const payload = {
        MaVoucher: document.getElementById('v-mavoucher').value,
        LoaiVoucher: type,
        TenVoucher: document.getElementById('v-tenvoucher').value,
        NgayBatDau: document.getElementById('v-start').value,
        NgayKetThuc: document.getElementById('v-end').value
    };

    if (type === 'GiamGia') {
        payload.GiaTri = parseInt(document.getElementById('v-giatri').value);
    } else {
        payload.MaSPTang = document.getElementById('v-masptang').value;
        payload.SoLuongTang = parseInt(document.getElementById('v-soluongtang').value);
    }

    const url = editingVoucher ? `/api/vouchers/${editingVoucher}` : '/api/vouchers';
    const method = editingVoucher ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.status === 'success') {
            toggleVoucherForm();
            loadVouchers();
            if(!editingVoucher) e.target.reset();
            showToast(editingVoucher ? 'Đã cập nhật Voucher' : 'Đã thêm Voucher');
        } else {
            showToast(result.error, true);
        }
    } catch(err) {
        showToast('Lỗi kết nối', true);
    }
}

async function deleteVoucher(mavoucher) {
    if(!confirm(`Xóa Voucher ${mavoucher}?`)) return;
    try {
        const res = await fetch(`/api/vouchers/${mavoucher}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.status === 'success') {
            loadVouchers();
            showToast('Đã xóa');
        } else {
            showToast(result.error, true);
        }
    } catch(err) {
        showToast('Lỗi xóa', true);
    }
}

// ===== EMPLOYEES =====
async function loadEmployees() {
    try {
        const res = await fetch('/api/employees');
        employeesData = await res.json();
        renderEmployees();
    } catch (e) { console.error(e); }
}

function renderEmployees() {
    const tbody = document.getElementById('employeesBody');
    let data = employeesData;
    if (searchTerm) {
        data = data.filter(e => e.TenNV.toLowerCase().includes(searchTerm));
    }

    const roleColors = {
        'Admin / Quản lý': 'badge-purple',
        'Admin': 'badge-purple',
        'Quản lý': 'badge-purple',
        'Thu ngân': 'badge-blue',
        'Nhân viên kho': 'badge-orange'
    };

    tbody.innerHTML = data.map(e => `
        <tr>
            <td><strong>${e.MaNV}</strong></td>
            <td>${e.TenNV}</td>
            <td><span class="badge ${roleColors[e.ChucVu] || 'badge-green'}">${e.ChucVu}</span></td>
            <td>${e.SoDienThoai || '-'}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editEmployee('${e.MaNV}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                <button class="btn-danger" onclick="deleteEmployee('${e.MaNV}')"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

let isEditingEmployee = false;
function toggleEmployeeForm() {
    isEditingEmployee = false;
    document.getElementById('employeeFormTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Thêm Nhân Viên';
    document.getElementById('btnSubmitEmployee').innerHTML = '<i class="fa-solid fa-save"></i> Thêm';
    document.getElementById('nv-manv').readOnly = false;
    document.getElementById('nv-manv').value = '';
    document.getElementById('nv-tennv').value = '';
    document.getElementById('nv-sdt').value = '';
    document.getElementById('nv-matkhau').value = '123456';
    document.getElementById('employeeForm').classList.toggle('show');
}

function editEmployee(maNV) {
    const emp = employeesData.find(e => e.MaNV === maNV);
    if (!emp) return;
    isEditingEmployee = true;
    document.getElementById('employeeFormTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Sửa Nhân Viên';
    document.getElementById('btnSubmitEmployee').innerHTML = '<i class="fa-solid fa-save"></i> Lưu';
    document.getElementById('nv-manv').value = emp.MaNV;
    document.getElementById('nv-manv').readOnly = true;
    document.getElementById('nv-tennv').value = emp.TenNV;
    document.getElementById('nv-sdt').value = emp.SoDienThoai || '';
    
    const roleSel = document.getElementById('nv-chucvu');
    for (let i = 0; i < roleSel.options.length; i++) {
        if (roleSel.options[i].text === emp.ChucVu) {
            roleSel.selectedIndex = i;
            break;
        }
    }
    
    document.getElementById('nv-matkhau').value = ''; // Leave blank to not change
    document.getElementById('employeeForm').classList.add('show');
}

async function deleteEmployee(maNV) {
    if (maNV === 'admin') {
        showToast('Không thể xóa admin!', true);
        return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    try {
        const res = await fetch(`/api/employees/${maNV}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Đã xóa nhân viên!');
            loadEmployees();
        } else {
            showToast(data.error || 'Không thể xóa!', true);
        }
    } catch (e) {
        showToast('Lỗi!', true);
    }
}

async function submitEmployee(e) {
    e.preventDefault();
    const roleSel = document.getElementById('nv-chucvu');
    const roleId = parseInt(roleSel.value);
    const roleText = roleSel.options[roleSel.selectedIndex].text;
    
    const data = {
        MaNV: document.getElementById('nv-manv').value,
        TenNV: document.getElementById('nv-tennv').value,
        ChucVu: roleText,
        Role: roleId,
        SoDienThoai: document.getElementById('nv-sdt').value,
        MatKhau: document.getElementById('nv-matkhau').value
    };

    try {
        const url = isEditingEmployee ? `/api/employees/${data.MaNV}` : '/api/employees';
        const method = isEditingEmployee ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.status === 'success') {
            showToast(isEditingEmployee ? '✓ Cập nhật thành công!' : '✓ Thêm nhân viên thành công!');
            document.getElementById('employeeForm').classList.remove('show');
            loadEmployees();
        } else {
            showToast(result.error || 'Lỗi!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối!', true);
    }
}

// ===== CUSTOMERS =====
let customersData = [];
let isEditingCustomer = false;

async function loadCustomers() {
    try {
        const res = await fetch('/api/customers');
        customersData = await res.json();
        renderCustomers();
    } catch (e) { console.error(e); }
}

function renderCustomers() {
    const tbody = document.getElementById('customersBody');
    let data = customersData;
    if (searchTerm) {
        data = data.filter(c => 
            c.TenKH.toLowerCase().includes(searchTerm) || 
            c.SoDienThoai.includes(searchTerm)
        );
    }

    tbody.innerHTML = data.map(c => `
        <tr>
            <td><strong>KH${c.MaKH}</strong></td>
            <td>${c.TenKH}</td>
            <td>${c.SoDienThoai}</td>
            <td><span class="badge badge-purple">${(c.DiemTichLuy || 0).toLocaleString('vi-VN')} điểm</span></td>
            <td>${c.NgayDangKy || ''}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editCustomer(${c.MaKH})"><i class="fa-solid fa-pen"></i> Sửa</button>
                <button class="btn-danger" onclick="deleteCustomer(${c.MaKH})"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

function toggleCustomerForm() {
    isEditingCustomer = false;
    document.getElementById('customerFormTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Thêm Khách Hàng';
    document.getElementById('kh-makh').value = '';
    document.getElementById('kh-tenkh').value = '';
    document.getElementById('kh-sdt').value = '';
    document.getElementById('kh-diem').value = '0';
    document.getElementById('customerForm').classList.toggle('show');
}

function editCustomer(maKH) {
    const c = customersData.find(x => x.MaKH === maKH);
    if (!c) return;
    isEditingCustomer = true;
    document.getElementById('customerFormTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Sửa Khách Hàng';
    document.getElementById('kh-makh').value = c.MaKH;
    document.getElementById('kh-tenkh').value = c.TenKH;
    document.getElementById('kh-sdt').value = c.SoDienThoai;
    document.getElementById('kh-diem').value = c.DiemTichLuy;
    document.getElementById('customerForm').classList.add('show');
}

async function submitCustomer(e) {
    e.preventDefault();
    const maKH = document.getElementById('kh-makh').value;
    const data = {
        TenKH: document.getElementById('kh-tenkh').value,
        SoDienThoai: document.getElementById('kh-sdt').value,
        DiemTichLuy: parseInt(document.getElementById('kh-diem').value) || 0
    };

    try {
        const url = isEditingCustomer ? `/api/customers/${maKH}` : '/api/customers';
        const method = isEditingCustomer ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.status === 'success') {
            showToast(isEditingCustomer ? '✓ Đã cập nhật KH!' : '✓ Đã thêm KH!');
            document.getElementById('customerForm').classList.remove('show');
            loadCustomers();
        } else {
            showToast(result.error || 'Lỗi!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối!', true);
    }
}

async function deleteCustomer(maKH) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
    try {
        const res = await fetch(`/api/customers/${maKH}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Đã xóa khách hàng!');
            loadCustomers();
        } else {
            showToast(data.error || 'Không thể xóa!', true);
        }
    } catch (e) {
        showToast('Lỗi!', true);
    }
}

// ===== REVENUE =====
let revenueByDayChartInstance = null;
let revenueByCategoryChartInstance = null;

async function loadRevenue() {
    try {
        const res = await fetch('/api/revenue');
        const data = await res.json();
        const tbody = document.getElementById('revenueBody');

        let totalRevenue = 0, totalOrders = 0;
        tbody.innerHTML = data.map(r => {
            totalRevenue += parseFloat(r.DoanhThuThucTe) || 0;
            totalOrders += parseFloat(r.SoHoaDon) || 0;
            return `<tr>
                <td>${fmtDate(r.Ngay)}</td>
                <td>${r.SoHoaDon}</td>
                <td>${fmt(r.TongTienHang)}</td>
                <td>${fmt(r.TongGiamGiaKM)}</td>
                <td><strong>${fmt(r.DoanhThuThucTe)}</strong></td>
            </tr>`;
        }).join('');

        document.getElementById('revenueStats').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon green"><i class="fa-solid fa-coins"></i></div>
                <div class="stat-text"><h3>${fmt(totalRevenue)}</h3><p>Tổng doanh thu</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fa-solid fa-receipt"></i></div>
                <div class="stat-text"><h3>${totalOrders}</h3><p>Tổng hóa đơn</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i class="fa-solid fa-box"></i></div>
                <div class="stat-text"><h3>${productsData.length}</h3><p>Sản phẩm</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fa-solid fa-users"></i></div>
                <div class="stat-text"><h3>${employeesData.length}</h3><p>Nhân viên</p></div>
            </div>
        `;

        // Render Doanh Thu Theo Ngày Chart
        if (revenueByDayChartInstance) revenueByDayChartInstance.destroy();
        
        // Data is sorted DESC by Ngay in API, so we reverse it for the chart
        const chartData = [...data].reverse();
        const labels = chartData.map(r => fmtDate(r.Ngay));
        const chartValues = chartData.map(r => parseFloat(r.DoanhThuThucTe) || 0);

        const ctxDay = document.getElementById('revenueByDayChart').getContext('2d');
        revenueByDayChartInstance = new Chart(ctxDay, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh Thu (VNĐ)',
                    data: chartValues,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Load Category Revenue
        const catRes = await fetch('/api/revenue/category');
        const catData = await catRes.json();
        
        if (revenueByCategoryChartInstance) revenueByCategoryChartInstance.destroy();

        const catLabels = catData.map(r => r.TenDanhMuc);
        const catValues = catData.map(r => parseFloat(r.DoanhThu) || 0);

        const ctxCat = document.getElementById('revenueByCategoryChart').getContext('2d');
        revenueByCategoryChartInstance = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catValues,
                    backgroundColor: ['#f44336', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ff9800', '#795548', '#607d8b'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });

    } catch (e) { console.error(e); }
}

// ===== INVOICES & IMPORT HISTORY =====
let invoicesData = [];
let importHistoryData = [];

async function loadInvoices() {
    try {
        const res = await fetch('/api/invoices');
        invoicesData = await res.json();
        renderInvoices();
    } catch (e) { console.error(e); }
}

function renderInvoices() {
    const tbody = document.getElementById('invoicesBody');
    if (!tbody) return;
    tbody.innerHTML = invoicesData.map(p => `
        <tr>
            <td><strong>${p.MaHD}</strong></td>
            <td>${fmtDate(p.NgayLap, true)}</td>
            <td>${p.MaNV}</td>
            <td>${p.TenKH || 'Khách lẻ'}</td>
            <td><strong>${fmt(p.ThanhTien)}</strong></td>
            <td>${p.MaNVSuaCuoi ? (p.MaNVSuaCuoi + '<br><small>'+fmtDate(p.NgaySuaCuoi,true)+'</small>') : '-'}</td>
            <td>
                <button class="btn-edit" onclick="viewInvoiceDetails('${p.MaHD}')" style="padding: 4px 10px; font-size: 0.75rem;"><i class="fa-solid fa-eye"></i> Chi tiết</button>
            </td>
        </tr>
    `).join('');
}

async function viewInvoiceDetails(mahd) {
    const hd = invoicesData.find(x => x.MaHD === mahd);
    if (!hd) return;
    
    document.getElementById('invoiceModalTitle').innerText = 'Chi Tiết Hóa Đơn ' + mahd;
    document.getElementById('hd-mahd').value = mahd;
    document.getElementById('hd-ghichu').value = hd.GhiChu || '';
    document.getElementById('hd-pttt').value = hd.PhuongThucTT || 'Tiền mặt';
    
    try {
        const res = await fetch(`/api/invoices/${mahd}`);
        const details = await res.json();
        const tbody = document.getElementById('invoiceDetailsBody');
        tbody.innerHTML = details.map(d => `
            <tr>
                <td>${d.TenSP}<br><small>${d.MaSP}</small></td>
                <td>${d.MaLo}</td>
                <td>
                    <div style="display:flex; gap:5px; align-items:center;">
                        <input type="number" id="qty-${mahd}-${d.MaSP}-${d.MaLo}" value="${d.SoLuong}" style="width: 60px; padding: 2px; border: 1px solid #ddd; border-radius: 4px;">
                        <button onclick="saveItemInvoice('${mahd}', '${d.MaSP}', '${d.MaLo}')" style="padding: 2px 8px; cursor: pointer; background: var(--primary-color); color: white; border: none; border-radius: 4px; font-size: 0.8rem;">Lưu</button>
                    </div>
                </td>
                <td>${fmt(d.DonGia)}</td>
                <td>${fmt(d.ThanhTien)}</td>
            </tr>
        `).join('');
        
        document.getElementById('invoiceModalOverlay').classList.add('show');
    } catch (e) {
        showToast('Lỗi tải chi tiết!', true);
    }
}

function closeInvoiceModal(e) {
    if (e && e.target !== document.getElementById('invoiceModalOverlay')) return;
    document.getElementById('invoiceModalOverlay').classList.remove('show');
}

async function saveItemInvoice(mahd, masp, malo) {
    const qty = document.getElementById(`qty-${mahd}-${masp}-${malo}`).value;
    const currentUser = sessionStorage.getItem('manv') || 'NV003';
    try {
        const res = await fetch(`/api/invoices/${mahd}/items/${masp}/${malo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SoLuong: qty, MaNV: currentUser })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Sửa số lượng thành công!');
            viewInvoiceDetails(mahd);
            loadInvoices();
        } else {
            showToast(data.error || 'Lỗi lưu', true);
        }
    } catch (e) { showToast('Lỗi kết nối', true); }
}

async function saveInvoiceDetails() {
    const mahd = document.getElementById('hd-mahd').value;
    const ghichu = document.getElementById('hd-ghichu').value;
    const pttt = document.getElementById('hd-pttt').value;
    const currentUser = sessionStorage.getItem('manv') || 'NV003';
    
    try {
        const res = await fetch(`/api/invoices/${mahd}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MaNVSuaCuoi: currentUser,
                GhiChu: ghichu,
                PhuongThucTT: pttt
            })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Lưu hóa đơn thành công!');
            closeInvoiceModal();
            loadInvoices();
        } else {
            showToast(data.error || 'Lỗi lưu', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối', true);
    }
}

// ----- Import History -----
async function loadSuppliersSelect() {
    try {
        const res = await fetch('/api/suppliers');
        const suppliers = await res.json();
        const sel = document.getElementById('pn-ncc');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Chọn NCC --</option>';
        suppliers.forEach(s => {
            sel.innerHTML += `<option value="${s.MaNCC}">${s.TenNCC}</option>`;
        });
    } catch (e) { }
}

async function loadImportHistory() {
    try {
        const res = await fetch('/api/import_invoices');
        importHistoryData = await res.json();
        renderImportHistory();
    } catch (e) { console.error(e); }
}

function renderImportHistory() {
    const tbody = document.getElementById('importHistoryBody');
    if (!tbody) return;
    tbody.innerHTML = importHistoryData.map(p => `
        <tr>
            <td><strong>${p.MaPN}</strong></td>
            <td>${fmtDate(p.NgayNhap, true)}</td>
            <td>${p.MaNV}</td>
            <td>${p.TenNCC}</td>
            <td><strong>${fmt(p.TongTien)}</strong></td>
            <td>${p.MaNVSuaCuoi ? (p.MaNVSuaCuoi + '<br><small>'+fmtDate(p.NgaySuaCuoi,true)+'</small>') : '-'}</td>
            <td>
                <button class="btn-edit" onclick="viewPnDetails('${p.MaPN}')" style="padding: 4px 10px; font-size: 0.75rem;"><i class="fa-solid fa-eye"></i> Chi tiết</button>
            </td>
        </tr>
    `).join('');
}

async function viewPnDetails(mapn) {
    const pn = importHistoryData.find(x => x.MaPN === mapn);
    if (!pn) return;
    
    document.getElementById('pnModalTitle').innerText = 'Chi Tiết Phiếu Nhập ' + mapn;
    document.getElementById('pn-mapn').value = mapn;
    document.getElementById('pn-ghichu').value = pn.GhiChu || '';
    document.getElementById('pn-ncc').value = pn.MaNCC || '';
    
    try {
        const res = await fetch(`/api/import_invoices/${mapn}`);
        const details = await res.json();
        const tbody = document.getElementById('pnDetailsBody');
        tbody.innerHTML = details.map(d => `
            <tr>
                <td>${d.TenSP}<br><small>${d.MaSP}</small></td>
                <td>
                    <div style="display:flex; gap:5px; align-items:center;">
                        <input type="number" id="pnqty-${mapn}-${d.MaSP}" value="${d.SoLuong}" style="width: 60px; padding: 2px; border: 1px solid #ddd; border-radius: 4px;">
                        <button onclick="saveItemPn('${mapn}', '${d.MaSP}')" style="padding: 2px 8px; cursor: pointer; background: var(--primary-color); color: white; border: none; border-radius: 4px; font-size: 0.8rem;">Lưu</button>
                    </div>
                </td>
                <td>${fmt(d.GiaNhap)}</td>
                <td>${fmtDate(d.NgaySanXuat)}</td>
                <td>${fmtDate(d.HanSuDung)}</td>
            </tr>
        `).join('');
        
        document.getElementById('pnModalOverlay').classList.add('show');
    } catch (e) {
        showToast('Lỗi tải chi tiết!', true);
    }
}

function closePnModal(e) {
    if (e && e.target !== document.getElementById('pnModalOverlay')) return;
    document.getElementById('pnModalOverlay').classList.remove('show');
}

async function saveItemPn(mapn, masp) {
    const qty = document.getElementById(`pnqty-${mapn}-${masp}`).value;
    const currentUser = sessionStorage.getItem('manv') || 'NV003';
    try {
        const res = await fetch(`/api/import_invoices/${mapn}/items/${masp}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SoLuong: qty, MaNV: currentUser })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Sửa số lượng thành công!');
            viewPnDetails(mapn);
            loadImportHistory();
        } else {
            showToast(data.error || 'Lỗi lưu', true);
        }
    } catch (e) { showToast('Lỗi kết nối', true); }
}

async function savePnDetails() {
    const mapn = document.getElementById('pn-mapn').value;
    const ghichu = document.getElementById('pn-ghichu').value;
    const mancc = document.getElementById('pn-ncc').value;
    const currentUser = sessionStorage.getItem('manv') || 'NV003';
    
    try {
        const res = await fetch(`/api/import_invoices/${mapn}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MaNVSuaCuoi: currentUser,
                GhiChu: ghichu,
                MaNCC: mancc
            })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('Lưu phiếu nhập thành công!');
            closePnModal();
            loadImportHistory();
        } else {
            showToast(data.error || 'Lỗi lưu', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối', true);
    }
}

// ===== TOAST =====
function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = isError ? 'var(--danger)' : 'var(--success)';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== DESTROY HISTORY =====
async function loadDestroyHistory() {
    try {
        const res = await fetch('/api/inventory/destroy_history');
        const data = await res.json();
        const tbody = document.getElementById('destroyHistoryBody');
        tbody.innerHTML = data.map(r => `
            <tr>
                <td><strong>#${r.MaTieuHuy}</strong></td>
                <td>${r.TenSP} (${r.MaSP})</td>
                <td>${r.MaLo}</td>
                <td style="color:var(--red); font-weight:bold;">-${r.SoLuongHuy}</td>
                <td>${r.TenNV} (${r.MaNV})</td>
                <td>${new Date(r.NgayTieuHuy).toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Lỗi tải lịch sử hủy:', e);
    }
}

// ===== SUPPLIERS ADMIN =====
async function loadAdminSuppliers() {
    try {
        const res = await fetch('/api/suppliers');
        adminSuppliersData = await res.json();
        renderAdminSuppliers();
    } catch (e) { console.error(e); }
}

function renderAdminSuppliers() {
    const tbody = document.getElementById('suppliersBody');
    if (!tbody) return;
    
    let filtered = adminSuppliersData;
    if (searchTerm) {
        filtered = filtered.filter(s => 
            s.TenNCC.toLowerCase().includes(searchTerm) || 
            s.MaNCC.toLowerCase().includes(searchTerm)
        );
    }

    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td><strong>${s.MaNCC}</strong></td>
            <td>${s.TenNCC}</td>
            <td>${s.SoDienThoai || ''}</td>
            <td>${s.DiaChi || ''}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editSupplier('${s.MaNCC}')"><i class="fa-solid fa-pen"></i> Sửa</button>
                <button class="btn-danger" onclick="deleteSupplier('${s.MaNCC}')"><i class="fa-solid fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

function showSupplierForm() {
    editingSupplier = null;
    document.getElementById('supplierFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Thêm Nhà Cung Cấp Mới';
    document.getElementById('sf-mancc').value = '';
    document.getElementById('sf-mancc').readOnly = false;
    document.getElementById('sf-tenncc').value = '';
    document.getElementById('sf-sdt').value = '';
    document.getElementById('sf-diachi').value = '';
    document.getElementById('supplierForm').style.display = 'block';
}

function editSupplier(maNCC) {
    editingSupplier = adminSuppliersData.find(s => s.MaNCC === maNCC);
    if (!editingSupplier) return;
    
    document.getElementById('supplierFormTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Cập Nhật Nhà Cung Cấp';
    document.getElementById('sf-mancc').value = editingSupplier.MaNCC;
    document.getElementById('sf-mancc').readOnly = true;
    document.getElementById('sf-tenncc').value = editingSupplier.TenNCC;
    document.getElementById('sf-sdt').value = editingSupplier.SoDienThoai || '';
    document.getElementById('sf-diachi').value = editingSupplier.DiaChi || '';
    document.getElementById('supplierForm').style.display = 'block';
}

function hideSupplierForm() {
    document.getElementById('supplierForm').style.display = 'none';
    editingSupplier = null;
}

async function submitSupplier(e) {
    e.preventDefault();
    const data = {
        MaNCC: document.getElementById('sf-mancc').value,
        TenNCC: document.getElementById('sf-tenncc').value,
        SoDienThoai: document.getElementById('sf-sdt').value,
        DiaChi: document.getElementById('sf-diachi').value
    };

    const url = editingSupplier ? `/api/suppliers/${editingSupplier.MaNCC}` : '/api/suppliers';
    const method = editingSupplier ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if (result.status === 'success') {
            showToast(editingSupplier ? 'Đã cập nhật!' : 'Đã thêm thành công!');
            hideSupplierForm();
            loadAdminSuppliers();
            loadSuppliersSelect(); // refresh the import dropdown as well
        } else {
            showToast(result.error, true);
        }
    } catch (err) {
        showToast('Có lỗi xảy ra!', true);
    }
}

async function deleteSupplier(maNCC) {
    if (!confirm(`Bạn có chắc muốn xóa nhà cung cấp ${maNCC}?`)) return;
    
    try {
        const res = await fetch(`/api/suppliers/${maNCC}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.status === 'success') {
            showToast('Đã xóa nhà cung cấp!');
            loadAdminSuppliers();
            loadSuppliersSelect();
        } else {
            showToast(result.error, true);
        }
    } catch (err) {
        showToast('Lỗi khi xóa!', true);
    }
}

// ===== LOGOUT =====
async function logout() {
    await fetch('/api/logout');
    window.location.href = '/login';
}
