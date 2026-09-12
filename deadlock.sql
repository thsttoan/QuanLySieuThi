/*
==========================================================
DEMO DEADLOCK - QUẢN LÝ SIÊU THỊ
==========================================================

Mục đích:
- Mô phỏng tình huống Deadlock trong hệ thống quản lý siêu thị.
- Hai giao tác cùng cập nhật tồn kho nhưng khóa dữ liệu
  theo thứ tự khác nhau.
- Tạo ra chu trình chờ giữa hai giao tác.

Tình huống:
- Transaction T1 khóa lô hàng 11 trước, sau đó yêu cầu lô 12.
- Transaction T2 khóa lô hàng 12 trước, sau đó yêu cầu lô 11.
- T1 và T2 chờ lẫn nhau.
- SQL Server phát hiện Deadlock và rollback một giao tác.

Lưu ý:
- Phải chạy T1 và T2 ở hai cửa sổ Query khác nhau.
- Hai cửa sổ phải kết nối đến cùng một Database.
==========================================================
*/


/*
==========================================================
TRANSACTION T1
Thu ngân 1:
- Cập nhật lô hàng 11 trước.
- Sau đó yêu cầu lô hàng 12.
==========================================================
*/

BEGIN TRANSACTION;

-- T1 khóa lô hàng 11
UPDATE LO_HANG
SET SoLuongTon = SoLuongTon - 1
WHERE MaLo = 11;

-- Chờ để T2 có thời gian khóa lô hàng 12
WAITFOR DELAY '00:00:05';

-- T1 tiếp tục yêu cầu lô hàng 12
UPDATE LO_HANG
SET SoLuongTon = SoLuongTon - 1
WHERE MaLo = 12;

COMMIT TRANSACTION;


/*
==========================================================
TRANSACTION T2
Thu ngân 2:
- Cập nhật lô hàng 12 trước.
- Sau đó yêu cầu lô hàng 11.
==========================================================
*/

BEGIN TRANSACTION;

-- T2 khóa lô hàng 12
UPDATE LO_HANG
SET SoLuongTon = SoLuongTon - 1
WHERE MaLo = 12;

-- Chờ để T1 có thời gian khóa lô hàng 11
WAITFOR DELAY '00:00:05';

-- T2 tiếp tục yêu cầu lô hàng 11
UPDATE LO_HANG
SET SoLuongTon = SoLuongTon - 1
WHERE MaLo = 11;

COMMIT TRANSACTION;
