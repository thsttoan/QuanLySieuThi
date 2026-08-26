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
    const modeText = isFixed ? 'Khóa 2PL (UPDLOCK)' : 'Không Khóa';
    
    logToConsole('log-lost-update', `Bắt đầu test Mất Cập Nhật - Chế độ: ${modeText}`, 'log-success');
    logToConsole('log-lost-update', `Đang gọi Thu Ngân 1 và Thu Ngân 2 cùng lúc...`, 'log-warning');

    const req1 = fetch(`/api/demo/lost_update?mode=${mode}&tx=1`).then(r => r.json());
    const req2 = fetch(`/api/demo/lost_update?mode=${mode}&tx=2`).then(r => r.json());

    const [res1, res2] = await Promise.all([req1, req2]);

    logToConsole('log-lost-update', `[Thu Ngân 1] ${res1.message}`, 'log-tx1');
    logToConsole('log-lost-update', `[Thu Ngân 2] ${res2.message}`, 'log-tx2');
    
    // Kiểm tra kết quả cuối cùng
    const finalRes = await fetch(`/api/demo/inventory/567`).then(r => r.json());
    logToConsole('log-lost-update', `=> Tồn kho cuối cùng của Lô 567: ${finalRes.SoLuongTon}`, 
        isFixed ? 'log-success' : 'log-error');
}

// 2. Dirty Read
async function startDirtyTransaction() {
    clearConsole('log-dirty-read');
    logToConsole('log-dirty-read', `[Thu Ngân] Bắt đầu Giao dịch (Sửa tồn kho thành 9999)...`, 'log-tx1');
    logToConsole('log-dirty-read', `[Thu Ngân] Đang treo 5 giây... (Hãy bấm Đọc Rác ở Quản lý nhanh lên!)`, 'log-warning');
    
    const res = await fetch(`/api/demo/dirty_read/transaction`).then(r => r.json());
    logToConsole('log-dirty-read', `[Thu Ngân] ${res.message}`, 'log-error');
}

async function runDirtyRead(isFixed) {
    const mode = isFixed ? 'fixed' : 'error';
    logToConsole('log-dirty-read', `[Quản Lý] Bắt đầu đọc dữ liệu (Chế độ: ${isFixed ? 'READ COMMITTED' : 'READ UNCOMMITTED'})`, 'log-tx2');
    
    const res = await fetch(`/api/demo/dirty_read/read?mode=${mode}`).then(r => r.json());
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
    logToConsole('log-non-repeatable', `[Thu Ngân] Bắt đầu đọc Giá SP002 (Chế độ: ${isFixed ? 'REPEATABLE READ' : 'Mặc định'})...`, 'log-tx1');
    logToConsole('log-non-repeatable', `[Thu Ngân] Đọc lần 1 xong, đang treo 5 giây (Quản lý hãy đổi giá đi!)...`, 'log-warning');
    
    const res = await fetch(`/api/demo/non_repeatable_read/read?mode=${mode}`).then(r => r.json());
    
    logToConsole('log-non-repeatable', `[Thu Ngân] Đọc lần 1: ${res.price1} VNĐ`, 'log-tx1');
    logToConsole('log-non-repeatable', `[Thu Ngân] Đọc lần 2: ${res.price2} VNĐ`, res.price1 === res.price2 ? 'log-success' : 'log-error');
    if (res.price1 !== res.price2) {
        logToConsole('log-non-repeatable', `=> PHÁT HIỆN LỖI KHÔNG LẶP LẠI: Giá đã bị thay đổi giữa 2 lần đọc!`, 'log-error');
    }
}

async function updatePrice() {
    logToConsole('log-non-repeatable', `[Quản Lý] Cố gắng cập nhật Giá SP002 thêm 1000 VNĐ...`, 'log-tx2');
    const res = await fetch(`/api/demo/non_repeatable_read/update`, { method: 'POST' }).then(r => r.json());
    logToConsole('log-non-repeatable', `[Quản Lý] ${res.message}`, 'log-warning');
}

// 4. Phantom Read
async function startPhantomTransaction(isFixed) {
    clearConsole('log-phantom-read');
    const mode = isFixed ? 'fixed' : 'error';
    logToConsole('log-phantom-read', `[Quản Lý] Bắt đầu đếm tổng số Hóa Đơn (Chế độ: ${isFixed ? 'SERIALIZABLE' : 'Mặc định'})...`, 'log-tx1');
    logToConsole('log-phantom-read', `[Quản Lý] Đếm lần 1 xong, đang treo 5 giây (Thu Ngân hãy chèn HD đi!)...`, 'log-warning');
    
    const res = await fetch(`/api/demo/phantom_read/read?mode=${mode}`).then(r => r.json());
    
    logToConsole('log-phantom-read', `[Quản Lý] Tổng HD (Lần 1): ${res.count1}`, 'log-tx1');
    logToConsole('log-phantom-read', `[Quản Lý] Tổng HD (Lần 2): ${res.count2}`, res.count1 === res.count2 ? 'log-success' : 'log-error');
    if (res.count1 !== res.count2) {
        logToConsole('log-phantom-read', `=> PHÁT HIỆN LỖI BÓNG MA: Có Hóa Đơn "Ma" lọt vào!`, 'log-error');
    }
}

async function insertPhantomBill() {
    logToConsole('log-phantom-read', `[Thu Ngân] Cố gắng chèn 1 Hóa Đơn mới...`, 'log-tx2');
    const res = await fetch(`/api/demo/phantom_read/insert`, { method: 'POST' }).then(r => r.json());
    if (res.error) {
        logToConsole('log-phantom-read', `[Thu Ngân] Bị khóa/Lỗi: ${res.error}`, 'log-warning');
    } else {
        logToConsole('log-phantom-read', `[Thu Ngân] ${res.message}`, 'log-warning');
    }
}
