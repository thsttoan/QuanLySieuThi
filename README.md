# Dự án Demo: Hệ Quản Trị CSDL & Giao Tác Bách Hóa Xanh

Dự án này mô phỏng hệ thống bán lẻ thực phẩm và tiêu dùng nhanh **Bách Hóa Xanh** nhằm nghiên cứu và triển khai **giao tác (transactions)** và **4 đối tượng lập trình chính** trong Microsoft SQL Server (Bảng, View, Stored Procedure, Function, Trigger) kết nối với một ứng dụng web demo trực quan (sử dụng Python Flask + Vanilla CSS).

---

## 📋 Yêu Cầu Chức Năng & Nghiệp Vụ (Requirements)

Dự án này được thiết kế và xây dựng dựa trên các yêu cầu nghiệp vụ thực tế của chuỗi siêu thị Bách Hóa Xanh:

### 1. Quản lý Sản phẩm & Danh mục
- Quản lý danh mục hàng hóa (Thịt cá, Rau củ, Hóa mỹ phẩm, v.v.).
- Quản lý thông tin sản phẩm đa dạng đơn vị tính (Chai, Gói, Kg) và có cờ phân loại `LaHangTuoiSong` để xử lý việc bán theo số thập phân (VD: 0.5 kg).
- Tính toán giá bán tự động, hỗ trợ quét mã Barcode/SKU.

### 2. Quản lý Kho hàng & Lô hàng (FIFO)
- Một sản phẩm có thể nhập từ nhiều lô hàng khác nhau, lưu giữ Hạn sử dụng (HSD) và Ngày sản xuất riêng.
- Thuật toán tự động xuất kho theo nguyên tắc **FIFO (First In, First Out)**: ưu tiên bán/trừ tồn kho của những lô hàng cận date (gần hết hạn) trước.
- Hệ thống tự động cảnh báo các mặt hàng sắp hết hạn (dưới 7 ngày) để đưa vào danh mục thanh lý/giảm giá.

### 3. Hệ thống Khuyến mãi & Voucher
- **Khuyến mãi sản phẩm:** Hỗ trợ cài đặt giảm giá (theo %) cho từng sản phẩm cụ thể.
- **Voucher Hóa Đơn:** 
  - *Voucher Giảm giá:* Áp dụng mã giảm % trên tổng hóa đơn thanh toán.
  - *Voucher Tặng quà:* Tặng kèm sản phẩm (miễn phí) và hệ thống vẫn tự động trừ kho sản phẩm được tặng theo thuật toán FIFO.

### 4. Thu ngân & Bán hàng (POS)
- Giao diện web thu ngân trực quan, cho phép thao tác thêm/bớt hàng hóa vào giỏ, nhập mã Voucher, đổi điểm thưởng.
- Xử lý giao tác bán hàng (Transaction) an toàn: Nếu phát hiện lô hàng bị hết hạn, hoặc tồn kho không đủ, hoặc điểm tích lũy của khách hàng bị âm -> Hủy bỏ (Rollback) toàn bộ hóa đơn.

### 5. Quản lý Khách hàng & Nhân viên
- Quản lý phân quyền 3 cấp độ: Admin (Quản lý), Nhân viên Thu ngân, Nhân viên Kho.
- Đăng ký thẻ thành viên qua Số điện thoại, hệ thống tự động cộng điểm sau khi mua hàng và xếp hạng.

### 6. Thống kê & Báo cáo
- Bảng điều khiển (Dashboard) dành riêng cho Admin hiển thị số liệu doanh thu, đơn hàng trực quan qua các biểu đồ.

---

## 📁 Cấu Trúc Thư Mục Dự Án
```text
project/
├── static/
│   ├── admin/       # Giao diện và logic dành cho Quản lý / Admin (admin.html, admin.css, admin.js)
│   ├── thungan/     # Giao diện và logic dành cho Thu ngân / POS (thungan.html, thungan.css, thungan.js)
│   ├── kho/         # Giao diện và logic dành cho Nhân viên Kho (kho.html, kho.css, kho.js)
│   ├── login/       # Trang đăng nhập, xử lý phân quyền (login.html, login.css, login.js)
│   └── image/       # Thư mục lưu trữ hình ảnh sản phẩm
├── scripts/         # Chứa các script Python hỗ trợ sinh dữ liệu giả, migrate, và xóa dữ liệu (nếu cần)
├── app.py           # Backend Flask API Server kết nối SQL Server
├── schema.sql       # Script khởi tạo toàn bộ cấu trúc CSDL, Bảng, View, Procedure, Trigger
├── seed.sql         # Dữ liệu mẫu hoàn chỉnh (Hóa đơn, Nhân viên, Lô hàng...) dùng để khôi phục
└── README.md        # Tài liệu thuyết minh dự án
```

