// ===== KHO — Quản lý kho Bách Hóa Xanh =====

let inventoryData = [];
let importProductsList = [];
let searchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadLowStock();
    loadProductsSelect();
    loadSuppliersSelect();
    loadImportHistory();
    loadDestroyHistory();
});

function fmt(n) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}

function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN');
}

// ===== SIDEBAR TAB SWITCHING =====
function switchTab(tabId, el) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');

    const titles = {
        'tab-inventory': '<i class="fa-solid fa-boxes-stacked"></i> Quản Lý Tồn Kho',
        'tab-import': '<i class="fa-solid fa-truck-ramp-box"></i> Nhập Kho',
        'tab-alerts': '<i class="fa-solid fa-triangle-exclamation"></i> Cảnh Báo Hạn Sử Dụng',
        'tab-destroy-history': '<i class="fa-solid fa-fire"></i> Lịch Sử Tiêu Hủy'
    };
    document.getElementById('pageTitle').innerHTML = titles[tabId] || '';

    if (tabId === 'tab-alerts') renderAlerts();
}

// ===== LOAD INVENTORY =====
async function loadInventory() {
    try {
        const res = await fetch('/api/inventory');
        inventoryData = await res.json();
        renderInventory();
        renderStats();
    } catch (e) {
        console.error('Load inventory error:', e);
    }
}

function handleSearch() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    renderInventory();
}

function renderInventory() {
    const tbody = document.getElementById('inventoryBody');
    let data = inventoryData;
    if (searchTerm) {
        data = data.filter(r =>
            (r.TenSP || '').toLowerCase().includes(searchTerm) ||
            (r.MaSP || '').toLowerCase().includes(searchTerm)
        );
    }

    tbody.innerHTML = data.map(r => {
        let badgeClass = 'badge-green';
        let status = r.TrangThai || 'Bình thường';
        let sLower = status.toLowerCase();
        if (sLower.includes('đã hết hạn')) badgeClass = 'badge-red';
        else if (sLower.includes('sắp hết') || sLower.includes('gần hết')) badgeClass = 'badge-orange';

        return `<tr>
            <td>
                <img src="/static/image/${r.MaSP}.jpg" style="width: 48px; height: 48px; object-fit: contain; background: #fff; border-radius: 6px; border: 1px solid #eee;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ccc%22 font-size=%2224%22>🛒</text></svg>'">
            </td>
            <td>${r.MaLo}</td>
            <td>${r.MaSP}</td>
            <td>${r.TenSP}</td>
            <td>${fmtDate(r.NgaySanXuat)}</td>
            <td>${fmtDate(r.HanSuDung)}</td>
            <td><strong>${r.SoLuongTon}</strong></td>
            <td>${fmt(r.GiaNhap || 0)}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
            <td>
                <button class="btn-edit" onclick="editInventory('${r.MaLo}', ${r.SoLuongTon})" style="padding: 4px 10px; font-size: 0.75rem; background: none; border: 1px solid #bfdbfe; color: #3b82f6; border-radius: 4px; cursor: pointer;">Sửa SL</button>
            </td>
        </tr>`;
    }).join('');
}

