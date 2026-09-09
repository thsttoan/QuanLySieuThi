# Dự Án Hệ Quản Trị CSDL & Điều Khiển Tương Tranh - Bách Hóa Xanh

Dự án mô phỏng hệ thống quản lý chuỗi siêu thị bán lẻ thực phẩm và hàng tiêu dùng nhanh **Bách Hóa Xanh**. Dự án được xây dựng theo kiến trúc **Database-First chuẩn mực cho môn học Hệ Quản Trị Cơ Sở Dữ Liệu**:
- **Toàn bộ logic tính toán và nghiệp vụ được chuyển giao 100% xuống Microsoft SQL Server** thông qua các đối tượng lập trình nâng cao: **Bảng (Tables), Khung nhìn (Views), Hàm (Functions), Thủ tục lưu trữ (Stored Procedures) và Bộ kích hoạt (Triggers)**.
- **Backend (Python Flask) thuần I/O**: Chỉ đảm nhận nhận dữ liệu từ giao diện, gọi Stored Procedure / Function / View và trả kết quả JSON, **hoàn toàn không thực hiện bất kỳ phép tính toán nghiệp vụ nào** (được kiểm chứng qua phân tích cú pháp AST).
- **Mô phỏng 4 lỗi tương tranh kinh điển (Concurrency Anomalies)**: Được viết trực tiếp thành các **Stored Procedures trong SQL Server** và tích hợp bảng điều khiển mô phỏng trực quan trên Web.

---

## 📋 Yêu Cầu Nghiệp Vụ & Thiết Kế Hệ Thống

### 1. Quản lý Sản phẩm & Phân loại
- Quản lý 15 danh mục hàng hóa (Thịt cá tươi sống, Rau củ, Thực phẩm đông lạnh, Sữa, Đồ dùng gia đình...).
- Hỗ trợ sản phẩm bán theo số lẻ/thập phân (`LaHangTuoiSong = 1` cho thịt cá, rau củ: ví dụ bán 0.45 kg).
- **Audit biến động giá**: Mọi thao tác thay đổi giá bán sản phẩm đều được Trigger tự động ghi log vào bảng `BANG_LOG_GIA` kèm thời gian và người thay đổi.

### 2. Quản lý Kho hàng & Thuật toán xuất kho FIFO
- Quản lý tồn kho theo từng **Lô hàng (`LO_HANG`)** riêng biệt với Ngày sản xuất và Hạn sử dụng (HSD).
- Thuật toán **FIFO (First In, First Out)** trong SQL Server: Khi bán hàng, Stored Procedure tự động tìm các lô hàng còn hạn sử dụng gần nhất trừ kho trước.
- Cảnh báo tồn kho thấp và hàng cận date (dưới 7 ngày) qua các Views chuyên dụng.
- Nghiệp vụ **Tiêu hủy hàng quá hạn** được thực hiện an toàn trong Stored Procedure có Transaction.

### 3. Khuyến Mãi, Voucher & Tích Lũy Thành Viên
- **Khuyến mãi sản phẩm**: Giảm giá theo % từng mặt hàng, tự động tra cứu bằng hàm `fn_TinhTienSauKhuyenMai`.
- **Voucher**: Giảm % theo đơn hàng hoặc tặng kèm sản phẩm miễn phí (tự động xuất kho quà tặng theo FIFO).
- **Hạng thành viên & Điểm tích lũy**: Mỗi 100.000đ hóa đơn tích lũy 1 điểm (dùng hàm `fn_TinhDiemTichLuy`). Trigger tự động nâng hạng khách hàng: **Đồng (< 50đ) $\rightarrow$ Bạc ($\ge$ 50đ) $\rightarrow$ Vàng ($\ge$ 200đ) $\rightarrow$ Kim Cương ($\ge$ 500đ)**.

---

## 🏛️ Các Đối Tượng Lập Trình Cơ Sở Dữ Liệu (SQL Server)

Hệ thống triển khai đầy đủ và chuyên sâu 4 đối tượng lập trình của SQL Server:

