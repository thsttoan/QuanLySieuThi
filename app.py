import os
import json
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
        cursor.execute("""
            SELECT 
                sp.MaSP, 
                sp.TenSP, 
                sp.MaDanhMuc, 
                dm.TenDanhMuc, 
                sp.DonViTinh, 
                sp.GiaBan, 
                dbo.fn_TinhTienSauKhuyenMai(sp.MaSP, sp.GiaBan) AS GiaKhuyenMai, 
                ISNULL((
                    SELECT SUM(lh.SoLuongTon)
                    FROM LO_HANG lh
                    WHERE lh.MaSP = sp.MaSP AND lh.HanSuDung > GETDATE()
                ), 0) AS TongTonKho, 
                sp.LaHangTuoiSong,
                ISNULL((
                    SELECT TOP 1 lh2.GiaNhap
                    FROM LO_HANG lh2
                    WHERE lh2.MaSP = sp.MaSP
                    ORDER BY lh2.MaLo DESC
                ), ROUND(sp.GiaBan * 0.75, -2)) AS GiaNhapGoiY
            FROM SAN_PHAM sp
            INNER JOIN DANH_MUC dm ON sp.MaDanhMuc = dm.MaDanhMuc
            ORDER BY sp.MaDanhMuc, sp.MaSP
        """)
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

# 4. API: Lập hóa đơn bán hàng (Toàn bộ tính toán và giao tác được đẩy xuống SQL Server sp_ThanhToanHoaDon)
@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    if not data or 'cart' not in data or not data['cart']:
        return jsonify({"error": "Giỏ hàng trống!"}), 400
    
    ma_nv = data.get('ma_nv')
    if not ma_nv or ma_nv == 'NV001':
        ma_nv = 'thungan1'
    sdt_kh = data.get('sdt_kh', '').strip() or None
    diem_su_dung = int(data.get('diem_su_dung', 0))
    pt_thanh_toan = data.get('pt_thanh_toan', 'Tiền mặt')
    ma_voucher = data.get('ma_voucher', '').strip() or None
    cart_json = json.dumps(data['cart'])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "EXEC sp_ThanhToanHoaDon @MaNV=?, @SoDienThoaiKH=?, @DiemSuDung=?, @MaVoucher=?, @PhuongThucTT=?, @ChiTietGioHangJSON=?",
            (ma_nv, sdt_kh, diem_su_dung, ma_voucher, pt_thanh_toan, cart_json)
        )
        row = cursor.fetchone()
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Thanh toán thành công (COMMIT CSDL)!",
            "ma_hd": row.MaHD,
            "tong_tien_hang": float(row.TongTienHang),
            "giam_gia_km": float(row.GiamGiaKM),
            "giam_gia_voucher": float(row.GiamGiaVoucher),
            "diem_su_dung": int(row.DiemSuDung),
            "thanh_tien": float(row.ThanhTien),
            "diem_tich_luy_moi": int(row.DiemTichLuyMoi),
            "ma_voucher": row.MaVoucher or "",
            "sql_log": [f"EXEC sp_ThanhToanHoaDon @MaNV='{ma_nv}', @SoDienThoaiKH='{sdt_kh}', @DiemSuDung={diem_su_dung}, @MaVoucher='{ma_voucher}', @PhuongThucTT=N'{pt_thanh_toan}'"]
        })
    except Exception as e:
        conn.rollback()
        conn.close()
        err_msg = str(e)
        if '[SQL Server]' in err_msg:
            parts = err_msg.split('[SQL Server]')
            clean_err = parts[-1].strip().split('(50000)')[0].strip()
            if clean_err:
                err_msg = clean_err
        return jsonify({
            "status": "rollback",
            "error": err_msg,
            "message": f"Giao tác CSDL bị lỗi và đã ROLLBACK! {err_msg}"
        }), 400
    finally:
        try:
            conn.close()
        except:
            pass