---

## 🏛️ Tìm Hiểu 4 Đối Tượng Lập Trình Chính Trên SQL Server

Dự án triển khai đầy đủ các đối tượng chính của hệ quản trị cơ sở dữ liệu như sau:

### 1. View (Khung nhìn)
View được sử dụng để che giấu độ phức tạp của các câu lệnh JOIN và gom nhóm dữ liệu, đồng thời tăng cường tính bảo mật:
- **`v_SanPhamSieuThi`**: Kết hợp bảng `SAN_PHAM` và `DANH_MUC`, tính toán giá khuyến mãi bằng cách sử dụng hàm định nghĩa `fn_TinhTienSauKhuyenMai`, đồng thời tính tổng số lượng tồn kho còn hạn sử dụng từ các lô hàng (`LO_HANG`).
- **`v_CanhBaoHanSD`**: Thống kê chi tiết các lô hàng còn tồn kho kèm theo số ngày còn lại đến khi hết hạn sử dụng. Tự động phân loại trạng thái: `Đã hết hạn`, `Sắp hết hạn (<= 7 ngày)` hoặc `Bình thường`.
- **`v_DoanhThuTheoNgay`**: Gom nhóm doanh thu bán hàng thực tế hàng ngày phục vụ cho báo cáo quản lý.

### 2. Stored Procedure (Thủ tục lưu trữ)
Thủ tục chứa các lô lệnh T-SQL được biên dịch sẵn nhằm tối ưu hiệu năng và đóng gói nghiệp vụ:
- **`sp_BanHangFIFO`**: Nghiệp vụ quan trọng nhất. Nhận vào mã sản phẩm và số lượng mua, tự động sử dụng con trỏ (Cursor) duyệt qua các lô hàng chưa hết hạn của sản phẩm đó, thực hiện trừ kho theo nguyên tắc **FIFO (lô sắp hết hạn trừ trước)**. Nếu tổng lượng tồn của tất cả các lô không đủ đáp ứng, thủ tục sẽ chủ động phát lỗi `RAISERROR` để Rollback toàn bộ giao tác.
- **`sp_NhapKho`**: Đóng gói nghiệp vụ nhập kho. Tạo phiếu nhập mới, ghi nhận chi tiết phiếu nhập và tự động tạo bản ghi lô hàng mới trong bảng `LO_HANG` dưới dạng một Transaction an toàn.

### 3. Function (Hàm người dùng định nghĩa)
Thực hiện tính toán và trả về giá trị:
- **`fn_TinhTienSauKhuyenMai`**: Hàm Scalar. Nhận vào mã sản phẩm và đơn giá gốc, tự động tra cứu xem sản phẩm có chương trình khuyến mãi nào đang diễn ra và có hiệu lực hay không để trả về đơn giá cuối cùng sau khi giảm giá.
- **`fn_TinhDiemTichLuy`**: Hàm Scalar. Tính toán số điểm tích lũy mới dựa trên tổng tiền thanh toán thực tế của hóa đơn (Ví dụ: mỗi 100.000đ được cộng 1 điểm).

### 4. Trigger (Bộ kích hoạt)
Tự động kích hoạt khi có sự thay đổi dữ liệu (INSERT, UPDATE, DELETE) để bảo toàn các ràng buộc phức tạp:
- **`trg_SauKhiLapHoaDon`**: Sau khi hóa đơn được thêm thành công (`AFTER INSERT` trên `HOA_DON`), trigger sẽ lấy thông tin khách hàng, thực hiện trừ đi số điểm khách hàng đã yêu cầu sử dụng (`DiemSuDung`) và cộng thêm số điểm tích lũy mới (gọi hàm `fn_TinhDiemTichLuy`). Nếu phát hiện điểm tích lũy của khách hàng bị âm (do sử dụng quá số điểm hiện có), trigger sẽ báo lỗi và rollback toàn bộ tiến trình tạo hóa đơn.
- **`trg_KiemTraHSDKhiBan`**: `AFTER INSERT, UPDATE` trên `CHI_TIET_HOA_DON`. Đảm bảo không nhân viên nào có thể bán hàng thuộc lô đã hết hạn sử dụng. Nếu phát hiện lô hàng đã quá hạn dùng, hệ thống lập tức rollback.