### 1. Khung nhìn (Views) - 7 Views
| Tên View | Vai trò & Nghiệp vụ |
| :--- | :--- |
| **`v_SanPhamSieuThi`** | Tổng hợp sản phẩm, tên danh mục, đơn giá gốc, đơn giá khuyến mãi (gọi hàm), và tổng tồn kho còn hạn sử dụng. |
| **`v_CanhBaoTonKho`** | Cảnh báo các sản phẩm có tổng lượng tồn kho dưới ngưỡng an toàn ($\le$ 10). |
| **`v_CanhBaoHanSD`** | Phân loại trạng thái các lô hàng: `Đã hết hạn`, `Cận date (<= 7 ngày)`, `Bình thường`. |
| **`v_DoanhThuTheoNgay`** | Báo cáo doanh thu thực tế, tổng tiền hàng, chiết khấu khuyến mãi, điểm sử dụng theo từng ngày. |
| **`v_DoanhThuTheoDanhMuc`** | Thống kê số lượng bán và tổng doanh thu theo từng danh mục sản phẩm. |
| **`v_TopSanPhamBanChay`** | Xếp hạng Top sản phẩm có số lượng xuất kho cao nhất cùng doanh thu tạo ra. |
| **`v_BaoCaoHieuSuatNhanVien`**| Thống kê tổng số hóa đơn đã xuất và tổng doanh thu mà từng nhân viên thu ngân mang lại. |

### 2. Hàm người dùng định nghĩa (User-Defined Functions) - 7 Functions
| Tên Function | Loại | Vai trò & Nghiệp vụ |
| :--- | :--- | :--- |
| **`fn_SinhMaHoaDon()`** | Scalar | Tự động sinh mã hóa đơn duy nhất dạng `HD_yyyyMMdd_HHmmss_fff`. |
| **`fn_SinhMaPhieuNhap()`** | Scalar | Tự động sinh mã phiếu nhập duy nhất dạng `PN_yyyyMMdd_HHmmss_fff`. |
| **`fn_TinhTienSauKhuyenMai(@MaSP, @GiaGoc)`** | Scalar | Tra cứu chương trình khuyến mãi hiện hành để tính giá sau giảm. |
| **`fn_TinhDiemTichLuy(@ThanhTien)`** | Scalar | Quy đổi tổng tiền hóa đơn thành điểm thưởng (100.000đ = 1 điểm). |
| **`fn_XepHangKhachHang(@DiemTichLuy)`** | Scalar | Trả về chuỗi phân hạng thẻ thành viên: Đồng, Bạc, Vàng, Kim Cương. |
| **`fn_KiemTraDieuKienVoucher(@MaVoucher, @TongTien)`** | Scalar | Kiểm tra voucher còn hạn dùng và đủ điều kiện giá trị đơn hàng hay không. |
| **`fn_BaoCaoDoanhThuTheoKhoangNgay(@TuNgay, @DenNgay)`** | Table-Valued | Báo cáo doanh thu động trong khoảng thời gian tùy chọn. |

### 3. Bộ kích hoạt (Triggers) - 4 Triggers
| Tên Trigger | Bảng tác động | Nghiệp vụ bảo toàn toàn vẹn dữ liệu |
| :--- | :--- | :--- |
| **`trg_SauKhiLapHoaDon`** | `HOA_DON` (AFTER INSERT) | Trừ điểm khách hàng đã dùng, cộng điểm tích lũy mới, tự động nâng hạng thẻ thành viên. Rollback nếu điểm bị âm. |
| **`trg_KiemTraHSDKhiBan`** | `CHI_TIET_HOA_DON` (AFTER INSERT, UPDATE) | Chặn không cho bán sản phẩm thuộc các lô hàng đã quá hạn sử dụng. |
| **`trg_Audit_GiaSanPham`** | `SAN_PHAM` (AFTER UPDATE) | Tự động bắt sự kiện sửa `GiaBan`, lưu giá cũ/mới và thời gian vào `BANG_LOG_GIA`. |
| **`trg_KiemTraTonKhoKhongAm`** | `LO_HANG` (AFTER UPDATE) | Tuyệt đối ngăn chặn hiện tượng số lượng tồn kho bị âm (`SoLuongTon < 0`). |