# 5. API: Nhập kho thêm lô hàng mới (Đơn lẻ hoặc Hàng loạt theo Danh mục)
@app.route('/api/import', methods=['POST'])
def import_stock():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dữ liệu nhập trống!"}), 400
        
    ma_nv = data.get('ma_nv', 'kho1')
    if not ma_nv or ma_nv == 'NV002':
        ma_nv = 'kho1'
    ma_ncc = data.get('ma_ncc', 'NCC01')
    
    # 1. Kiểm tra nếu là NHẬP HÀNG LOẠT (nhiều sản phẩm)
    items = data.get('items')
    if items and isinstance(items, list) and len(items) > 0:
        valid_items = []
        for it in items:
            sp = it.get('ma_sp')
            sl = float(it.get('so_luong', 0))
            gn = float(it.get('gia_nhap', 0))
            nsx = it.get('ngay_sx') or None
            hsd = it.get('han_sd')
            if sp and sl > 0 and gn > 0 and hsd:
                valid_items.append({
                    'ma_sp': sp,
                    'so_luong': sl,
                    'gia_nhap': gn,
                    'ngay_sx': nsx,
                    'han_sd': hsd
                })
        if not valid_items:
            return jsonify({"error": "Không có sản phẩm hợp lệ để nhập kho!"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Sinh 1 mã phiếu nhập duy nhất cho toàn bộ danh sách sản phẩm
            cursor.execute("SELECT dbo.fn_SinhMaPhieuNhap()")
            row = cursor.fetchone()
            ma_pn = row[0] if row else None
            
            # Gọi sp_NhapKho cho từng sản phẩm với cùng @MaPN
            for it in valid_items:
                cursor.execute(
                    "EXEC sp_NhapKho @MaPN=?, @MaNV=?, @MaNCC=?, @MaSP=?, @SoLuong=?, @GiaNhap=?, @NgaySanXuat=?, @HanSuDung=?",
                    (ma_pn, ma_nv, ma_ncc, it['ma_sp'], it['so_luong'], it['gia_nhap'], it['ngay_sx'], it['han_sd'])
                )
            conn.commit()
            conn.close()
            return jsonify({
                "status": "success", 
                "ma_pn": ma_pn, 
                "count": len(valid_items),
                "message": f"Nhập kho thành công {len(valid_items)} sản phẩm vào Phiếu Nhập: {ma_pn}!"
            })
        except Exception as e:
            conn.rollback()
            conn.close()
            err_msg = str(e)
            if '[SQL Server]' in err_msg:
                parts = err_msg.split('[SQL Server]')
                clean_err = parts[-1].strip().split('(50000)')[0].strip()
                if clean_err:
                    err_msg = clean_err
            return jsonify({"error": err_msg}), 400

    # 2. Nhập đơn lẻ (1 sản phẩm)
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
        cursor.execute(
            "EXEC sp_NhapKho @MaPN=NULL, @MaNV=?, @MaNCC=?, @MaSP=?, @SoLuong=?, @GiaNhap=?, @NgaySanXuat=?, @HanSuDung=?",
            (ma_nv, ma_ncc, ma_sp, so_luong, gia_nhap, ngay_sx, han_sd)
        )
        row = cursor.fetchone()
        ma_pn = row[0] if row else "PN"
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "ma_pn": ma_pn, "message": f"Nhập lô hàng mới thành công (Mã Phiếu Nhập: {ma_pn})!"})
    except Exception as e:
        conn.rollback()
        conn.close()
        err_msg = str(e)
        if '[SQL Server]' in err_msg:
            parts = err_msg.split('[SQL Server]')
            clean_err = parts[-1].strip().split('(50000)')[0].strip()
            if clean_err:
                err_msg = clean_err
        return jsonify({"error": err_msg}), 400

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