function renderStats() {
    const total = inventoryData.length;
    const expired = inventoryData.filter(r => (r.TrangThai || '').toLowerCase().includes('đã hết hạn')).length;
    const nearExpiry = inventoryData.filter(r => {
        const s = (r.TrangThai || '').toLowerCase();
        return s.includes('sắp hết') || s.includes('gần hết');
    }).length;
    const ok = total - expired - nearExpiry;

    document.getElementById('statsRow').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue"><i class="fa-solid fa-cubes"></i></div>
            <div class="stat-text"><h3>${total}</h3><p>Tổng số lô hàng</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><i class="fa-solid fa-check-circle"></i></div>
            <div class="stat-text"><h3>${ok}</h3><p>Còn hạn sử dụng</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange"><i class="fa-solid fa-clock"></i></div>
            <div class="stat-text"><h3>${nearExpiry}</h3><p>Sắp hết hạn (&lt;7 ngày)</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-ban"></i></div>
            <div class="stat-text"><h3>${expired}</h3><p>Đã hết hạn</p></div>
        </div>
    `;
}

// ===== ALERTS =====
function renderAlerts() {
    const nearExpiry = inventoryData.filter(r => {
        const days = r.SoNgayConLai;
        return days !== null && days !== undefined && days <= 7;
    });

    const critical = nearExpiry.filter(r => r.SoNgayConLai <= 0).length;
    const warning = nearExpiry.filter(r => r.SoNgayConLai > 0 && r.SoNgayConLai <= 7).length;

    document.getElementById('alertStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon red"><i class="fa-solid fa-skull-crossbones"></i></div>
            <div class="stat-text"><h3>${critical}</h3><p>Đã hết hạn (cần tiêu hủy)</p></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange"><i class="fa-solid fa-exclamation-triangle"></i></div>
            <div class="stat-text"><h3>${warning}</h3><p>Sắp hết hạn (cần xả hàng)</p></div>
        </div>
    `;

    const container = document.getElementById('alertCards');
    if (nearExpiry.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); padding:40px; text-align:center;"><i class="fa-solid fa-face-smile" style="font-size:2rem; display:block; margin-bottom:10px; opacity:0.4;"></i>Không có lô hàng nào sắp hết hạn!</p>';
        return;
    }

    container.innerHTML = nearExpiry.map(r => {
        const isCritical = r.SoNgayConLai <= 0;
        let actionBtn = '';
        if (isCritical) {
            actionBtn = `<button class="btn-primary" onclick="destroyExpired('${r.MaLo}', '${r.MaSP}', ${r.SoLuongTon})" style="background:var(--red); padding:5px 10px; margin-top:8px; font-size:0.8rem; width:100%;"><i class="fa-solid fa-fire"></i> Tiêu Hủy Hàng Tồn</button>`;
        }
        return `
        <div class="alert-card ${isCritical ? 'critical' : ''}">
            <div class="alert-icon">${isCritical ? '🚫' : '⚠️'}</div>
            <div class="alert-body" style="flex:1;">
                <h4>${r.TenSP} (Lô #${r.MaLo})</h4>
                <p>HSD: ${fmtDate(r.HanSuDung)} — Còn ${r.SoNgayConLai} ngày — SL: ${r.SoLuongTon}</p>
                ${actionBtn}
            </div>
        </div>`;
    }).join('');
}

async function destroyExpired(malo, masp, currentQty) {
    if(!confirm(`Xác nhận tiêu hủy ${currentQty} sản phẩm của lô #${malo}? Thao tác này sẽ trừ kho và ghi nhận lịch sử tiêu hủy.`)) return;
    try {
        const res = await fetch('/api/inventory/destroy', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ma_lo: malo,
                ma_sp: masp,
                so_luong: currentQty,
                ma_nv: sessionStorage.getItem('manv') || 'NV002'
            })
        });
        const data = await res.json();
        if(data.status === 'success') {
            showToast('Đã tiêu hủy lô hàng!');
            // Reload all lists
            loadInventory();
            loadDestroyHistory();
        } else {
            showToast(data.error || 'Lỗi tiêu hủy', true);
        }
    } catch(e) {
        showToast('Lỗi kết nối', true);
    }
}