### 4. Thủ tục lưu trữ (Stored Procedures) - 13 Procedures
#### A. Thủ tục nghiệp vụ cốt lõi (6 Procedures)
- **`sp_ThanhToanHoaDon`**: Nhận JSON danh sách sản phẩm, kiểm tra điều kiện, trừ kho FIFO với khóa `UPDLOCK, ROWLOCK`, tính tiền, voucher, tích điểm và xuất hóa đơn trong một Giao tác nguyên tử (`BEGIN TRANSACTION ... COMMIT`).
- **`sp_BanHangFIFO`**: Xử lý duyệt trừ kho theo nguyên tắc FIFO (lô cận date trừ trước).
- **`sp_NhapKho`**: Đóng gói quy trình tạo phiếu nhập, thêm chi tiết phiếu nhập và tạo lô hàng mới.
- **`sp_TieuHuyHang`**: Xử lý tiêu hủy hàng hỏng/hết hạn, trừ kho và lưu vết bảng `HANG_TIEU_HUY`.
- **`sp_SuaChiTietHoaDon`** & **`sp_SuaChiTietPhieuNhap`**: Hiệu chỉnh số lượng sau xuất/nhập kho và cân bằng lại tồn kho tự động.

#### B. Thủ tục Demo Tương Tranh (7 Procedures)
Toàn bộ kịch bản và thuật toán điều khiển tương tranh được lập trình trực tiếp thành các Stored Procedure:
- **`sp_Demo_LostUpdate`**: Mô phỏng Mất cập nhật (Chế độ `'error'` không khóa gây mất cập nhật vs `'fixed'` dùng khóa 2PL `WITH (UPDLOCK, HOLDLOCK)`).
- **`sp_Demo_DirtyRead_Transaction`**: Giao tác cập nhật tạm thời tồn kho thành 9999 $\rightarrow$ `WAITFOR DELAY` 5s $\rightarrow$ `ROLLBACK`.
- **`sp_Demo_DirtyRead_Read`**: Giao tác đọc (Chế độ `'error'` dùng `READ UNCOMMITTED` đọc phải dữ liệu rác vs `'fixed'` dùng `READ COMMITTED`).
- **`sp_Demo_NonRepeatableRead_Read`**: Giao tác đọc giá sản phẩm 2 lần cách nhau 5s (`'error'` dùng `READ COMMITTED` vs `'fixed'` dùng `REPEATABLE READ`).
- **`sp_Demo_NonRepeatableRead_Update`**: Giao tác tăng giá xen giữa 2 lần đọc.
- **`sp_Demo_PhantomRead_Read`**: Giao tác đếm số hóa đơn 2 lần cách nhau 5s (`'error'` dùng `REPEATABLE READ` vs `'fixed'` dùng `SERIALIZABLE`).
- **`sp_Demo_PhantomRead_Insert`**: Giao tác chèn thêm hóa đơn mới xen giữa 2 lần đếm.

---

## 🐞 Bảng Điều Khiển Demo Tương Tranh (Concurrency Control UI)

Truy cập địa chỉ: `http://127.0.0.1:5000/demo` để trải nghiệm giao diện test tương tranh trực quan:

```
+-----------------------------------------------------------------------------------+
|                            DEMO CONCURRENCY CONTROL                               |
+-----------------------------------------------------------------------------------+
| 1. LOST UPDATE         | Thu Ngân 1 & 2 bán cùng lúc  | Lock: UPDLOCK, HOLDLOCK   |
| 2. DIRTY READ          | Kho sửa 9999 -> Rollback      | Isolation: READ COMMITTED |
| 3. NON-REPEATABLE READ | Thu ngân đọc giá 2 lần       | Isolation: REPEATABLE READ|
| 4. PHANTOM READ        | Quản lý đếm Hóa Đơn          | Isolation: SERIALIZABLE   |
+-----------------------------------------------------------------------------------+
```