# 5.2 API: Tiêu hủy hàng hết hạn (đơn lẻ hoặc hàng loạt qua sp_TieuHuyHang)
@app.route('/api/inventory/destroy', methods=['POST'])
def destroy_inventory():
    data = request.json
    if not data:
        return jsonify({"status": "error", "error": "Thiếu dữ liệu tiêu hủy!"}), 400

    ma_nv = data.get('ma_nv', 'kho1')
    if not ma_nv or ma_nv == 'NV002':
        ma_nv = 'kho1'

    # Kiểm tra nếu tiêu hủy hàng loạt (nhiều lô cùng lúc)
    items = data.get('items')
    if items and isinstance(items, list) and len(items) > 0:
        valid_items = []
        for it in items:
            malo = it.get('ma_lo')
            masp = it.get('ma_sp')
            sl = float(it.get('so_luong', 0))
            if malo and masp and sl > 0:
                valid_items.append((malo, masp, sl))
        if not valid_items:
            return jsonify({"status": "error", "error": "Không có lô hàng hợp lệ để tiêu hủy!"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            for malo, masp, sl in valid_items:
                cursor.execute(
                    "EXEC sp_TieuHuyHang @MaLo=?, @MaSP=?, @SoLuongHuy=?, @MaNV=?",
                    (malo, masp, sl, ma_nv)
                )
            conn.commit()
            conn.close()
            return jsonify({
                "status": "success", 
                "count": len(valid_items),
                "message": f"Đã tiêu hủy thành công {len(valid_items)} lô hàng!"
            })
        except Exception as e:
            conn.rollback()
            conn.close()
            err_msg = str(e)
            if '[SQL Server]' in err_msg:
                parts = err_msg.split('[SQL Server]')
                clean_err = parts[-1].strip().split('(50000)')[0].strip()
                if clean_err:
                    err_msg = clean_err
            return jsonify({"status": "error", "error": err_msg}), 400

    # Tiêu hủy đơn lẻ (1 lô hàng)
    ma_lo = data.get('ma_lo')
    ma_sp = data.get('ma_sp')
    so_luong = float(data.get('so_luong', 0))
    if not ma_lo or not ma_sp or so_luong <= 0:
        return jsonify({"status": "error", "error": "Thông tin tiêu hủy không hợp lệ!"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "EXEC sp_TieuHuyHang @MaLo=?, @MaSP=?, @SoLuongHuy=?, @MaNV=?",
            (ma_lo, ma_sp, so_luong, ma_nv)
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": f"Đã tiêu hủy thành công lô #{ma_lo}!"})
    except Exception as e:
        conn.rollback()
        conn.close()
        err_msg = str(e)
        if '[SQL Server]' in err_msg:
            parts = err_msg.split('[SQL Server]')
            clean_err = parts[-1].strip().split('(50000)')[0].strip()
            if clean_err:
                err_msg = clean_err
        return jsonify({"status": "error", "error": err_msg}), 400

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

# 6.1 API: Thống kê doanh thu theo danh mục (truy vấn từ View v_DoanhThuTheoDanhMuc)
@app.route('/api/revenue/category', methods=['GET'])
def get_revenue_category():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT TenDanhMuc, DoanhThu FROM v_DoanhThuTheoDanhMuc ORDER BY DoanhThu DESC")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6.2 API: Top 10 sản phẩm bán chạy nhất (truy vấn từ View v_TopSanPhamBanChay)
@app.route('/api/revenue/top_products', methods=['GET'])
def get_top_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaSP, TenSP, TenDanhMuc, DonViTinh, TongSoLuongBan, TongDoanhThu FROM v_TopSanPhamBanChay")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6.3 API: Báo cáo hiệu suất thu ngân (truy vấn từ View v_BaoCaoHieuSuatNhanVien)
@app.route('/api/revenue/staff', methods=['GET'])
def get_staff_performance():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MaNV, TenNV, ChucVu, SoHoaDonDaLap, TongDoanhThuBanDuoc FROM v_BaoCaoHieuSuatNhanVien ORDER BY TongDoanhThuBanDuoc DESC")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6.4 API: Báo cáo doanh thu theo khoảng ngày linh hoạt (gọi Inline TVF fn_BaoCaoDoanhThuTheoKhoangNgay)
@app.route('/api/revenue/range', methods=['GET'])
def get_revenue_range():
    tu_ngay = request.args.get('tu_ngay', '2026-01-01')
    den_ngay = request.args.get('den_ngay', '2026-12-31')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Ngay, SoHoaDon, TongTienHang, TongGiamGia, TongDiemSuDung, DoanhThuThucTe FROM dbo.fn_BaoCaoDoanhThuTheoKhoangNgay(?, ?) ORDER BY Ngay DESC", (tu_ngay, den_ngay))
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            if isinstance(item['Ngay'], (datetime.date, datetime.datetime)):
                item['Ngay'] = item['Ngay'].strftime("%Y-%m-%d")
            results.append(item)
        conn.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6.5 API: Lịch sử biến động giá bán (truy vấn từ bảng audit BANG_LOG_GIA sinh bởi trigger)
@app.route('/api/price_logs', methods=['GET'])
def get_price_logs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 50 l.MaLog, l.MaSP, sp.TenSP, l.GiaCu, l.GiaMoi, l.NgayThayDoi, l.NguoiThayDoi FROM BANG_LOG_GIA l LEFT JOIN SAN_PHAM sp ON l.MaSP = sp.MaSP ORDER BY l.NgayThayDoi DESC")
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            if isinstance(item['NgayThayDoi'], (datetime.date, datetime.datetime)):
                item['NgayThayDoi'] = item['NgayThayDoi'].strftime("%Y-%m-%d %H:%M:%S")
            results.append(item)
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
            elif role_id == -1:
                role = 'DEMO'
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
    ma_nv = data.get('MaNVSuaCuoi') or data.get('MaNV') or 'admin'
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE SAN_PHAM 
               SET TenSP = ?, MaDanhMuc = ?, DonViTinh = ?, GiaBan = ?, LaHangTuoiSong = ?, MaNVSuaCuoi = ?, NgaySuaCuoi = GETDATE() 
               WHERE MaSP = ?""",
            (data['TenSP'], data['MaDanhMuc'], data['DonViTinh'], data['GiaBan'], data['LaHangTuoiSong'], ma_nv, ma_sp)
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
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_LostUpdate @Mode=?, @Tx=?, @MaSP=?", (mode, tx, masp))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"message": row.ThongBao if row else ""})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/dirty_read/transaction', methods=['GET'])
def demo_dirty_read_tx():
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_DirtyRead_Transaction @MaSP=?", (masp,))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"message": row.ThongBao if row else "Giao dịch đã bị Hủy (Rollback). Tồn kho quay về ban đầu!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/dirty_read/read', methods=['GET'])
def demo_dirty_read_read():
    mode = request.args.get('mode', 'error')
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_DirtyRead_Read @Mode=?, @MaSP=?", (mode, masp))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"SoLuongTon": float(row.SoLuongTon) if row and row.SoLuongTon is not None else 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/non_repeatable_read/read', methods=['GET'])
def demo_non_repeatable_read():
    mode = request.args.get('mode', 'error')
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_NonRepeatableRead_Read @Mode=?, @MaSP=?", (mode, masp))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"price1": float(row.price1) if row else 0, "price2": float(row.price2) if row else 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/non_repeatable_read/update', methods=['POST'])
def demo_non_repeatable_update():
    masp = request.args.get('masp', 'SP002')
    manv = request.args.get('manv', 'demo')
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_NonRepeatableRead_Update @MaSP=?, @MaNV=?", (masp, manv))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"message": row.ThongBao if row else f"Đã tăng giá {masp} thêm 1000 VNĐ!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/phantom_read/read', methods=['GET'])
def demo_phantom_read():
    mode = request.args.get('mode', 'error')
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_PhantomRead_Read @Mode=?", (mode,))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"count1": row.count1 if row else 0, "count2": row.count2 if row else 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/phantom_read/insert', methods=['POST'])
def demo_phantom_insert():
    masp = request.args.get('masp', 'SP002')
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_PhantomRead_Insert @MaSP=?", (masp,))
        row = cursor.fetchone()
        conn.close()
        return jsonify({"message": row.ThongBao if row else f"Đã tạo hóa đơn mới cho SP {masp}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 13. API Demo Deadlock (Chương 4: Xử lý Deadlock)
@app.route('/api/demo/deadlock', methods=['GET'])
def demo_deadlock():
    mode = request.args.get('mode', 'error')  # 'error', 'fixed', 'timeout'
    tx = request.args.get('tx', '1')          # '1' hoặc '2'
    malo1 = request.args.get('malo1', 11, type=int)
    malo2 = request.args.get('malo2', 12, type=int)
    try:
        conn = get_db_connection()
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute("EXEC sp_Demo_Deadlock @Mode=?, @Tx=?, @MaLo1=?, @MaLo2=?", (mode, tx, malo1, malo2))
        row = cursor.fetchone()
        conn.close()
        return jsonify({
            "status": row.Status if row else "SUCCESS",
            "message": row.Message if row else ""
        })
    except Exception as e:
        return jsonify({"status": "ERROR", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, threaded=True)

