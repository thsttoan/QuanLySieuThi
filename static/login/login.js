async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    const errBox = document.getElementById('loginError');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    errBox.classList.remove('show');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Đang xử lý...';

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.status === 'success') {
            // Save login info
            sessionStorage.setItem('manv', data.manv);
            sessionStorage.setItem('tennv', data.tennv);
            sessionStorage.setItem('role', data.role);

            // Redirect based on role
            if (data.role === 'ADMIN') {
                window.location.href = '/admin';
            } else if (data.role === 'KHO') {
                window.location.href = '/kho';
            } else if (data.role === 'DEMO') {
                window.location.href = '/demo';
            } else {
                window.location.href = '/thungan';
            }
        } else {
            errBox.textContent = data.message || 'Sai tên đăng nhập hoặc mật khẩu';
            errBox.classList.add('show');
        }
    } catch (err) {
        errBox.textContent = 'Không thể kết nối đến server!';
        errBox.classList.add('show');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i>&nbsp; Đăng Nhập';
    }
}