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
    logToConsole('log-non-repeatable', `[Quản Lý] Cập nhật Giá ${masp} thêm 1000 VNĐ...`, 'log-tx2');
    const res = await fetch(`/api/demo/non_repeatable_read/update?masp=${masp}`, { method: 'POST' }).then(r => r.json());
    logToConsole('log-non-repeatable', `[Quản Lý] ${res.message}`, 'log-success');
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
