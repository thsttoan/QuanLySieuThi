import os
import datetime
import pyodbc
from flask import Flask, jsonify, request, send_from_directory, redirect
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Connection parameters for SQL Server NONAME\SQLEXPRESS
# Using Windows Authentication and trusting the server certificate
CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=NONAME\\SQLEXPRESS;"
    "DATABASE=QL_BachHoaXanh;"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)

def get_db_connection():
    conn = pyodbc.connect(CONN_STR)
    conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
    conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-16le')
    # Removed setencoding to allow pyodbc default (utf-16le) for NVARCHAR
    return conn

# Serve Frontend files
@app.route('/')
def index():
    return redirect('/login')

@app.route('/login')
def login_page():
    return send_from_directory('static/login', 'login.html')

@app.route('/thungan')
def thungan_page():
    return send_from_directory('static/thungan', 'thungan.html')

@app.route('/kho')
def kho_page():
    return send_from_directory('static/kho', 'kho.html')

@app.route('/admin')
def admin_page():
    return send_from_directory('static/admin', 'admin.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# 1. API: Lấy danh sách sản phẩm (từ View v_SanPhamSieuThi)
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaSP, TenSP, TenDanhMuc, DonViTinh, GiaBan, GiaKhuyenMai, TongTonKho, LaHangTuoiSong FROM v_SanPhamSieuThi")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. API: Lấy danh sách lô hàng & cảnh báo hạn dùng (từ View v_CanhBaoHanSD)
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaLo, MaSP, TenSP, NgaySanXuat, HanSuDung, SoLuongTon, GiaNhap, SoNgayConLai, TrangThai FROM v_CanhBaoHanSD ORDER BY HanSuDung ASC")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2.1 API: Cảnh báo tồn kho thấp (từ View v_CanhBaoTonKho)
@app.route('/api/inventory/low_stock', methods=['GET'])
def get_low_stock():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaSP, TenSP, TongTonKho, TrangThai FROM v_CanhBaoTonKho ORDER BY TongTonKho ASC")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. API: Tìm kiếm khách hàng theo số điện thoại
@app.route('/api/customers', methods=['GET'])
def get_customers():
    sdt = request.args.get('sdt', '')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        import datetime
        if sdt:
            cursor.execute("SELECT MaKH, SoDienThoai, TenKH, DiemTichLuy, NgayDangKy FROM KHACH_HANG WHERE SoDienThoai = ?", (sdt,))
        else:
            cursor.execute("SELECT MaKH, SoDienThoai, TenKH, DiemTichLuy, NgayDangKy FROM KHACH_HANG")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            c = dict(zip(columns, row))
            if 'NgayDangKy' in c and isinstance(c['NgayDangKy'], (datetime.date, datetime.datetime)):
                c['NgayDangKy'] = c['NgayDangKy'].strftime("%Y-%m-%d %H:%M:%S")
            results.append(c)
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. API: Lập hóa đơn bán hàng (Giao tác checkout phức tạp)
@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    if not data or 'cart' not in data or not data['cart']:
        return jsonify({"error": "Giỏ hàng trống!"}), 400
    
    ma_nv = data.get('ma_nv', 'NV001')
    sdt_kh = data.get('sdt_kh', '')
    diem_su_dung = int(data.get('diem_su_dung', 0))
    pt_thanh_toan = data.get('pt_thanh_toan', 'Tiền mặt')
    cart = data['cart'] # list of {ma_sp, so_luong}
    
    conn = get_db_connection()
    conn.autocommit = False # Bắt đầu giao tác thủ công ở Backend
    cursor = conn.cursor()
    
    try:
        # Lấy thông tin khách hàng nếu có SĐT
        ma_kh = None
        diem_hien_co = 0
        if sdt_kh:
            cursor.execute("SELECT MaKH, DiemTichLuy FROM KHACH_HANG WHERE SoDienThoai = ?", (sdt_kh,))
            row = cursor.fetchone()
            if row:
                ma_kh = row[0]
                diem_hien_co = row[1]
            else:
                conn.close()
                return jsonify({"error": f"Số điện thoại khách hàng {sdt_kh} chưa đăng ký hội viên!"}), 400
        
        # Kiểm tra tính hợp lệ của điểm sử dụng
        if diem_su_dung > 0:
            if not ma_kh:
                conn.close()
                return jsonify({"error": "Không thể dùng điểm tích lũy cho khách vãng lai!"}), 400
            if diem_su_dung > diem_hien_co:
                conn.close()
                return jsonify({"error": f"Khách hàng chỉ có {diem_hien_co} điểm, không thể sử dụng {diem_su_dung} điểm!"}), 400
        
        # 1. Tính toán giá sản phẩm, tổng tiền hàng và giảm giá khuyến mãi trên Backend từ cơ sở dữ liệu
        tong_tien_hang = 0.0
        giam_gia_km = 0.0
        
        # Đọc thông tin chi tiết từng sản phẩm trong giỏ hàng
        cart_items_details = []
        for item in cart:
            ma_sp = item['ma_sp']
            so_luong = float(item['so_luong'])
            
            cursor.execute("SELECT GiaBan, GiaKhuyenMai FROM v_SanPhamSieuThi WHERE MaSP = ?", (ma_sp,))
            sp_row = cursor.fetchone()
            if not sp_row:
                raise Exception(f"Sản phẩm {ma_sp} không tồn tại!")
            
            gia_ban = float(sp_row[0])
            gia_km = float(sp_row[1])
            
            tong_tien_hang += so_luong * gia_ban
            giam_gia_km += so_luong * (gia_ban - gia_km)
            
            cart_items_details.append({
                'ma_sp': ma_sp,
                'so_luong': so_luong,
                'gia_ban': gia_ban,
                'gia_km': gia_km
            })
            
        # Áp dụng mã Voucher nếu có
        ma_voucher = data.get('ma_voucher', '').strip()
        giam_gia_voucher = 0.0
        tang_san_pham = []
        if ma_voucher:
            cursor.execute("SELECT LoaiVoucher, GiaTri, MaSPTang, SoLuongTang FROM VOUCHER WHERE MaVoucher = ? AND GETDATE() BETWEEN NgayBatDau AND NgayKetThuc", (ma_voucher,))
            v_row = cursor.fetchone()
            if v_row:
                loai_v = v_row[0]
                if loai_v == 'GiamGia':
                    phan_tram = float(v_row[1]) if v_row[1] else 0.0
                    giam_gia_voucher = (tong_tien_hang - giam_gia_km) * (phan_tram / 100.0)
                elif loai_v == 'TangSanPham':
                    ma_sp_tang = v_row[2]
                    sl_tang = int(v_row[3]) if v_row[3] else 1
                    tang_san_pham.append({'ma_sp': ma_sp_tang, 'so_luong': sl_tang, 'gia_ban': 0.0, 'gia_km': 0.0})
            
        thanh_tien = tong_tien_hang - giam_gia_km - giam_gia_voucher - (diem_su_dung * 100)
        if thanh_tien < 0:
            thanh_tien = 0.0
            
        # 2. Tạo Mã Hóa Đơn tự động (HD + YYYYMMDDHHMMSS)
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        cursor.execute("SELECT COUNT(*) FROM HOA_DON WHERE MaHD LIKE ?", (f"HD{timestamp}%",))
        cnt = cursor.fetchone()[0]
        ma_hd = f"HD{timestamp}{cnt+1:03d}"
        
        # 3. Ghi vào bảng HOA_DON
        cursor.execute(
            "INSERT INTO HOA_DON (MaHD, NgayLap, MaNV, MaKH, TongTienHang, GiamGiaKM, MaVoucher, GiamGiaVoucher, DiemSuDung, ThanhTien, PhuongThucTT) "
            "VALUES (?, GETDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (ma_hd, ma_nv, ma_kh, tong_tien_hang, giam_gia_km, ma_voucher if ma_voucher else None, giam_gia_voucher, diem_su_dung, thanh_tien, pt_thanh_toan)
        )
        
        # Add free products to cart_items_details for FIFO deduction
        for p_tang in tang_san_pham:
            cart_items_details.append(p_tang)
        
        # 4. Trừ kho theo lô FIFO cho từng sản phẩm bằng cách gọi Stored Procedure
        sql_log = []
        sql_log.append(f"INSERT INTO HOA_DON (MaHD='{ma_hd}', ThanhTien={thanh_tien})")
        for item in cart_items_details:
            # Stored Procedure sp_BanHangFIFO sẽ:
            # - Tự động tìm các lô hàng chưa hết hạn
            # - Trừ kho theo thứ tự hạn sử dụng sớm nhất (FIFO)
            # - Ghi dữ liệu vào bảng CHI_TIET_HOA_DON
            # - Báo lỗi (RAISERROR) nếu không đủ hàng
            # Calculate line-item specific discount and total
            # 1. Product specific discount
            item_prod_discount = item['so_luong'] * (item['gia_ban'] - item['gia_km'])
            
            # 2. Distributed invoice discount (voucher + points)
            item_gia_sau_km = item['so_luong'] * item['gia_km']
            total_gia_sau_km = tong_tien_hang - giam_gia_km
            
            item_invoice_discount = 0.0
            total_invoice_discount = giam_gia_voucher + (diem_su_dung * 100)
            if total_gia_sau_km > 0:
                item_invoice_discount = (item_gia_sau_km / total_gia_sau_km) * total_invoice_discount
                
            item_total_discount = item_prod_discount + item_invoice_discount
            item_thanh_tien = (item['so_luong'] * item['gia_ban']) - item_total_discount
            if item_thanh_tien < 0: item_thanh_tien = 0.0

            cursor.execute(
                "EXEC sp_BanHangFIFO @MaHD=?, @MaSP=?, @SoLuongYeuCau=?, @DonGiaGoc=?, @SoTienGiam=?, @ThanhTien=?",
                (ma_hd, item['ma_sp'], item['so_luong'], item['gia_ban'], item_total_discount, item_thanh_tien)
            )
            sql_log.append(f"EXEC sp_BanHangFIFO @MaHD='{ma_hd}', @MaSP='{item['ma_sp']}', @SoLuong={item['so_luong']}, @DonGiaGoc={item['gia_ban']}, @SoTienGiam={item_total_discount}, @ThanhTien={item_thanh_tien}")
            
        # Nếu mọi thứ chạy tốt, COMMIT giao tác
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Thanh toán thành công (COMMIT)!",
            "ma_hd": ma_hd,
            "thanh_tien": thanh_tien,
            "diem_su_dung": diem_su_dung,
            "diem_tich_luy_moi": int(thanh_tien // 1000), # Tương ứng fn_TinhDiemTichLuy (1 điểm = 1000 VNĐ)
            "sql_log": sql_log
        })
        
    except Exception as e:
        # Nếu xảy ra bất kỳ lỗi gì, ROLLBACK toàn bộ giao tác để đảm bảo tính nhất quán kho hàng và điểm tích lũy
        conn.rollback()
        return jsonify({
            "status": "rollback",
            "error": str(e),
            "message": "Giao tác bị lỗi và đã ROLLBACK thành công! Không có thay đổi nào được ghi lại."
        }), 400
    finally:
        conn.close()

