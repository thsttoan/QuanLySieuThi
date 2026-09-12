// ===== KHO — Quản lý kho Bách Hóa Xanh =====

let inventoryData = [];
let allProductsList = [];
let categoriesList = [];
let suppliersList = [];
let searchTerm = '';

// Bộ nhớ trạng thái thao tác hàng loạt
let selectedLots = new Map(); // key: malo -> { malo, masp, tensp, hsd, ton, slHuy }
let batchImportSelected = new Map(); // key: masp -> { masp, tensp, dvt, ton, gianhap, soluong, hsd, thanhtien }

document.addEventListener('DOMContentLoaded', () => {
    initDefaultDates();
    loadCategories();
    loadProductsSelect();
    loadSuppliersSelect();
    loadInventory();
    loadLowStock();
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

function initDefaultDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const mfgInput = document.getElementById('batch-mfg');
    if (mfgInput) mfgInput.value = todayStr;

    // Mặc định HSD chung = hôm nay + 10 ngày
    setQuickExp(10);
}

// ===== SIDEBAR TAB SWITCHING =====
function switchTab(tabId, el) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (el) el.classList.add('active');

    const titles = {
        'tab-inventory': '<i class="fa-solid fa-boxes-stacked"></i> Quản Lý Tồn Kho',
        'tab-import': '<i class="fa-solid fa-truck-ramp-box"></i> Nhập Kho',
        'tab-alerts': '<i class="fa-solid fa-triangle-exclamation"></i> Cảnh Báo Hạn Sử Dụng',
        'tab-destroy-history': '<i class="fa-solid fa-fire"></i> Lịch Sử Tiêu Hủy'
    };
    document.getElementById('pageTitle').innerHTML = titles[tabId] || '';

    if (tabId === 'tab-alerts') renderAlerts();
}

// ===== 1. TỒN KHO & TIÊU HỦY HÀNG LOẠT =====
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
            <td><strong>#${r.MaLo}</strong></td>
            <td><code>${r.MaSP}</code></td>
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

function openBatchDestroyModal() {
    if (selectedLots.size === 0) {
        showToast('Vui lòng chọn ít nhất 1 lô hàng để tiêu hủy!', true);
        return;
    }

    const tbody = document.getElementById('batchDestroyModalBody');
    let totalQty = 0;

    tbody.innerHTML = Array.from(selectedLots.values()).map(l => {
        totalQty += l.slHuy;
        return `<tr>
            <td><strong>#${l.malo}</strong></td>
            <td>${l.tensp} (<code>${l.masp}</code>)</td>
            <td>${fmtDate(l.hsd)}</td>
            <td><strong>${l.ton}</strong></td>
            <td>
                <input type="number" step="0.1" min="0.1" max="${l.ton}" value="${l.slHuy}" 
                    style="width: 80px; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px;"
                    onchange="updateModalLotHuy(${l.malo}, this.value)">
            </td>
        </tr>`;
    }).join('');

    document.getElementById('modalDestroyCount').innerText = selectedLots.size;
    document.getElementById('modalDestroyTotalQty').innerText = totalQty.toFixed(1);
    document.getElementById('batchDestroyModalOverlay').classList.add('show');
}

function updateModalLotHuy(malo, val) {
    const item = selectedLots.get(malo);
    if (item) {
        const qty = parseFloat(val) || 0;
        item.slHuy = Math.min(Math.max(qty, 0), item.ton);
        let total = 0;
        selectedLots.forEach(l => total += l.slHuy);
        document.getElementById('modalDestroyTotalQty').innerText = total.toFixed(1);
    }
}

function closeBatchDestroyModal(e) {
    if (e && e.target !== document.getElementById('batchDestroyModalOverlay')) return;
    document.getElementById('batchDestroyModalOverlay').classList.remove('show');
}

async function confirmBatchDestroy() {
    const items = Array.from(selectedLots.values()).map(l => ({
        ma_lo: l.malo,
        ma_sp: l.masp,
        so_luong: l.slHuy
    }));

    if (items.length === 0) return;

    const reason = document.getElementById('batchDestroyReason').value.trim() || 'Hết hạn sử dụng';
    const manv = sessionStorage.getItem('manv') || 'kho1';

    try {
        const res = await fetch('/api/inventory/destroy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ma_nv: manv,
                ly_do: reason,
                items: items
            })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast(`✓ Đã tiêu hủy thành công ${items.length} lô hàng!`);
            closeBatchDestroyModal();
            selectedLots.clear();
            await loadInventory();
            renderAlerts();
            loadDestroyHistory();
            loadLowStock();
        } else {
            showToast(data.error || 'Lỗi tiêu hủy hàng loạt!', true);
        }
    } catch (e) {
        console.error('Batch destroy error:', e);
        showToast('Lỗi kết nối máy chủ!', true);
    }
}

