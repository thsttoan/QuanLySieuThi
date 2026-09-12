function switchDemoTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');

    if (tabId === 'tab-concurrency') {
        const b = document.getElementById('btn-tab-concurrency');
        if (b) b.classList.add('active');
    } else if (tabId === 'tab-deadlock') {
        const b = document.getElementById('btn-tab-deadlock');
        if (b) b.classList.add('active');
    }
}

async function loadDemoData() {
    const products = await fetch('/api/demo/products').then(r => r.json());
    const selects = [
        document.getElementById('select-masp-1'),
        document.getElementById('select-masp-2'),
        document.getElementById('select-masp-3'),
        document.getElementById('select-masp-4')
    ];

    products.forEach(p => {
        const optInventory = `<option value="${p.MaSP}">${p.MaSP} - ${p.TenSP} (Tồn kho: ${p.SoLuongTon})</option>`;
        const optPrice = `<option value="${p.MaSP}">${p.MaSP} - ${p.TenSP} (Giá: ${p.GiaBan}đ)</option>`;

        if (selects[0]) selects[0].innerHTML += optInventory;
        if (selects[1]) selects[1].innerHTML += optInventory;
        if (selects[2]) selects[2].innerHTML += optPrice;
        if (selects[3]) selects[3].innerHTML += optInventory;
    });

    updateDynamicText1();
    updateDynamicText2();
    updateDynamicText3();
    updateDynamicText4();

    if (selects[0]) selects[0].addEventListener('change', updateDynamicText1);
    if (selects[1]) selects[1].addEventListener('change', updateDynamicText2);
    if (selects[2]) selects[2].addEventListener('change', updateDynamicText3);
    if (selects[3]) selects[3].addEventListener('change', updateDynamicText4);
}

function updateDynamicText1() {
    const masp = document.getElementById('select-masp-1').value;
    document.querySelectorAll('.dynamic-masp-1').forEach(el => el.innerText = masp);
}
function updateDynamicText2() {
    const masp = document.getElementById('select-masp-2').value;
    document.querySelectorAll('.dynamic-masp-2').forEach(el => el.innerText = masp);
}
function updateDynamicText3() {
    const masp = document.getElementById('select-masp-3').value;
    document.querySelectorAll('.dynamic-masp-3').forEach(el => el.innerText = masp);
}
function updateDynamicText4() {
    const el = document.getElementById('select-masp-4');
    if (el) document.querySelectorAll('.dynamic-masp-4').forEach(e => e.innerText = el.value);
}

document.addEventListener('DOMContentLoaded', loadDemoData);