# 5. API: Nhập kho thêm lô hàng mới
@app.route('/api/import', methods=['POST'])
def import_stock():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dữ liệu nhập trống!"}), 400
        
    ma_nv = data.get('ma_nv', 'NV002')
    ma_ncc = data.get('ma_ncc', 'NCC01')
    ma_sp = data.get('ma_sp', '')
    so_luong = float(data.get('so_luong', 0))
    gia_nhap = float(data.get('gia_nhap', 0))
    ngay_sx = data.get('ngay_sx', None)
    han_sd = data.get('han_sd', '')
    
    if not ma_sp or so_luong <= 0 or gia_nhap <= 0 or not han_sd:
        return jsonify({"error": "Thông tin nhập hàng không hợp lệ!"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Tạo mã phiếu nhập tự động
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        ma_pn = f"PN{timestamp}"
        
        # Thực hiện gọi Stored Procedure nhập kho (đã tích hợp BEGIN/COMMIT TRANSACTION trong Proc)
        cursor.execute(
            "EXEC sp_NhapKho @MaPN=?, @MaNV=?, @MaNCC=?, @MaSP=?, @SoLuong=?, @GiaNhap=?, @NgaySanXuat=?, @HanSuDung=?",
            (ma_pn, ma_nv, ma_ncc, ma_sp, so_luong, gia_nhap, ngay_sx, han_sd)
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Nhập lô hàng mới thành công (Mã Phiếu Nhập: {ma_pn})!"})
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

# 5.1 API: Chỉnh sửa số lượng tồn kho của một lô
@app.route('/api/inventory/<malo>', methods=['PUT'])
def update_inventory(malo):
    data = request.get_json()
    if 'SoLuongTon' not in data:
        return jsonify({"error": "Thiếu số lượng!"}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE LO_HANG SET SoLuongTon = ? WHERE MaLo = ?", (data['SoLuongTon'], malo))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5.2 API: Tiêu hủy hàng hết hạn
@app.route('/api/inventory/destroy', methods=['POST'])
def destroy_inventory():
    data = request.json
    ma_lo = data.get('ma_lo')
    ma_sp = data.get('ma_sp')
    so_luong = float(data.get('so_luong', 0))
    ma_nv = data.get('ma_nv')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check current SoLuongTon
        cursor.execute("SELECT SoLuongTon FROM LO_HANG WHERE MaLo = ?", (ma_lo,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"status": "error", "error": "Lô hàng không tồn tại."}), 404
        if row.SoLuongTon < so_luong:
            return jsonify({"status": "error", "error": "Số lượng hủy lớn hơn tồn kho."}), 400

        # Update LO_HANG
        cursor.execute("UPDATE LO_HANG SET SoLuongTon = SoLuongTon - ? WHERE MaLo = ?", (so_luong, ma_lo))
        
        # Insert into HANG_TIEU_HUY
        cursor.execute("""
            INSERT INTO HANG_TIEU_HUY (MaSP, MaLo, SoLuongHuy, NgayTieuHuy, MaNV)
            VALUES (?, ?, ?, GETDATE(), ?)
        """, (ma_sp, ma_lo, so_luong, ma_nv))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

# 5.3 API: Lấy lịch sử tiêu hủy hàng
@app.route('/api/inventory/destroy_history', methods=['GET'])
def get_destroy_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT h.MaTieuHuy, h.MaSP, s.TenSP, h.MaLo, h.SoLuongHuy, h.NgayTieuHuy, h.MaNV, nv.TenNV
            FROM HANG_TIEU_HUY h
            JOIN SAN_PHAM s ON h.MaSP = s.MaSP
            JOIN NHAN_VIEN nv ON h.MaNV = nv.MaNV
            ORDER BY h.NgayTieuHuy DESC
        """)
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            if isinstance(item['NgayTieuHuy'], (datetime.datetime, datetime.date)):
                item['NgayTieuHuy'] = item['NgayTieuHuy'].strftime("%Y-%m-%dT%H:%M:%S")
            results.append(item)
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6. API: Thống kê doanh thu theo ngày (từ View v_DoanhThuTheoNgay)
@app.route('/api/revenue', methods=['GET'])
def get_revenue():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Ngay, SoHoaDon, TongTienHang, TongGiamGiaKM, DiemSuDung, DoanhThuThucTe FROM v_DoanhThuTheoNgay ORDER BY Ngay DESC")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            # Format date to string
            if isinstance(item['Ngay'], (datetime.date, datetime.datetime)):
                item['Ngay'] = item['Ngay'].strftime("%Y-%m-%d")
            results.append(item)
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/revenue/category', methods=['GET'])
def get_revenue_category():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.TenDanhMuc, SUM(ct.ThanhTien) AS DoanhThu
            FROM CHI_TIET_HOA_DON ct
            JOIN SAN_PHAM s ON ct.MaSP = s.MaSP
            JOIN DANH_MUC c ON s.MaDanhMuc = c.MaDanhMuc
            GROUP BY c.TenDanhMuc
            ORDER BY DoanhThu DESC
        """)
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 7. API: Lịch sử hóa đơn gần đây
@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT TOP 50 hd.MaHD, hd.NgayLap, hd.MaNV, kh.TenKH, hd.TongTienHang, hd.GiamGiaKM, hd.ThanhTien, hd.PhuongThucTT, "
            "hd.MaNVSuaCuoi, hd.NgaySuaCuoi, hd.GhiChu "
            "FROM HOA_DON hd "
            "LEFT JOIN KHACH_HANG kh ON hd.MaKH = kh.MaKH "
            "ORDER BY hd.NgayLap DESC"
        )
        columns = [column[0] for column in cursor.description]
        invoices = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(invoices)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/invoices/<mahd>', methods=['GET', 'PUT'])
def invoice_detail(mahd):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'GET':
            cursor.execute(
                "SELECT cthd.MaSP, sp.TenSP, cthd.MaLo, cthd.SoLuong, cthd.DonGia, cthd.ThanhTien "
                "FROM CHI_TIET_HOA_DON cthd "
                "INNER JOIN SAN_PHAM sp ON cthd.MaSP = sp.MaSP "
                "WHERE cthd.MaHD = ?", (mahd,)
            )
            columns = [col[0] for col in cursor.description]
            details = [dict(zip(columns, row)) for row in cursor.fetchall()]
            conn.close()
            return jsonify(details)
            
        elif request.method == 'PUT':
            data = request.get_json()
            cursor.execute(
                "UPDATE HOA_DON SET MaNVSuaCuoi = ?, NgaySuaCuoi = GETDATE(), GhiChu = ?, PhuongThucTT = ? WHERE MaHD = ?",
                (data.get('MaNVSuaCuoi'), data.get('GhiChu'), data.get('PhuongThucTT'), mahd)
            )
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 7.1 API: Lịch sử Nhập Kho
@app.route('/api/import_invoices', methods=['GET'])
def get_import_invoices():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT p.MaPN, p.NgayNhap, p.MaNV, p.MaNCC, n.TenNCC, p.TongTien, "
            "p.MaNVSuaCuoi, p.NgaySuaCuoi, p.GhiChu "
            "FROM PHIEU_NHAP p "
            "LEFT JOIN NHA_CUNG_CAP n ON p.MaNCC = n.MaNCC "
            "ORDER BY p.NgayNhap DESC"
        )
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/import_invoices/<mapn>', methods=['GET', 'PUT'])
def import_invoice_detail(mapn):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'GET':
            cursor.execute(
                "SELECT c.MaSP, s.TenSP, c.SoLuong, c.GiaNhap, c.NgaySanXuat, c.HanSuDung "
                "FROM CHI_TIET_PHIEU_NHAP c "
                "JOIN SAN_PHAM s ON c.MaSP = s.MaSP "
                "WHERE c.MaPN = ?", (mapn,)
            )
            columns = [col[0] for col in cursor.description]
            details = [dict(zip(columns, row)) for row in cursor.fetchall()]
            conn.close()
            return jsonify(details)
            
        elif request.method == 'PUT':
            data = request.get_json()
            cursor.execute(
                "UPDATE PHIEU_NHAP SET MaNVSuaCuoi = ?, NgaySuaCuoi = GETDATE(), GhiChu = ?, MaNCC = ? WHERE MaPN = ?",
                (data.get('MaNVSuaCuoi'), data.get('GhiChu'), data.get('MaNCC'), mapn)
            )
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/import_invoices/<mapn>/items/<masp>', methods=['PUT'])
def edit_import_item(mapn, masp):
    data = request.get_json()
    new_qty = float(data.get('SoLuong', 0))
    ma_nv = data.get('MaNV', 'NV001')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_SuaChiTietPhieuNhap @MaPN=?, @MaSP=?, @SoLuongMoi=?, @MaNV=?", (mapn, masp, new_qty, ma_nv))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/invoices/<mahd>/items/<masp>/<malo>', methods=['PUT'])
def edit_invoice_item(mahd, masp, malo):
    data = request.get_json()
    new_qty = float(data.get('SoLuong', 0))
    ma_nv = data.get('MaNV', 'NV001')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC sp_SuaChiTietHoaDon @MaHD=?, @MaSP=?, @MaLo=?, @SoLuongMoi=?, @MaNV=?", (mahd, masp, malo, new_qty, ma_nv))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 8. API: Đăng nhập (Auth)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaNV, TenNV, ChucVu, Role, MatKhau FROM NHAN_VIEN WHERE MaNV = ?", (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row and check_password_hash(row[4], password):
            role_id = row[3]
            if role_id == 0:
                role = 'ADMIN'
            elif role_id == 2:
                role = 'KHO'
            else:
                role = 'THUNGAN'
            
            return jsonify({
                "status": "success",
                "manv": row[0],
                "tennv": row[1],
                "role": role
            })
        else:
            return jsonify({"status": "error", "message": "Sai tên đăng nhập hoặc mật khẩu"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# 9. API: Quản lý Sản phẩm (Admin)
@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO SAN_PHAM (MaSP, TenSP, MaDanhMuc, DonViTinh, GiaBan, LaHangTuoiSong) VALUES (?, ?, ?, ?, ?, ?)",
            (data['MaSP'], data['TenSP'], data['MaDanhMuc'], data['DonViTinh'], data['GiaBan'], data['LaHangTuoiSong'])
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<ma_sp>', methods=['PUT'])
def update_product(ma_sp):
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE SAN_PHAM SET TenSP = ?, MaDanhMuc = ?, DonViTinh = ?, GiaBan = ?, LaHangTuoiSong = ? WHERE MaSP = ?",
            (data['TenSP'], data['MaDanhMuc'], data['DonViTinh'], data['GiaBan'], data['LaHangTuoiSong'], ma_sp)
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 9. API: Quản lý Nhân viên (Admin)
@app.route('/api/employees', methods=['GET', 'POST'])
def manage_employees():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT MaNV, TenNV, ChucVu, SoDienThoai, Role FROM NHAN_VIEN")
            columns = [col[0] for col in cursor.description]
            emps = [dict(zip(columns, row)) for row in cursor.fetchall()]
            conn.close()
            return jsonify(emps)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO NHAN_VIEN (MaNV, TenNV, ChucVu, SoDienThoai, MatKhau, Role) VALUES (?, ?, ?, ?, ?, ?)",
                (data['MaNV'], data['TenNV'], data['ChucVu'], data['SoDienThoai'], generate_password_hash(data.get('MatKhau', '123456')), data.get('Role', 1))
            )
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/employees/<manv>', methods=['PUT', 'DELETE'])
def update_employee(manv):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'DELETE':
            cursor.execute("DELETE FROM NHAN_VIEN WHERE MaNV = ?", (manv,))
        elif request.method == 'PUT':
            data = request.get_json()
            if data.get('MatKhau'):
                cursor.execute("""
                    UPDATE NHAN_VIEN 
                    SET TenNV = ?, ChucVu = ?, SoDienThoai = ?, Role = ?, MatKhau = ?
                    WHERE MaNV = ?
                """, (data['TenNV'], data['ChucVu'], data['SoDienThoai'], data['Role'], generate_password_hash(data['MatKhau']), manv))
            else:
                cursor.execute("""
                    UPDATE NHAN_VIEN 
                    SET TenNV = ?, ChucVu = ?, SoDienThoai = ?, Role = ?
                    WHERE MaNV = ?
                """, (data['TenNV'], data['ChucVu'], data['SoDienThoai'], data['Role'], manv))
                
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 9.1 API: Quản lý Khách Hàng (Admin)
@app.route('/api/customers', methods=['GET', 'POST'])
def manage_customers():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT MaKH, SoDienThoai, TenKH, DiemTichLuy, NgayDangKy FROM KHACH_HANG")
            columns = [col[0] for col in cursor.description]
            customers = []
            for row in cursor.fetchall():
                c = dict(zip(columns, row))
                if isinstance(c['NgayDangKy'], (datetime.date, datetime.datetime)):
                    c['NgayDangKy'] = c['NgayDangKy'].strftime("%Y-%m-%d %H:%M:%S")
                customers.append(c)
            conn.close()
            return jsonify(customers)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO KHACH_HANG (SoDienThoai, TenKH, DiemTichLuy) VALUES (?, ?, ?)",
                (data['SoDienThoai'], data['TenKH'], data.get('DiemTichLuy', 0))
            )
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/customers/<int:makh>', methods=['PUT', 'DELETE'])
def update_customer(makh):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'DELETE':
            cursor.execute("DELETE FROM KHACH_HANG WHERE MaKH = ?", (makh,))
        elif request.method == 'PUT':
            data = request.get_json()
            cursor.execute("""
                UPDATE KHACH_HANG 
                SET SoDienThoai = ?, TenKH = ?, DiemTichLuy = ?
                WHERE MaKH = ?
            """, (data['SoDienThoai'], data['TenKH'], data['DiemTichLuy'], makh))
                
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 10. API: Quản lý Khuyến mãi (Admin)
@app.route('/api/promotions', methods=['GET', 'POST'])
def manage_promotions():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT MaKM, LoaiKM, TenKM, PhanTramGiam, NgayBatDau, NgayKetThuc FROM KHUYEN_MAI")
            columns = [col[0] for col in cursor.description]
            promos = []
            for row in cursor.fetchall():
                p = dict(zip(columns, row))
                p['NgayBatDau'] = p['NgayBatDau'].strftime("%Y-%m-%d") if p['NgayBatDau'] else None
                p['NgayKetThuc'] = p['NgayKetThuc'].strftime("%Y-%m-%d") if p['NgayKetThuc'] else None
                
                # Fetch related products
                cursor2 = conn.cursor()
                cursor2.execute("SELECT MaSP FROM KM_SAN_PHAM WHERE MaKM = ?", (p['MaKM'],))
                p['SanPhams'] = [sp[0] for sp in cursor2.fetchall()]
                
                promos.append(p)
            conn.close()
            return jsonify(promos)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO KHUYEN_MAI (MaKM, LoaiKM, TenKM, PhanTramGiam, NgayBatDau, NgayKetThuc) VALUES (?, ?, ?, ?, ?, ?)",
                (data['MaKM'], data.get('LoaiKM', 'SanPham'), data['TenKM'], data['PhanTramGiam'], data['NgayBatDau'], data['NgayKetThuc'])
            )
            
            if data.get('LoaiKM', 'SanPham') == 'SanPham' and 'SanPhams' in data:
                for ma_sp in data['SanPhams']:
                    cursor.execute("INSERT INTO KM_SAN_PHAM (MaKM, MaSP) VALUES (?, ?)", (data['MaKM'], ma_sp))
                    
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/promotions/<makm>', methods=['PUT'])
def update_promotion(makm):
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE KHUYEN_MAI SET TenKM = ?, PhanTramGiam = ?, NgayBatDau = ?, NgayKetThuc = ? WHERE MaKM = ?",
            (data['TenKM'], data['PhanTramGiam'], data['NgayBatDau'], data['NgayKetThuc'], makm)
        )
        
        if data.get('LoaiKM', 'SanPham') == 'SanPham' and 'SanPhams' in data:
            cursor.execute("DELETE FROM KM_SAN_PHAM WHERE MaKM = ?", (makm,))
            for ma_sp in data['SanPhams']:
                cursor.execute("INSERT INTO KM_SAN_PHAM (MaKM, MaSP) VALUES (?, ?)", (makm, ma_sp))
                
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 11. API: Lấy danh mục sản phẩm
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaDanhMuc, TenDanhMuc FROM DANH_MUC")
        columns = [col[0] for col in cursor.description]
        cats = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(cats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<masp>', methods=['DELETE'])
def delete_product(masp):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM SAN_PHAM WHERE MaSP=?", masp)
        conn.commit()
        return jsonify({"status": "success"})
    except pyodbc.Error as ex:
        conn.rollback()
        error_msg = ex.args[1] if len(ex.args) > 1 else str(ex)
        if "REFERENCE" in error_msg:
            return jsonify({"status": "error", "error": "Không thể xóa vì sản phẩm đang nằm trong Hóa đơn hoặc Lô hàng."})
        return jsonify({"status": "error", "error": str(ex)})
    finally:
        conn.close()

@app.route('/api/promotions/<makm>', methods=['DELETE'])
def delete_promotion(makm):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM KHUYEN_MAI WHERE MaKM=?", makm)
        conn.commit()
        return jsonify({"status": "success"})
    except pyodbc.Error as ex:
        conn.rollback()
        error_msg = ex.args[1] if len(ex.args) > 1 else str(ex)
        if "REFERENCE" in error_msg:
            return jsonify({"status": "error", "error": "Không thể xóa vì khuyến mãi đang được áp dụng."})
        return jsonify({"status": "error", "error": str(ex)})
    finally:
        conn.close()

# 11b. API: Quản lý Voucher (Admin)
@app.route('/api/vouchers', methods=['GET', 'POST'])
def manage_vouchers():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT MaVoucher, TenVoucher, LoaiVoucher, GiaTri, MaSPTang, SoLuongTang, NgayBatDau, NgayKetThuc FROM VOUCHER")
            columns = [col[0] for col in cursor.description]
            vouchers = []
            for row in cursor.fetchall():
                v = dict(zip(columns, row))
                v['NgayBatDau'] = v['NgayBatDau'].strftime("%Y-%m-%d") if v['NgayBatDau'] else None
                v['NgayKetThuc'] = v['NgayKetThuc'].strftime("%Y-%m-%d") if v['NgayKetThuc'] else None
                vouchers.append(v)
            conn.close()
            return jsonify(vouchers)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO VOUCHER (MaVoucher, TenVoucher, LoaiVoucher, GiaTri, MaSPTang, SoLuongTang, NgayBatDau, NgayKetThuc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (data['MaVoucher'], data['TenVoucher'], data['LoaiVoucher'], data.get('GiaTri'), data.get('MaSPTang'), data.get('SoLuongTang'), data['NgayBatDau'], data['NgayKetThuc'])
            )
            conn.commit()
            conn.close()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/vouchers/<mavoucher>', methods=['PUT'])
def update_voucher(mavoucher):
    data = request.get_json()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE VOUCHER SET TenVoucher = ?, LoaiVoucher = ?, GiaTri = ?, MaSPTang = ?, SoLuongTang = ?, NgayBatDau = ?, NgayKetThuc = ? WHERE MaVoucher = ?",
            (data['TenVoucher'], data['LoaiVoucher'], data.get('GiaTri'), data.get('MaSPTang'), data.get('SoLuongTang'), data['NgayBatDau'], data['NgayKetThuc'], mavoucher)
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/vouchers/<mavoucher>', methods=['DELETE'])
def delete_voucher(mavoucher):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM VOUCHER WHERE MaVoucher=?", mavoucher)
        conn.commit()
        return jsonify({"status": "success"})
    except pyodbc.Error as ex:
        conn.rollback()
        error_msg = ex.args[1] if len(ex.args) > 1 else str(ex)
        if "REFERENCE" in error_msg:
            return jsonify({"status": "error", "error": "Không thể xóa vì voucher đã được sử dụng."})
        return jsonify({"status": "error", "error": str(ex)})
    finally:
        conn.close()

# 12. API: Lấy danh sách nhà cung cấp
@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaNCC, TenNCC, SoDienThoai, DiaChi FROM NHA_CUNG_CAP")
        columns = [col[0] for col in cursor.description]
        suppliers = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(suppliers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if MaNCC exists
        cursor.execute("SELECT 1 FROM NHA_CUNG_CAP WHERE MaNCC = ?", (data['MaNCC'],))
        if cursor.fetchone():
            return jsonify({"status": "error", "error": "Mã NCC đã tồn tại!"}), 400
            
        cursor.execute("""
            INSERT INTO NHA_CUNG_CAP (MaNCC, TenNCC, SoDienThoai, DiaChi)
            VALUES (?, ?, ?, ?)
        """, (data['MaNCC'], data['TenNCC'], data.get('SoDienThoai'), data.get('DiaChi')))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/suppliers/<mancc>', methods=['PUT'])
def update_supplier(mancc):
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE NHA_CUNG_CAP 
            SET TenNCC = ?, SoDienThoai = ?, DiaChi = ?
            WHERE MaNCC = ?
        """, (data['TenNCC'], data.get('SoDienThoai'), data.get('DiaChi'), mancc))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/suppliers/<mancc>', methods=['DELETE'])
def delete_supplier(mancc):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM NHA_CUNG_CAP WHERE MaNCC = ?", (mancc,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except pyodbc.IntegrityError:
        return jsonify({"status": "error", "error": "Không thể xóa Nhà Cung Cấp này vì đã có dữ liệu liên quan (Phiếu nhập, v.v.)."}), 400
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

# ==========================================
# DEMO CONCURRENCY ISSUES
# ==========================================
@app.route('/demo')
def demo_page():
    return send_from_directory('static/demo', 'demo.html')

@app.route('/api/demo/batches', methods=['GET'])
def demo_get_batches():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT L.MaLo, S.TenSP, S.MaSP FROM LO_HANG L JOIN SAN_PHAM S ON L.MaSP = S.MaSP WHERE L.SoLuongTon > 0")
        batches = [{"MaLo": str(r[0]), "TenSP": r[1], "MaSP": r[2]} for r in cursor.fetchall()]
        conn.close()
        return jsonify(batches)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/products', methods=['GET'])
def demo_get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT P.MaSP, P.TenSP, P.GiaBan, ISNULL(SUM(L.SoLuongTon), 0) 
            FROM SAN_PHAM P 
            LEFT JOIN LO_HANG L ON P.MaSP = L.MaSP 
            GROUP BY P.MaSP, P.TenSP, P.GiaBan
        """)
        products = [{"MaSP": r[0], "TenSP": r[1], "GiaBan": float(r[2]), "SoLuongTon": float(r[3])} for r in cursor.fetchall()]
        conn.close()
        return jsonify(products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/inventory/<masp>', methods=['GET'])
def demo_get_inventory(masp):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT SUM(SoLuongTon) FROM LO_HANG WHERE MaSP = ?", (masp,))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"SoLuongTon": float(row[0]) if row and row[0] is not None else 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/lost_update', methods=['GET'])
def demo_lost_update():
    mode = request.args.get('mode', 'error')
    tx = request.args.get('tx', '1')
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = False 
        cursor = conn.cursor()
        
        # 1. Đọc số lượng tồn của Lô cũ nhất
        if mode == 'fixed':
            cursor.execute("SELECT TOP 1 MaLo, SoLuongTon FROM LO_HANG WITH (UPDLOCK, HOLDLOCK) WHERE MaSP = ? AND SoLuongTon > 0 ORDER BY HanSuDung ASC", (masp,))
        else:
            cursor.execute("SELECT TOP 1 MaLo, SoLuongTon FROM LO_HANG WHERE MaSP = ? AND SoLuongTon > 0 ORDER BY HanSuDung ASC", (masp,))
            
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return jsonify({"error": f"SP {masp} đã hết hàng trong mọi lô"})
            
        malo = row[0]
        qty = row[1]
        
        # Giả lập xử lý lâu (5 giây)
        cursor.execute("WAITFOR DELAY '00:00:05'")
        
        # 2. Cập nhật số lượng
        new_qty = float(qty) - 1
        cursor.execute("UPDATE LO_HANG SET SoLuongTon = ? WHERE MaLo = ?", (new_qty, malo))
        
        conn.commit()
        conn.close()
        return jsonify({"message": f"Đã bán 1 SP. Tồn kho tính toán: {qty} -> {new_qty}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/dirty_read/transaction', methods=['GET'])
def demo_dirty_read_tx():
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor()
        
        # Giả lập Thu Ngân chọn 1 lô của SP này và nhập sai tồn kho thành 9999
        cursor.execute("SELECT TOP 1 MaLo FROM LO_HANG WHERE MaSP = ? ORDER BY HanSuDung ASC", (masp,))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE LO_HANG SET SoLuongTon = 9999 WHERE MaLo = ?", (row[0],))
            
        cursor.execute("WAITFOR DELAY '00:00:05'")
        
        conn.rollback()
        conn.close()
        return jsonify({"message": "Giao dịch đã bị Hủy (Rollback). Tồn kho quay về ban đầu!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/dirty_read/read', methods=['GET'])
def demo_dirty_read_read():
    mode = request.args.get('mode', 'error')
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor()
        
        if mode == 'fixed':
            cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        else:
            cursor.execute("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED")
            
        # Đọc TỔNG tồn kho của Sản phẩm đó
        cursor.execute("SELECT SUM(SoLuongTon) FROM LO_HANG WHERE MaSP = ?", (masp,))
        row = cursor.fetchone()
        
        conn.commit()
        conn.close()
        return jsonify({"SoLuongTon": float(row[0]) if row and row[0] is not None else 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/non_repeatable_read/read', methods=['GET'])
def demo_non_repeatable_read():
    mode = request.args.get('mode', 'error')
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor()
        
        if mode == 'fixed':
            cursor.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
            
        cursor.execute("SELECT GiaBan FROM SAN_PHAM WHERE MaSP = ?", (masp,))
        row = cursor.fetchone()
        price1 = row[0] if row else 0
        
        cursor.execute("WAITFOR DELAY '00:00:05'")
        
        cursor.execute("SELECT GiaBan FROM SAN_PHAM WHERE MaSP = ?", (masp,))
        row2 = cursor.fetchone()
        price2 = row2[0] if row2 else 0
        
        conn.commit()
        conn.close()
        return jsonify({"price1": float(price1), "price2": float(price2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/non_repeatable_read/update', methods=['POST'])
def demo_non_repeatable_update():
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor()
        cursor.execute("UPDATE SAN_PHAM SET GiaBan = GiaBan + 1000 WHERE MaSP = ?", (masp,))
        conn.commit()
        conn.close()
        return jsonify({"message": f"Đã tăng giá {masp} thêm 1000 VNĐ!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/phantom_read/read', methods=['GET'])
def demo_phantom_read():
    mode = request.args.get('mode', 'error')
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor()
        
        if mode == 'fixed':
            cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
            
        cursor.execute("SELECT COUNT(*) FROM HOA_DON")
        count1 = cursor.fetchone()[0]
        
        cursor.execute("WAITFOR DELAY '00:00:05'")
        
        cursor.execute("SELECT COUNT(*) FROM HOA_DON")
        count2 = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        return jsonify({"count1": count1, "count2": count2})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/phantom_read/insert', methods=['POST'])
def demo_phantom_insert():
    import time
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor()
        
        ma_hd = f"HD_DEMO_{int(time.time())}"
        cursor.execute("""
            INSERT INTO HOA_DON (MaHD, NgayLap, TongTienHang, ThanhTien, PhuongThucTT, MaNV)
            VALUES (?, GETDATE(), 50000, 50000, 'Tiền mặt', 'thungan1')
        """, (ma_hd,))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Đã chèn 1 hóa đơn rác (50,000 VNĐ)!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # host='0.0.0.0' allows external devices on the same network to connect
    app.run(host='0.0.0.0', debug=True, port=5000, threaded=True)