---

## ⚡ Thiết Kế Giao Tác (Transactions) Đảm Bảo Tính ACID

Giao tác bán hàng được quản lý chặt chẽ ở cấp độ Backend của ứng dụng Web (`app.py`) kết hợp với thủ tục lưu trữ:
- **Bắt đầu**: backend gọi kết nối và thiết lập `conn.autocommit = False`.
- **Thực thi**:
  1. Thêm bản ghi thông tin chung vào `HOA_DON` (gọi trigger cập nhật điểm khách hàng).
  2. Duyệt qua từng sản phẩm trong giỏ hàng, gọi `sp_BanHangFIFO` để trừ kho lô hàng và thêm bản ghi chi tiết vào `CHI_TIET_HOA_DON`.
- **Kết quả**:
  - **COMMIT**: Nếu tất cả các sản phẩm đều đủ hàng tồn kho và còn hạn sử dụng, điểm tích lũy của khách hàng hợp lệ -> Lệnh `conn.commit()` được gửi tới SQL Server, xác nhận lưu vĩnh viễn dữ liệu hóa đơn và trừ kho.
  - **ROLLBACK**: Nếu bất kỳ bước nào thất bại (ví dụ: Sản phẩm A bị thiếu 0.5kg tồn kho, hoặc điểm khách hàng bị âm, hoặc lô hàng bán bị hết hạn) -> Khối lệnh `except` tại Backend sẽ bắt lỗi và gọi `conn.rollback()`. Mọi sửa đổi trước đó của hóa đơn đó tại SQL Server đều bị hủy bỏ hoàn toàn, trả lại trạng thái tồn kho và điểm tích lũy nguyên vẹn như trước khi ấn nút thanh toán.

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### Bước 1: Khởi tạo Cơ sở dữ liệu trong SQL Server
Yêu cầu bạn đang chạy SQL Server instance tại địa chỉ `YourServerName`.
Mở PowerShell hoặc Command Prompt và chạy hai lệnh sau:
```bash
# Tạo cấu trúc CSDL, bảng và các đối tượng (View, SP, Function, Trigger)
sqlcmd -S YourServerName -E -i schema.sql

# Nạp dữ liệu mẫu
sqlcmd -S YourServerName -E -i seed.sql
```

### Bước 2: Chạy ứng dụng Web Demo
Dự án yêu cầu cài đặt Python 3.x. Chạy các lệnh sau tại thư mục `project`:
```bash
# Khởi chạy Backend Flask
python app.py
```
Ứng dụng sẽ chạy tại địa chỉ: `http://127.0.0.1:5000`

---

## 🧪 Kịch Bản Kiểm Thử & Xác Minh Giao Tác

Bạn có thể tiến hành kiểm thử ngay trên giao diện Web POS tại địa chỉ `http://127.0.0.1:5000`:

1. **Kịch bản 1: Thanh toán thành công (Giao tác COMMIT)**
   - Tìm kiếm khách hàng theo SĐT.
   - Chọn sản phẩm: `Ba chỉ bò Mỹ CP` (số lượng 2kg) và `Sữa tươi TH True Milk` (số lượng 5 hộp).
   - Chọn phương thức thanh toán và nhập Số điểm cần dùng: `10` điểm.
   - Nhấn **Xác nhận thanh toán**.
   - **Kết quả**: Hệ thống báo thành công (COMMIT). Kiểm tra tab **Hàng hóa** và **Lô hàng** sẽ thấy bò ba chỉ và sữa TH bị trừ kho chính xác (lô hạn dùng gần nhất bị trừ trước). Điểm khách hàng cập nhật chính xác trong cơ sở dữ liệu.