async function editInventory(malo, currentQty) {
    const newQty = prompt(`Nhập số lượng tồn kho thực tế cho Lô #${malo}:`, currentQty);
    if (newQty === null) return;
    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty < 0) {
        showToast('Số lượng không hợp lệ!', true);
        return;
    }
    
    try {
        const res = await fetch(`/api/inventory/${malo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SoLuongTon: qty })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('✓ Đã cập nhật số lượng!');
            loadInventory();
        } else {
            showToast(data.error || 'Lỗi cập nhật!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối!', true);
    }
}

// ===== LOAD SELECTS =====
async function loadProductsSelect() {
    try {
        const res = await fetch('/api/products');
        importProductsList = await res.json();
        renderImportProductsSelect(importProductsList);
    } catch (e) {
        console.error(e);
    }
}

function renderImportProductsSelect(products) {
    const sel = document.getElementById('imp-product');
    sel.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
    products.forEach(p => {
        sel.innerHTML += `<option value="${p.MaSP}">${p.TenSP} (${p.MaSP})</option>`;
    });
}

function filterImportProducts() {
    const q = document.getElementById('imp-search').value.toLowerCase().trim();
    if (!q) {
        renderImportProductsSelect(importProductsList);
        return;
    }
    const filtered = importProductsList.filter(p => 
        p.TenSP.toLowerCase().includes(q) || p.MaSP.toLowerCase().includes(q)
    );
    renderImportProductsSelect(filtered);
}


async function loadSuppliersSelect() {
    try {
        const res = await fetch('/api/suppliers');
        const suppliers = await res.json();
        const sel = document.getElementById('imp-supplier');
        const sel2 = document.getElementById('pn-ncc');
        sel.innerHTML = '<option value="">-- Chọn NCC --</option>';
        if (sel2) sel2.innerHTML = '<option value="">-- Chọn NCC --</option>';
        suppliers.forEach(s => {
            sel.innerHTML += `<option value="${s.MaNCC}">${s.TenNCC}</option>`;
            if (sel2) sel2.innerHTML += `<option value="${s.MaNCC}">${s.TenNCC}</option>`;
        });
    } catch (e) {
        // Fallback
        const sel = document.getElementById('imp-supplier');
        sel.innerHTML = '<option value="NCC01">NCC Mặc định</option>';
    }
}

// ===== LOAD LOW STOCK =====
async function loadLowStock() {
    try {
        const res = await fetch('/api/inventory/low_stock');
        const data = await res.json();
        
        const outOfStock = data.filter(r => parseFloat(r.TongTonKho) <= 0).length;
        const lowStock = data.filter(r => parseFloat(r.TongTonKho) > 0 && parseFloat(r.TongTonKho) <= 10).length;

        document.getElementById('lowStockStats').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon red"><i class="fa-solid fa-battery-empty"></i></div>
                <div class="stat-text"><h3>${outOfStock}</h3><p>Hết hàng (cần nhập ngay)</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fa-solid fa-battery-quarter"></i></div>
                <div class="stat-text"><h3>${lowStock}</h3><p>Sắp hết hàng (<= 10)</p></div>
            </div>
        `;

        const container = document.getElementById('lowStockCards');
        if (data.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); padding:40px; text-align:center;"><i class="fa-solid fa-face-smile" style="font-size:2rem; display:block; margin-bottom:10px; opacity:0.4;"></i>Tuyệt vời! Không có sản phẩm nào sắp hết hàng!</p>';
            return;
        }

        container.innerHTML = data.map(r => {
            const tongTon = parseFloat(r.TongTonKho);
            const isCritical = tongTon <= 0;
            const actionBtn = `<button class="btn-primary" onclick="goToImportTab('${r.MaSP}')" style="padding:5px 10px; margin-top:8px; font-size:0.8rem; width:100%; border:none; border-radius:6px; cursor:pointer; color:white;"><i class="fa-solid fa-truck-ramp-box"></i> Nhập Hàng Ngay</button>`;
            return `
            <div class="alert-card ${isCritical ? 'critical' : ''}">
                <div class="alert-icon">${isCritical ? '🚫' : '⚠️'}</div>
                <div class="alert-body" style="flex:1;">
                    <h4>${r.TenSP} (${r.MaSP})</h4>
                    <p>Tổng Tồn Kho: <strong style="color: ${isCritical ? 'var(--red)' : 'var(--orange)'}">${r.TongTonKho}</strong> — Tình trạng: ${r.TrangThai}</p>
                    ${actionBtn}
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Load low stock error:', e);
    }
}

function goToImportTab(maSP) {
    // Switch to import tab
    switchTab('tab-import', document.querySelectorAll('.sidebar-nav a')[1]);
    // Select the product
    document.getElementById('imp-product').value = maSP;
}

// ===== DESTROY INVENTORY =====
async function submitImport(e) {
    e.preventDefault();
    const payload = {
        ma_sp: document.getElementById('imp-product').value,
        ma_ncc: document.getElementById('imp-supplier').value,
        so_luong: parseFloat(document.getElementById('imp-qty').value),
        gia_nhap: parseFloat(document.getElementById('imp-price').value),
        ngay_sx: document.getElementById('imp-mfg').value || null,
        han_sd: document.getElementById('imp-exp').value,
        ma_nv: sessionStorage.getItem('manv') || 'NV002'
    };

    try {
        const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('✓ Nhập kho thành công!');
            document.getElementById('importForm').reset();
            loadInventory();
            loadImportHistory();
            loadLowStock();
        } else {
            showToast(data.error || 'Lỗi nhập kho!', true);
        }
    } catch (err) {
        showToast('Lỗi kết nối!', true);
    }
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
                <td>${fmtDate(r.NgayTieuHuy, true)}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

// ===== IMPORT HISTORY =====
let importHistoryData = [];

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
    const currentUser = sessionStorage.getItem('manv') || 'NV002';
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
    
    // Giả lập lấy mã nhân viên đang đăng nhập (trong thực tế lấy từ session/localStorage)
    const currentUser = localStorage.getItem('manv') || 'NV002'; // NV kho
    
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
            showToast(data.error || 'Lỗi lưu dữ liệu', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối', true);
    }
}

function fmtDate(dStr, includeTime=false) {
    if (!dStr) return '-';
    try {
        const d = new Date(dStr);
        let s = d.toLocaleDateString('vi-VN');
        if(includeTime) s += ' ' + d.toLocaleTimeString('vi-VN');
        return s;
    } catch (e) { return dStr; }
}

function fmt(num) {
    return Number(num).toLocaleString('vi-VN') + 'đ';
}

// ===== TOAST =====
function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.background = isError ? 'var(--danger)' : 'var(--success)';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== LOGOUT =====
function logout() {
    sessionStorage.clear();
    window.location.href = '/login';
}