function quickDestroySingle(malo, masp, tensp, currentQty) {
    selectedLots.clear();
    selectedLots.set(malo, {
        malo: malo,
        masp: masp,
        tensp: tensp,
        hsd: '',
        ton: currentQty,
        slHuy: currentQty
    });
    openBatchDestroyModal();
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

    const expiredLots = inventoryData.filter(r => {
        const s = (r.TrangThai || '').toLowerCase();
        return s.includes('đã hết hạn') || (r.SoNgayConLai !== null && r.SoNgayConLai <= 0);
    });

    const critical = expiredLots.length;
    const warning = nearExpiry.filter(r => r.SoNgayConLai > 0 && r.SoNgayConLai <= 7).length;

    let totalExpiredQty = 0;
    expiredLots.forEach(r => totalExpiredQty += parseFloat(r.SoLuongTon || 0));

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

    const batchBarContainer = document.getElementById('batchAlertsActionBar');
    if (batchBarContainer) {
        if (critical > 0) {
            batchBarContainer.innerHTML = `
                <div class="expired-batch-banner" style="background: linear-gradient(135deg, #fff1f2, #fee2e2); border: 1.5px solid #fca5a5; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.1);">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: #fee2e2; border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 1.4rem; flex-shrink: 0;">
                            <i class="fa-solid fa-fire-flame-curved"></i>
                        </div>
                        <div>
                            <h3 style="color: #991b1b; font-size: 1.1rem; font-weight: 700; margin-bottom: 3px;">
                                Tiêu Hủy Nhanh Hàng Loạt (${critical} Lô Đã Hết Hạn)
                            </h3>
                            <p style="color: #b91c1c; font-size: 0.88rem; margin: 0;">
                                Phát hiện <strong>${critical}</strong> lô hàng của nhiều sản phẩm khác nhau đã quá hạn sử dụng (Tổng tồn: <strong>${totalExpiredQty.toFixed(1)}</strong> đơn vị).
                            </p>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="btn-batch-destroy" onclick="openBatchDestroyExpiredModal()" style="padding: 10px 22px; font-size: 0.95rem; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);">
                            <i class="fa-solid fa-fire"></i> Tiêu Hủy Nhanh Tất Cả (${critical} Lô)
                        </button>
                    </div>
                </div>
            `;
        } else {
            batchBarContainer.innerHTML = '';
        }
    }

    const container = document.getElementById('alertCards');
    if (nearExpiry.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); padding:40px; text-align:center;"><i class="fa-solid fa-face-smile" style="font-size:2rem; display:block; margin-bottom:10px; opacity:0.4;"></i>Không có lô hàng nào sắp hết hạn!</p>';
        return;
    }

    container.innerHTML = nearExpiry.map(r => {
        const isCritical = r.SoNgayConLai <= 0;
        let actionBtn = '';
        if (isCritical) {
            const escapedTenSP = (r.TenSP || '').replace(/'/g, "\\'");
            actionBtn = `<button class="btn-primary" onclick="quickDestroySingle(${r.MaLo}, '${r.MaSP}', '${escapedTenSP}', ${r.SoLuongTon})" style="background:var(--red); padding:6px 12px; margin-top:8px; font-size:0.82rem; width:100%; border:none; border-radius:6px; cursor:pointer; color:white;"><i class="fa-solid fa-fire"></i> Tiêu Hủy Lô Này</button>`;
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

function openBatchDestroyExpiredModal() {
    const expiredLots = inventoryData.filter(r => {
        const s = (r.TrangThai || '').toLowerCase();
        return s.includes('đã hết hạn') || (r.SoNgayConLai !== null && r.SoNgayConLai <= 0);
    });

    if (expiredLots.length === 0) {
        showToast('Hiện không có lô hàng nào đã hết hạn!', true);
        return;
    }

    selectedLots.clear();
    expiredLots.forEach(r => {
        selectedLots.set(r.MaLo, {
            malo: r.MaLo,
            masp: r.MaSP,
            tensp: r.TenSP,
            hsd: r.HanSuDung,
            ton: parseFloat(r.SoLuongTon || 0),
            slHuy: parseFloat(r.SoLuongTon || 0)
        });
    });

    openBatchDestroyModal();
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

// ===== 2. NHẬP HÀNG LOẠT THEO DANH MỤC & HIỂN THỊ TỒN KHO =====

function switchImportMode(mode) {
    const batchBtn = document.getElementById('btnModeBatch');
    const singleBtn = document.getElementById('btnModeSingle');
    const batchContainer = document.getElementById('batchImportContainer');
    const singleContainer = document.getElementById('singleImportContainer');

    if (mode === 'batch') {
        batchBtn.classList.add('active');
        singleBtn.classList.remove('active');
        batchContainer.style.display = 'block';
        singleContainer.style.display = 'none';
        renderBatchTable();
    } else {
        singleBtn.classList.add('active');
        batchBtn.classList.remove('active');
        singleContainer.style.display = 'block';
        batchContainer.style.display = 'none';
    }
}

async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        categoriesList = await res.json();
        const sel = document.getElementById('batch-category');
        if (sel) {
            sel.innerHTML = categoriesList.map(c => 
                `<option value="${c.MaDanhMuc}">${c.MaDanhMuc} — ${c.TenDanhMuc}</option>`
            ).join('');
            
            // Mặc định chọn DM01
            if (categoriesList.length > 0) {
                sel.value = categoriesList[0].MaDanhMuc;
                onBatchCategoryChange();
            }
        }
    } catch (e) {
        console.error('Load categories error:', e);
    }
}

async function loadProductsSelect() {
    try {
        const res = await fetch('/api/products');
        allProductsList = await res.json();
        renderSingleImportProductsSelect(allProductsList);
        renderBatchTable();
    } catch (e) {
        console.error('Load products error:', e);
    }
}

function renderSingleImportProductsSelect(products) {
    const sel = document.getElementById('imp-product');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
    products.forEach(p => {
        sel.innerHTML += `<option value="${p.MaSP}">${p.TenSP} (${p.MaSP}) — Tồn: ${parseFloat(p.TongTonKho || 0)}</option>`;
    });
}

function filterImportProducts() {
    const q = document.getElementById('imp-search').value.toLowerCase().trim();
    if (!q) {
        renderSingleImportProductsSelect(allProductsList);
        return;
    }
    const filtered = allProductsList.filter(p => 
        p.TenSP.toLowerCase().includes(q) || p.MaSP.toLowerCase().includes(q)
    );
    renderSingleImportProductsSelect(filtered);
}

async function loadSuppliersSelect() {
    try {
        const res = await fetch('/api/suppliers');
        suppliersList = await res.json();
        
        ['imp-supplier', 'pn-ncc', 'batch-supplier'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = suppliersList.map(s => 
                    `<option value="${s.MaNCC}">${s.TenNCC} (${s.MaNCC})</option>`
                ).join('');
            }
        });
        // Tự động map nhà cung cấp theo danh mục đang chọn
        mapSupplierByCategory();
    } catch (e) {
        console.error('Load suppliers error:', e);
    }
}

function onBatchCategoryChange() {
    mapSupplierByCategory();
    batchImportSelected.clear();
    renderBatchTable();
    updateBatchSummary();
}

function mapSupplierByCategory() {
    const catSel = document.getElementById('batch-category');
    const nccSel = document.getElementById('batch-supplier');
    if (!catSel || !nccSel) return;

    const cat = catSel.value;
    // Map theo ngành hàng
    let targetNCC = 'NCC01';
    if (cat === 'DM01') targetNCC = 'NCC02'; // C.P. Thịt cá
    else if (cat === 'DM02') targetNCC = 'NCC01'; // Rau sạch Đà Lạt
    else if (cat === 'DM06' || cat === 'DM07') targetNCC = 'NCC03'; // TH True Milk
    else if (cat === 'DM04' || cat === 'DM05') targetNCC = 'NCC04'; // Acecook
    else if (cat === 'DM12' || cat === 'DM13') targetNCC = 'NCC05'; // Unilever

    if (suppliersList.some(s => s.MaNCC === targetNCC)) {
        nccSel.value = targetNCC;
    }
}

function setQuickExp(days) {
    const mfgVal = document.getElementById('batch-mfg')?.value;
    const baseDate = mfgVal ? new Date(mfgVal) : new Date();
    baseDate.setDate(baseDate.getDate() + days);

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(baseDate.getDate()).padStart(2, '0');
    const expStr = `${yyyy}-${mm}-${dd}`;

    const expInput = document.getElementById('batch-exp');
    if (expInput) {
        expInput.value = expStr;
        applyBatchExpToAll();
    }
}

function applyBatchExpToAll() {
    const commonExp = document.getElementById('batch-exp')?.value;
    if (!commonExp) return;

    batchImportSelected.forEach(item => {
        item.hsd = commonExp;
    });

    // Update all date inputs in batch table
    document.querySelectorAll('.batch-row-exp').forEach(inp => {
        inp.value = commonExp;
    });
}

function renderBatchTable() {
    const tbody = document.getElementById('batchTableBody');
    if (!tbody) return;

    const catId = document.getElementById('batch-category')?.value;
    const search = (document.getElementById('batch-search')?.value || '').toLowerCase().trim();
    const stockFilter = document.getElementById('batch-stock-filter')?.value || 'ALL';
    const commonExp = document.getElementById('batch-exp')?.value || '';
    const quickQty = parseFloat(document.getElementById('batch-quick-qty')?.value) || 30;

    let items = allProductsList.filter(p => p.MaDanhMuc === catId);

    if (search) {
        items = items.filter(p => 
            p.TenSP.toLowerCase().includes(search) || 
            p.MaSP.toLowerCase().includes(search)
        );
    }

    if (allProductsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; opacity: 0.5; display: block; margin-bottom: 8px;"></i>
            Đang tải danh sách sản phẩm...
        </td></tr>`;
        return;
    }

    if (stockFilter === 'EMPTY') {
        items = items.filter(p => parseFloat(p.TongTonKho || 0) <= 0);
    } else if (stockFilter === 'LOW10') {
        items = items.filter(p => parseFloat(p.TongTonKho || 0) <= 10);
    } else if (stockFilter === 'LOW30') {
        items = items.filter(p => parseFloat(p.TongTonKho || 0) <= 30);
    } else if (stockFilter === 'OK') {
        items = items.filter(p => parseFloat(p.TongTonKho || 0) > 30);
    }

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 30px; color: var(--text-muted);">
            <i class="fa-solid fa-box-open" style="font-size: 1.8rem; opacity: 0.3; display: block; margin-bottom: 8px;"></i>
            Không có sản phẩm nào phù hợp bộ lọc trong danh mục này!
            <div style="margin-top: 6px; font-size: 0.85rem; color: #64748b;">(Gợi ý: Nếu muốn xem toàn bộ sản phẩm danh mục này, hãy chuyển bộ lọc sang <strong>Tất cả mức tồn</strong>)</div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(p => {
        const isChecked = batchImportSelected.has(p.MaSP);
        const ton = parseFloat(p.TongTonKho || 0);
        const selectedData = batchImportSelected.get(p.MaSP) || {};

        const giaNhap = selectedData.gianhap !== undefined ? selectedData.gianhap : parseFloat(p.GiaNhapGoiY || (p.GiaBan * 0.75));
        const soLuong = selectedData.soluong !== undefined ? selectedData.soluong : quickQty;
        const hsd = selectedData.hsd || commonExp;
        const lineTotal = isChecked ? (soLuong * giaNhap) : 0;

        // Badge tồn kho trực quan
        let badgeStock = '';
        if (ton <= 0) {
            badgeStock = `<span class="badge-stock badge-stock-empty"><i class="fa-solid fa-circle-xmark"></i> Hết hàng (0)</span>`;
        } else if (ton <= 10) {
            badgeStock = `<span class="badge-stock badge-stock-warning"><i class="fa-solid fa-triangle-exclamation"></i> Sắp hết (${ton})</span>`;
        } else if (ton < 30) {
            badgeStock = `<span class="badge-stock badge-stock-low"><i class="fa-solid fa-circle-exclamation"></i> Mức thấp (${ton}) — Nên nhập</span>`;
        } else {
            badgeStock = `<span class="badge-stock badge-stock-ok"><i class="fa-solid fa-circle-check"></i> Còn ${ton}</span>`;
        }

        const escapedTenSP = (p.TenSP || '').replace(/'/g, "\\'");

        return `<tr class="${isChecked ? 'selected-row' : ''}">
            <td style="text-align: center;">
                <input type="checkbox" class="batch-check" 
                    ${isChecked ? 'checked' : ''} 
                    onchange="onBatchRowToggle('${p.MaSP}', '${escapedTenSP}', '${p.DonViTinh}', ${ton}, this.checked)">
            </td>
            <td>
                <img src="/static/image/${p.MaSP}.jpg" style="width: 40px; height: 40px; object-fit: contain; background: #fff; border-radius: 6px; border: 1px solid #eee;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2255%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ccc%22 font-size=%2220%22>🛒</text></svg>'">
            </td>
            <td><code>${p.MaSP}</code></td>
            <td><strong>${p.TenSP}</strong></td>
            <td>${p.DonViTinh}</td>
            <td style="text-align: center;">${badgeStock}</td>
            <td>
                <input type="number" id="b-price-${p.MaSP}" value="${giaNhap}" step="100" min="0" 
                    style="width: 100%;" 
                    oninput="onBatchRowChange('${p.MaSP}', 'gianhap', this.value)">
            </td>
            <td>
                <input type="number" id="b-qty-${p.MaSP}" value="${soLuong}" step="1" min="1" 
                    style="width: 100%; font-weight: 700; color: var(--primary);" 
                    oninput="onBatchRowChange('${p.MaSP}', 'soluong', this.value)">
            </td>
            <td>
                <input type="date" class="batch-row-exp" id="b-exp-${p.MaSP}" value="${hsd}" 
                    style="width: 100%;" 
                    onchange="onBatchRowChange('${p.MaSP}', 'hsd', this.value)">
            </td>
            <td style="text-align: right; font-weight: 600; color: #1e293b;" id="b-total-${p.MaSP}">
                ${fmt(lineTotal)}
            </td>
        </tr>`;
    }).join('');

    updateBatchSummary();
}

function onBatchRowToggle(masp, tensp, dvt, ton, checked) {
    if (checked) {
        const gianhap = parseFloat(document.getElementById(`b-price-${masp}`)?.value) || 0;
        const soluong = parseFloat(document.getElementById(`b-qty-${masp}`)?.value) || 30;
        const hsd = document.getElementById(`b-exp-${masp}`)?.value || document.getElementById('batch-exp')?.value;
        const lineTotal = soluong * gianhap;

        batchImportSelected.set(masp, {
            masp: masp,
            tensp: tensp,
            dvt: dvt,
            ton: ton,
            gianhap: gianhap,
            soluong: soluong,
            hsd: hsd,
            thanhtien: lineTotal
        });

        const totalCell = document.getElementById(`b-total-${masp}`);
        if (totalCell) totalCell.innerText = fmt(lineTotal);
    } else {
        batchImportSelected.delete(masp);
        const totalCell = document.getElementById(`b-total-${masp}`);
        if (totalCell) totalCell.innerText = fmt(0);
    }

    renderBatchTable();
}

function onBatchRowChange(masp, field, val) {
    const isChecked = batchImportSelected.has(masp);
    const p = allProductsList.find(x => x.MaSP === masp);
    if (!p) return;

    const gianhap = parseFloat(document.getElementById(`b-price-${masp}`)?.value) || 0;
    const soluong = parseFloat(document.getElementById(`b-qty-${masp}`)?.value) || 0;
    const hsd = document.getElementById(`b-exp-${masp}`)?.value || '';
    const lineTotal = soluong * gianhap;

    const totalCell = document.getElementById(`b-total-${masp}`);
    if (totalCell && isChecked) totalCell.innerText = fmt(lineTotal);

    if (isChecked) {
        const item = batchImportSelected.get(masp);
        item.gianhap = gianhap;
        item.soluong = soluong;
        item.hsd = hsd;
        item.thanhtien = lineTotal;
    }
    updateBatchSummary();
}

function toggleSelectAllBatch(checked) {
    const catId = document.getElementById('batch-category')?.value;
    const search = (document.getElementById('batch-search')?.value || '').toLowerCase().trim();
    const stockFilter = document.getElementById('batch-stock-filter')?.value || 'ALL';
    const commonExp = document.getElementById('batch-exp')?.value || '';
    const quickQty = parseFloat(document.getElementById('batch-quick-qty')?.value) || 30;

    let items = allProductsList.filter(p => p.MaDanhMuc === catId);
    if (search) items = items.filter(p => p.TenSP.toLowerCase().includes(search) || p.MaSP.toLowerCase().includes(search));
    if (stockFilter === 'EMPTY') items = items.filter(p => parseFloat(p.TongTonKho || 0) <= 0);
    else if (stockFilter === 'LOW10') items = items.filter(p => parseFloat(p.TongTonKho || 0) <= 10);
    else if (stockFilter === 'LOW30') items = items.filter(p => parseFloat(p.TongTonKho || 0) <= 30);
    else if (stockFilter === 'OK') items = items.filter(p => parseFloat(p.TongTonKho || 0) > 30);

    if (checked) {
        items.forEach(p => {
            const gianhap = parseFloat(document.getElementById(`b-price-${p.MaSP}`)?.value) || parseFloat(p.GiaNhapGoiY || (p.GiaBan * 0.75));
            const soluong = parseFloat(document.getElementById(`b-qty-${p.MaSP}`)?.value) || quickQty;
            const hsd = document.getElementById(`b-exp-${p.MaSP}`)?.value || commonExp;
            batchImportSelected.set(p.MaSP, {
                masp: p.MaSP,
                tensp: p.TenSP,
                dvt: p.DonViTinh,
                ton: parseFloat(p.TongTonKho || 0),
                gianhap: gianhap,
                soluong: soluong,
                hsd: hsd,
                thanhtien: soluong * gianhap
            });
        });
    } else {
        items.forEach(p => batchImportSelected.delete(p.MaSP));
    }
    renderBatchTable();
}

function selectLowStockBatch() {
    const catId = document.getElementById('batch-category')?.value;
    const commonExp = document.getElementById('batch-exp')?.value || '';
    const quickQty = parseFloat(document.getElementById('batch-quick-qty')?.value) || 30;

    const items = allProductsList.filter(p => p.MaDanhMuc === catId && parseFloat(p.TongTonKho || 0) <= 10);

    items.forEach(p => {
        const gianhap = parseFloat(document.getElementById(`b-price-${p.MaSP}`)?.value) || parseFloat(p.GiaNhapGoiY || (p.GiaBan * 0.75));
        const soluong = parseFloat(document.getElementById(`b-qty-${p.MaSP}`)?.value) || quickQty;
        const hsd = document.getElementById(`b-exp-${p.MaSP}`)?.value || commonExp;
        batchImportSelected.set(p.MaSP, {
            masp: p.MaSP,
            tensp: p.TenSP,
            dvt: p.DonViTinh,
            ton: parseFloat(p.TongTonKho || 0),
            gianhap: gianhap,
            soluong: soluong,
            hsd: hsd,
            thanhtien: soluong * gianhap
        });
    });

    renderBatchTable();
    showToast(`✓ Đã chọn ${items.length} sản phẩm có tồn ≤ 10 trong danh mục!`);
}

function applyQuickQtyToChecked() {
    const quickQty = parseFloat(document.getElementById('batch-quick-qty')?.value) || 30;
    batchImportSelected.forEach((item, masp) => {
        item.soluong = quickQty;
        item.thanhtien = quickQty * item.gianhap;
        const qtyInp = document.getElementById(`b-qty-${masp}`);
        if (qtyInp) qtyInp.value = quickQty;
        const totalCell = document.getElementById(`b-total-${masp}`);
        if (totalCell) totalCell.innerText = fmt(item.thanhtien);
    });
    updateBatchSummary();
    showToast(`✓ Đã gán số lượng ${quickQty} cho tất cả các sản phẩm đã chọn!`);
}

function updateBatchSummary() {
    const count = batchImportSelected.size;
    let totalQty = 0;
    let totalMoney = 0;

    batchImportSelected.forEach(it => {
        totalQty += it.soluong;
        totalMoney += it.thanhtien;
    });

    const countEl = document.getElementById('batchSelectedCount');
    const qtyEl = document.getElementById('batchSelectedQty');
    const moneyEl = document.getElementById('batchSelectedMoney');
    const submitCountEl = document.getElementById('batchSubmitCount');
    const submitBtn = document.getElementById('btnSubmitBatch');

    if (countEl) countEl.innerText = count;
    if (qtyEl) qtyEl.innerText = totalQty;
    if (moneyEl) moneyEl.innerText = fmt(totalMoney);
    if (submitCountEl) submitCountEl.innerText = count;

    if (submitBtn) {
        submitBtn.disabled = (count === 0);
    }
}

async function submitBatchImport() {
    const items = Array.from(batchImportSelected.values());
    if (items.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 sản phẩm để nhập kho!', true);
        return;
    }

    const supplier = document.getElementById('batch-supplier')?.value;
    if (!supplier) {
        showToast('Vui lòng chọn nhà cung cấp!', true);
        return;
    }

    const mfg = document.getElementById('batch-mfg')?.value || null;
    const manv = sessionStorage.getItem('manv') || 'kho1';

    // Kiểm tra tính hợp lệ
    for (let it of items) {
        if (!it.soluong || it.soluong <= 0) {
            showToast(`Số lượng của sản phẩm ${it.tensp} không hợp lệ!`, true);
            return;
        }
        if (!it.gianhap || it.gianhap <= 0) {
            showToast(`Giá nhập của sản phẩm ${it.tensp} không hợp lệ!`, true);
            return;
        }
        if (!it.hsd) {
            showToast(`Vui lòng nhập Hạn Sử Dụng cho sản phẩm ${it.tensp}!`, true);
            return;
        }
    }

    const payload = {
        ma_nv: manv,
        ma_ncc: supplier,
        items: items.map(it => ({
            ma_sp: it.masp,
            so_luong: it.soluong,
            gia_nhap: it.gianhap,
            ngay_sx: mfg,
            han_sd: it.hsd
        }))
    };

    try {
        const btn = document.getElementById('btnSubmitBatch');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang Tạo Phiếu Nhập...';
        }

        const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === 'success') {
            showToast(`✓ Nhập kho thành công ${data.count} sản phẩm! Mã PN: ${data.ma_pn}`);
            batchImportSelected.clear();
            await loadProductsSelect();
            await loadInventory();
            await loadImportHistory();
            await loadLowStock();
        } else {
            showToast(data.error || 'Lỗi nhập kho!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối máy chủ!', true);
    } finally {
        const btn = document.getElementById('btnSubmitBatch');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-truck-ramp-box"></i> Tạo Phiếu Nhập Kho (${batchImportSelected.size} SP)`;
        }
    }
}