2. **Kịch bản 2: Thiếu hàng trong kho (Giao tác ROLLBACK do lỗi Proc)**
   - Thêm sản phẩm `Ba chỉ bò Mỹ CP` với số lượng `50` kg vào giỏ hàng (trong khi tồn kho thực tế chỉ có 35kg).
   - Nhấn **Xác nhận thanh toán**.
   - **Kết quả**: Transaction Console báo lỗi không đủ hàng tồn kho. Hệ thống thực hiện lệnh `ROLLBACK`. Không có hóa đơn nào được tạo và tồn kho các mặt hàng khác trong giỏ hàng đều không bị thay đổi.

3. **Kịch bản 3: Sử dụng quá số điểm tích lũy hiện có (Giao tác ROLLBACK do lỗi Trigger)**
   - Tìm kiếm khách hàng.
   - Chọn mua `Mì ăn liền Hảo Hảo` (số lượng 2 gói).
   - Nhập Số điểm cần dùng: `50` điểm.
   - Nhấn **Xác nhận thanh toán**.
   - **Kết quả**: Trigger `trg_SauKhiLapHoaDon` phát hiện điểm bị âm, kích hoạt lỗi `RAISERROR` và thực hiện `ROLLBACK`. Kho hàng và điểm của khách hàng được giữ nguyên.

---

## 🐞 Demo Điều Khiển Tương Tranh (Concurrency Control)

Dự án cung cấp một trang chuyên dụng để giả lập và kiểm thử các lỗi tương tranh phổ biến trong hệ thống đa người dùng, tại địa chỉ: `http://127.0.0.1:5000/demo`. Bạn có thể tự do cấu hình chọn Sản phẩm (qua Dropdown) để test độc lập cho từng kịch bản:

1. **Mất cập nhật (Lost Update):** Hai thu ngân cùng thanh toán 1 sản phẩm. Khắc phục bằng khóa `UPDLOCK, HOLDLOCK` (Khóa 2PL) trên lô cũ nhất.
2. **Đọc rác (Dirty Read):** Quản lý đếm tổng tồn kho sản phẩm khi thu ngân đang tạm hoãn sửa 1 lô của sản phẩm đó chưa chốt. Khắc phục bằng mức cô lập `READ COMMITTED`.
3. **Không lặp lại (Non-repeatable Read):** Thu ngân đọc giá sản phẩm hai lần trong 1 giao dịch, quản lý chen ngang đổi giá. Khắc phục bằng mức cô lập `REPEATABLE READ`.
4. **Bóng ma (Phantom Read):** Quản lý đếm tổng hóa đơn, thu ngân chen ngang chèn hóa đơn rác. Khắc phục bằng mức cô lập `SERIALIZABLE`.

---

## 📡 API Documentation (Demo Endpoints)

Các API dưới đây được sử dụng riêng cho phần giả lập Tương tranh (`/api/demo/`):

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/demo/products` | `GET` | Lấy danh sách toàn bộ sản phẩm cùng Giá bán và Tổng số lượng tồn kho (để hiển thị lên các Dropdown). |
| `/api/demo/inventory/<masp>` | `GET` | Lấy tổng số lượng tồn kho hiện tại của một Sản phẩm cụ thể. |
| `/api/demo/lost_update` | `GET` | Thực thi bán 1 đơn vị của sản phẩm. Hỗ trợ tham số `?mode=fixed` (Khóa 2PL) và `?masp=...`. |
| `/api/demo/dirty_read/transaction` | `GET` | Bắt đầu giao dịch sửa tồn kho 1 lô thành 9999, treo 5 giây rồi Rollback. Hỗ trợ tham số `?masp=...`. |
| `/api/demo/dirty_read/read` | `GET` | Đọc tổng tồn kho sản phẩm. Hỗ trợ tham số `?mode=fixed` (READ COMMITTED) và `?masp=...`. |
| `/api/demo/non_repeatable_read/read` | `GET` | Đọc giá sản phẩm hai lần cách nhau 5 giây. Hỗ trợ tham số `?mode=fixed` (REPEATABLE READ) và `?masp=...`. |
| `/api/demo/non_repeatable_read/update` | `POST` | Tăng giá sản phẩm thêm 1000 VNĐ. Hỗ trợ tham số `?masp=...`. |
| `/api/demo/phantom_read/count` | `GET` | Đếm tổng số hóa đơn 2 lần cách nhau 5 giây. Hỗ trợ tham số `?mode=fixed` (SERIALIZABLE). |
| `/api/demo/phantom_read/insert` | `POST` | Chèn một hóa đơn rác với tổng tiền 50.000đ để giả lập Bóng ma. |