function logToConsole(consoleId, message, type = 'log-success') {
    const consoleBody = document.querySelector(`#${consoleId} .console-body`);
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    consoleBody.appendChild(line);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

function clearConsole(consoleId) {
    document.querySelector(`#${consoleId} .console-body`).innerHTML = '';
}

// 1. Lost Update
async function runLostUpdate(isFixed) {
    clearConsole('log-lost-update');
    const mode = isFixed ? 'fixed' : 'error';
    const masp = document.getElementById('select-masp-1').value;

    logToConsole('log-lost-update', `Bắt đầu test Mất Cập Nhật - Chế độ: ${isFixed ? 'Khóa 2PL' : 'Không Khóa'} (SP: ${masp})`, isFixed ? 'log-success' : 'log-error');
    logToConsole('log-lost-update', 'Đang gọi Thu Ngân 1 và Thu Ngân 2 cùng lúc...', 'log-success');

    const [res1, res2] = await Promise.all([
        fetch(`/api/demo/lost_update?mode=${mode}&tx=1&masp=${masp}`).then(r => r.json()),
        fetch(`/api/demo/lost_update?mode=${mode}&tx=2&masp=${masp}`).then(r => r.json())
    ]);

    logToConsole('log-lost-update', `[Thu Ngân 1] ${res1.error || res1.message}`, 'log-tx1');
    logToConsole('log-lost-update', `[Thu Ngân 2] ${res2.error || res2.message}`, 'log-tx2');

    // Kiểm tra kết quả cuối cùng
    const finalRes = await fetch(`/api/demo/inventory/${masp}`).then(r => r.json());
    logToConsole('log-lost-update', `=> Tổng Tồn kho cuối cùng của SP ${masp}: ${finalRes.SoLuongTon}`,
        isFixed ? 'log-success' : 'log-error');
}

// 2. Dirty Read
async function startDirtyTransaction() {
    clearConsole('log-dirty-read');
    const masp = document.getElementById('select-masp-2').value;
    logToConsole('log-dirty-read', `[Nhân Viên Kho] Bắt đầu Giao dịch (Sửa tồn kho 1 lô của SP ${masp} thành 9999)...`, 'log-tx1');
    logToConsole('log-dirty-read', `[Nhân Viên Kho] Đang treo 5 giây... (Bấm Quản lý đọc...)`, 'log-success');

    const res = await fetch(`/api/demo/dirty_read/transaction?masp=${masp}`).then(r => r.json());
    logToConsole('log-dirty-read', `[Nhân Viên Kho] ${res.message || res.error}`, 'log-error');
}

async function runDirtyRead(isFixed) {
    const mode = isFixed ? 'fixed' : 'error';
    const masp = document.getElementById('select-masp-2').value;
    logToConsole('log-dirty-read', `[Quản Lý] Bắt đầu đếm tổng tồn kho (Chế độ: ${isFixed ? 'READ COMMITTED' : 'READ UNCOMMITTED'})`, isFixed ? 'log-success' : 'log-error');

    const res = await fetch(`/api/demo/dirty_read/read?mode=${mode}&masp=${masp}`).then(r => r.json());
    if (res.error) {
        logToConsole('log-dirty-read', `[Quản Lý] Lỗi hoặc bị Block: ${res.error}`, 'log-error');
    } else {
        logToConsole('log-dirty-read', `[Quản Lý] Đã đọc được Tồn Kho = ${res.SoLuongTon}`, res.SoLuongTon == 9999 ? 'log-error' : 'log-success');
    }
}

// 3. Non-repeatable Read
async function startNonRepeatableTransaction(isFixed) {
    clearConsole('log-non-repeatable');
    const mode = isFixed ? 'fixed' : 'error';
    const masp = document.getElementById('select-masp-3').value;
    logToConsole('log-non-repeatable', `[Thu Ngân] Bắt đầu đọc Giá ${masp} (Chế độ: ${isFixed ? 'REPEATABLE READ' : 'Mặc định'})...`, 'log-tx1');
    logToConsole('log-non-repeatable', `[Thu Ngân] Đọc lần 1 xong, đang treo 5 giây (Bấm Quản lý đổi giá)`, 'log-warning');

    const res = await fetch(`/api/demo/non_repeatable_read/read?mode=${mode}&masp=${masp}`).then(r => r.json());

    logToConsole('log-non-repeatable', `[Thu Ngân] Đọc lần 1: ${res.price1} VNĐ`, 'log-tx1');
    logToConsole('log-non-repeatable', `[Thu Ngân] Đọc lần 2: ${res.price2} VNĐ`, res.price1 === res.price2 ? 'log-success' : 'log-error');
    if (res.price1 !== res.price2) {
        logToConsole('log-non-repeatable', `=> PHÁT HIỆN LỖI KHÔNG LẶP LẠI: Giá đã bị thay đổi giữa 2 lần đọc!`, 'log-error');
    }
}

async function updatePrice() {
    const masp = document.getElementById('select-masp-3').value;
    logToConsole('log-non-repeatable', `[Quản Lý (Demo)] Cập nhật Giá ${masp} thêm 1000 VNĐ...`, 'log-tx2');
    const res = await fetch(`/api/demo/non_repeatable_read/update?masp=${masp}&manv=demo`, { method: 'POST' }).then(r => r.json());
    logToConsole('log-non-repeatable', `[Quản Lý (Demo)] ${res.message}`, 'log-success');
}

// 4. Phantom Read
async function startPhantomTransaction(isFixed) {
    clearConsole('log-phantom-read');
    const mode = isFixed ? 'fixed' : 'error';
    logToConsole('log-phantom-read', `[Quản Lý] Bắt đầu đếm tổng số Hóa Đơn (Chế độ: ${isFixed ? 'SERIALIZABLE' : 'Mặc định'})...`, 'log-tx1');
    logToConsole('log-phantom-read', `[Quản Lý] Đếm lần 1 xong, đang treo 5 giây (Bấm Thu Ngân chèn Hóa Đơn mới)`, 'log-warning');

    const res = await fetch(`/api/demo/phantom_read/read?mode=${mode}`).then(r => r.json());

    logToConsole('log-phantom-read', `[Quản Lý] Tổng HD (Lần 1): ${res.count1}`, 'log-tx1');
    logToConsole('log-phantom-read', `[Quản Lý] Tổng HD (Lần 2): ${res.count2}`, res.count1 === res.count2 ? 'log-success' : 'log-error');
    if (res.count1 !== res.count2) {
        logToConsole('log-phantom-read', `=> PHÁT HIỆN LỖI BÓNG MA: Có Hóa Đơn "Ma" lọt vào!`, 'log-error');
    }
}

async function insertPhantomBill() {
    const masp = document.getElementById('select-masp-4').value;
    logToConsole('log-phantom-read', `[Thu Ngân] Đang thanh toán SP ${masp} để tạo Hóa Đơn mới...`, 'log-tx2');
    const res = await fetch(`/api/demo/phantom_read/insert?masp=${masp}`, { method: 'POST' }).then(r => r.json());
    if (res.error) {
        logToConsole('log-phantom-read', `[Thu Ngân] Bị khóa/Lỗi: ${res.error}`, 'log-warning');
    } else {
        logToConsole('log-phantom-read', `[Thu Ngân] ${res.message}`, 'log-warning');
    }
}

// 5. Deadlock (Chương 4: Xử lý Deadlock)
async function runDeadlock(mode) {
    clearConsole('log-deadlock');
    const malo1 = 11;
    const malo2 = 12;

    let modeTitle = 'Chế độ 1: GÂY LỖI DEADLOCK (Hai nhân viên kho khóa ngược thứ tự)';
    let badgeType = 'log-error';
    if (mode === 'fixed') {
        modeTitle = 'Chế độ 2: FIX BẰNG ORDERING PROTOCOL (Sắp xếp thứ tự các đơn vị dữ liệu)';
        badgeType = 'log-success';
    } else if (mode === 'timeout') {
        modeTitle = 'Chế độ 3: FIX BẰNG TIMEOUT (SET LOCK_TIMEOUT 3s)';
        badgeType = 'log-warning';
    }

    logToConsole('log-deadlock', `>>> BẮT ĐẦU: ${modeTitle}`, badgeType);
    logToConsole('log-deadlock', `[Kịch bản] Hai nhân viên kho cùng cập nhật tồn kho: Nhân viên kho 1 (Lô ${malo1} -> Lô ${malo2}) và Nhân viên kho 2 (Lô ${malo2} -> Lô ${malo1}) cùng thực hiện song song...`, 'log-tx1');

    const [res1, res2] = await Promise.all([
        fetch(`/api/demo/deadlock?mode=${mode}&tx=1&malo1=${malo1}&malo2=${malo2}`).then(r => r.json()),
        fetch(`/api/demo/deadlock?mode=${mode}&tx=2&malo1=${malo1}&malo2=${malo2}`).then(r => r.json())
    ]);

    logToConsole('log-deadlock', res1.message || res1.error, res1.status === 'SUCCESS' ? 'log-success' : 'log-error');
    logToConsole('log-deadlock', res2.message || res2.error, res2.status === 'SUCCESS' ? 'log-success' : 'log-error');

    if (mode === 'error') {
        logToConsole('log-deadlock', '=> KẾT LUẬN CHƯƠNG 4: SQL Server tự động phát hiện Chu trình đồ thị chờ T1 <-> T2 và chọn một giao tác làm DEADLOCK VICTIM (Lỗi 1205) để Rollback giải phóng hệ thống!', 'log-error');
    } else if (mode === 'fixed') {
        logToConsole('log-deadlock', '=> KẾT LUẬN CHƯƠNG 4: Áp dụng Giao thức Sắp xếp thứ tự (Ordering Protocol), cả 2 nhân viên kho cùng cập nhật Lô 11 trước rồi Lô 12 sau => Đồ thị chờ không có chu trình => 100% TRIỆT TIÊU DEADLOCK!', 'log-success');
    } else if (mode === 'timeout') {
        logToConsole('log-deadlock', '=> KẾT LUẬN CHƯƠNG 4: Áp dụng Timeout (3 giây), giao tác chờ quá hạn tự động hủy (Lỗi 1222) và Rollback, giúp giải phóng tài nguyên!', 'log-warning');
    }
}