// ===== 3. NHẬP 1 SẢN PHẨM ĐƠN LẺ =====
async function submitImport(e) {
    e.preventDefault();
    const payload = {
        ma_sp: document.getElementById('imp-product').value,
        ma_ncc: document.getElementById('imp-supplier').value,
        so_luong: parseFloat(document.getElementById('imp-qty').value),
        gia_nhap: parseFloat(document.getElementById('imp-price').value),
        ngay_sx: document.getElementById('imp-mfg').value || null,
        han_sd: document.getElementById('imp-exp').value,
        ma_nv: sessionStorage.getItem('manv') || 'kho1'
    };

    try {
        const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast(`✓ Nhập kho thành công! Mã PN: ${data.ma_pn}`);
            document.getElementById('importForm').reset();
            loadProductsSelect();
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

// ===== 4. LỊCH SỬ TIÊU HỦY =====
async function loadDestroyHistory() {
    try {
        const res = await fetch('/api/inventory/destroy_history');
        const data = await res.json();
        const tbody = document.getElementById('destroyHistoryBody');
        tbody.innerHTML = data.map(r => `
            <tr>
                <td><strong>#${r.MaTieuHuy}</strong></td>
                <td>${r.TenSP} (<code>${r.MaSP}</code>)</td>
                <td>#${r.MaLo}</td>
                <td><strong style="color: var(--red);">${r.SoLuongHuy}</strong></td>
                <td>${r.TenNV || r.MaNV}</td>
                <td>${r.NgayTieuHuy ? new Date(r.NgayTieuHuy).toLocaleString('vi-VN') : ''}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Load destroy history error:', e);
    }
}

// ===== 5. CẢNH BÁO TỒN KHO THẤP =====
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
    switchTab('tab-import', document.querySelectorAll('.sidebar-nav a')[1]);
    
    // Tìm sản phẩm trong allProductsList để chọn danh mục tương ứng
    const p = allProductsList.find(x => x.MaSP === maSP);
    if (p && p.MaDanhMuc) {
        switchImportMode('batch');
        const catSel = document.getElementById('batch-category');
        if (catSel) {
            catSel.value = p.MaDanhMuc;
            onBatchCategoryChange();
            // Lọc tìm kiếm ngay sản phẩm này
            const searchInp = document.getElementById('batch-search');
            if (searchInp) {
                searchInp.value = maSP;
                renderBatchTable();
            }
            // Tự động tick chọn sản phẩm này
            onBatchRowToggle(p.MaSP, p.TenSP, p.DonViTinh, parseFloat(p.TongTonKho || 0), true);
        }
    } else {
        switchImportMode('single');
        const prodSel = document.getElementById('imp-product');
        if (prodSel) prodSel.value = maSP;
    }
}

// ===== 6. LỊCH SỬ PHIẾU NHẬP =====
let importHistoryData = [];

async function loadImportHistory() {
    try {
        const res = await fetch('/api/import_invoices');
        importHistoryData = await res.json();
        renderImportHistory();
        renderRecentImports();
    } catch (e) {
        console.error('Load import history error:', e);
    }
}

function renderImportHistory() {
    const tbody = document.getElementById('importHistoryBody');
    if (!tbody) return;

    if (importHistoryData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Chưa có phiếu nhập kho nào!</td></tr>';
        return;
    }

    tbody.innerHTML = importHistoryData.map(p => `
        <tr>
            <td><strong>${p.MaPN}</strong></td>
            <td>${p.NgayNhap ? new Date(p.NgayNhap).toLocaleDateString('vi-VN') : ''}</td>
            <td>${p.MaNV}</td>
            <td>${p.TenNCC}</td>
            <td><strong>${fmt(p.TongTien)}</strong></td>
            <td>${p.MaNVSuaCuoi ? `<span style="color:var(--text-muted); font-size:0.8rem;">${p.MaNVSuaCuoi}<br>${new Date(p.NgaySuaCuoi).toLocaleDateString('vi-VN')}</span>` : '-'}</td>
            <td>
                <button class="btn-edit" onclick="viewPnDetails('${p.MaPN}')" style="padding: 4px 10px; font-size: 0.75rem;"><i class="fa-solid fa-eye"></i> Chi tiết</button>
            </td>
        </tr>
    `).join('');
}

function renderRecentImports() {
    const tbody = document.getElementById('recentImports');
    if (!tbody) return;
    const topLots = inventoryData.slice(0, 5);
    tbody.innerHTML = topLots.map(l => `
        <tr>
            <td><strong>#${l.MaLo}</strong></td>
            <td>${l.TenSP} (${l.MaSP})</td>
            <td>${fmtDate(l.HanSuDung)}</td>
            <td><strong>${l.SoLuongTon}</strong></td>
            <td>${fmt(l.GiaNhap || 0)}</td>
        </tr>
    `).join('');
}

// ===== CHI TIẾT PHIẾU NHẬP MODAL =====
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
                <td>${d.TenSP} (${d.MaSP})</td>
                <td>
                    <div style="display: flex; gap: 4px; align-items: center;">
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
        showToast('Lỗi tải chi tiết phiếu nhập!', true);
    }
}

function closePnModal(e) {
    if (e && e.target !== document.getElementById('pnModalOverlay')) return;
    document.getElementById('pnModalOverlay').classList.remove('show');
}

async function saveItemPn(mapn, masp) {
    const qty = document.getElementById(`pnqty-${mapn}-${masp}`).value;
    const manv = sessionStorage.getItem('manv') || 'kho1';
    try {
        const res = await fetch(`/api/import_invoices/${mapn}/items/${masp}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SoLuong: qty, MaNV: manv })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('✓ Cập nhật số lượng thành công!');
            loadImportHistory();
            viewPnDetails(mapn);
        } else {
            showToast(data.error || 'Lỗi cập nhật!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối!', true);
    }
}

async function savePnDetails() {
    const mapn = document.getElementById('pn-mapn').value;
    const ghichu = document.getElementById('pn-ghichu').value;
    const mancc = document.getElementById('pn-ncc').value;
    const manv = sessionStorage.getItem('manv') || 'kho1';

    try {
        const res = await fetch(`/api/import_invoices/${mapn}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ GhiChu: ghichu, MaNCC: mancc, MaNV: manv })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showToast('✓ Lưu thông tin phiếu nhập thành công!');
            loadImportHistory();
            closePnModal();
        } else {
            showToast(data.error || 'Lỗi cập nhật!', true);
        }
    } catch (e) {
        showToast('Lỗi kết nối!', true);
    }
}

// ===== UTILS =====
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => { toast.className = 'toast'; }, 3500);
}

function logout() {
    sessionStorage.clear();
    window.location.href = '/login';
}