> **Ghi chú khi Báo cáo với Giảng viên:**
> Bạn có thể kiểm chứng kịch bản theo 2 cách song song:
> 1. Bấm nút trực quan trên giao diện Web Demo: Xem log thời gian thực và kết quả chặn/lỗi.
> 2. Mở trực tiếp **SQL Server Management Studio (SSMS)**, mở 2 cửa sổ Query độc lập và chạy lệnh `EXEC sp_Demo_...` để chứng minh toàn bộ logic tương tranh được điều khiển 100% tại CSDL.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
project/
├── static/
│   ├── admin/             # Giao diện & báo cáo Quản lý / Admin
│   ├── thungan/           # Giao diện Bán hàng / Thu ngân POS
│   ├── kho/               # Giao diện Quản lý Nhập kho & Tiêu hủy
│   ├── demo/              # Giao diện trực quan Demo 4 lỗi tương tranh (demo.html, demo.js)
│   ├── login/             # Giao diện Đăng nhập & phân quyền
│   └── images/            # Hình ảnh sản phẩm Bách Hóa Xanh
├── scripts/
│   ├── deploy_concurrency_demos.sql # Script triển khai các SP demo tương tranh
│   └── export_schema_and_seed.py    # Script đồng bộ schema.sql và seed.sql từ DB
├── app.py                 # Backend Flask thuần I/O (không tính toán nghiệp vụ)
├── schema.sql             # 15 Bảng, 7 Hàm, 7 View, 4 Trigger, 13 Stored Procedures
├── seed.sql               # Toàn bộ dữ liệu sạch, nguyên bản của hệ thống
└── README.md              # Tài liệu báo cáo dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn bị Cơ sở dữ liệu (SQL Server)
Mở SQL Server Management Studio (SSMS) hoặc dòng lệnh `sqlcmd`:
```bash
# 1. Khởi tạo toàn bộ CSDL và các đối tượng (Table, View, Proc, Func, Trigger)
sqlcmd -S localhost -E -d QL_BachHoaXanh -i schema.sql

# 2. Nạp dữ liệu ban đầu
sqlcmd -S localhost -E -d QL_BachHoaXanh -i seed.sql
```

### 2. Cấu hình chuỗi kết nối
Kiểm tra cấu hình kết nối tại đầu file `app.py`:
```python
CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=NONAME\\SQLEXPRESS;"  # Đổi thành tên Server SQL Server của bạn
    "DATABASE=QL_BachHoaXanh;"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)
```

### 3. Cài đặt thư viện & Khởi chạy ứng dụng
```bash
pip install flask pyodbc werkzeug
python app.py
```
Ứng dụng sẽ chạy tại: `http://127.0.0.1:5000`

---

## 📡 Danh Sách API Chính (Endpoints)

| Nhóm | Endpoint | Method | Đối tượng CSDL xử lý |
| :--- | :--- | :---: | :--- |
| **Sản phẩm** | `/api/products` | `GET` | View `v_SanPhamSieuThi` |
| **Tồn kho** | `/api/inventory/low_stock` | `GET` | View `v_CanhBaoTonKho` |
| **Bán hàng** | `/api/checkout` | `POST` | Stored Procedure `sp_ThanhToanHoaDon` |
| **Nhập kho** | `/api/import` | `POST` | Stored Procedure `sp_NhapKho` |
| **Tiêu hủy** | `/api/inventory/destroy` | `POST` | Stored Procedure `sp_TieuHuyHang` |
| **Báo cáo** | `/api/revenue` | `GET` | View `v_DoanhThuTheoNgay` |
| **Báo cáo** | `/api/revenue/category` | `GET` | View `v_DoanhThuTheoDanhMuc` |
| **Báo cáo** | `/api/revenue/top_products` | `GET` | View `v_TopSanPhamBanChay` |
| **Báo cáo** | `/api/revenue/staff` | `GET` | View `v_BaoCaoHieuSuatNhanVien` |
| **Báo cáo** | `/api/revenue/range` | `GET` | Table-Valued Function `fn_BaoCaoDoanhThuTheoKhoangNgay` |
| **Audit** | `/api/price_logs` | `GET` | Bảng `BANG_LOG_GIA` (ghi tự động bởi Trigger) |
| **Tương tranh**| `/api/demo/lost_update` | `GET` | Stored Procedure `sp_Demo_LostUpdate` |
| **Tương tranh**| `/api/demo/dirty_read/transaction` | `GET` | Stored Procedure `sp_Demo_DirtyRead_Transaction` |
| **Tương tranh**| `/api/demo/dirty_read/read` | `GET` | Stored Procedure `sp_Demo_DirtyRead_Read` |
| **Tương tranh**| `/api/demo/non_repeatable_read/read` | `GET` | Stored Procedure `sp_Demo_NonRepeatableRead_Read` |
| **Tương tranh**| `/api/demo/non_repeatable_read/update` | `POST` | Stored Procedure `sp_Demo_NonRepeatableRead_Update` |
| **Tương tranh**| `/api/demo/phantom_read/read` | `GET` | Stored Procedure `sp_Demo_PhantomRead_Read` |
| **Tương tranh**| `/api/demo/phantom_read/insert` | `POST` | Stored Procedure `sp_Demo_PhantomRead_Insert` |
