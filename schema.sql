-- Table: [VOUCHER]
CREATE TABLE [VOUCHER] (
    [MaVoucher] varchar(20) NOT NULL,
    [TenVoucher] nvarchar(200) NOT NULL,
    [LoaiVoucher] varchar(20) NOT NULL,
    [GiaTri] decimal(18,2) NULL,
    [MaSPTang] varchar(15) NULL,
    [SoLuongTang] int NULL,
    [NgayBatDau] date NOT NULL,
    [NgayKetThuc] date NOT NULL
);
GO

-- Table: [HANG_TIEU_HUY]
CREATE TABLE [HANG_TIEU_HUY] (
    [MaTieuHuy] int identity NOT NULL,
    [MaSP] varchar(15) NOT NULL,
    [MaLo] int NOT NULL,
    [SoLuongHuy] decimal(10,2) NOT NULL,
    [NgayTieuHuy] datetime NULL,
    [MaNV] varchar(10) NOT NULL
);
GO

-- Table: [DANH_MUC]
CREATE TABLE [DANH_MUC] (
    [MaDanhMuc] varchar(10) NOT NULL,
    [TenDanhMuc] nvarchar(200) NOT NULL
);
GO

-- Table: [SAN_PHAM]
CREATE TABLE [SAN_PHAM] (
    [MaSP] varchar(15) NOT NULL,
    [TenSP] nvarchar(300) NOT NULL,
    [MaDanhMuc] varchar(10) NULL,
    [DonViTinh] nvarchar(40) NOT NULL,
    [GiaBan] decimal(18,2) NOT NULL,
    [LaHangTuoiSong] bit NULL
);
GO

-- Table: [NHA_CUNG_CAP]
CREATE TABLE [NHA_CUNG_CAP] (
    [MaNCC] varchar(10) NOT NULL,
    [TenNCC] nvarchar(300) NOT NULL,
    [SoDienThoai] varchar(15) NULL,
    [DiaChi] nvarchar(400) NULL
);
GO

-- Table: [LO_HANG]
CREATE TABLE [LO_HANG] (
    [MaLo] int identity NOT NULL,
    [MaSP] varchar(15) NULL,
    [NgaySanXuat] date NULL,
    [HanSuDung] date NOT NULL,
    [SoLuongTon] decimal(10,2) NOT NULL,
    [GiaNhap] decimal(18,2) NOT NULL
);
GO

-- Table: [NHAN_VIEN]
CREATE TABLE [NHAN_VIEN] (
    [MaNV] varchar(10) NOT NULL,
    [TenNV] nvarchar(200) NOT NULL,
    [ChucVu] nvarchar(100) NOT NULL,
    [SoDienThoai] varchar(15) NULL,
    [MatKhau] varchar(255) NOT NULL,
    [Role] int NULL
);
GO

-- Table: [KHACH_HANG]
CREATE TABLE [KHACH_HANG] (
    [MaKH] int identity NOT NULL,
    [SoDienThoai] varchar(15) NOT NULL,
    [TenKH] nvarchar(200) NOT NULL,
    [DiemTichLuy] int NULL,
    [NgayDangKy] datetime NULL
);
GO

-- Table: [KHUYEN_MAI]
CREATE TABLE [KHUYEN_MAI] (
    [MaKM] varchar(10) NOT NULL,
    [TenKM] nvarchar(200) NOT NULL,
    [PhanTramGiam] int NOT NULL,
    [NgayBatDau] datetime NOT NULL,
    [NgayKetThuc] datetime NOT NULL,
    [LoaiKM] varchar(20) NULL
);
GO

-- Table: [KM_SAN_PHAM]
CREATE TABLE [KM_SAN_PHAM] (
    [MaKM] varchar(10) NOT NULL,
    [MaSP] varchar(15) NOT NULL
);
GO

-- Table: [HOA_DON]
CREATE TABLE [HOA_DON] (
    [MaHD] varchar(20) NOT NULL,
    [NgayLap] datetime NULL,
    [MaNV] varchar(10) NULL,
    [MaKH] int NULL,
    [TongTienHang] decimal(18,2) NOT NULL,
    [GiamGiaKM] decimal(18,2) NULL,
    [DiemSuDung] int NULL,
    [ThanhTien] decimal(18,2) NOT NULL,
    [PhuongThucTT] nvarchar(60) NOT NULL,
    [MaNVSuaCuoi] varchar(10) NULL,
    [NgaySuaCuoi] datetime NULL,
    [GhiChu] nvarchar(1000) NULL,
    [MaVoucher] varchar(20) NULL,
    [GiamGiaVoucher] decimal(18,2) NULL
);
GO

-- Table: [CHI_TIET_HOA_DON]
CREATE TABLE [CHI_TIET_HOA_DON] (
    [MaHD] varchar(20) NOT NULL,
    [MaSP] varchar(15) NOT NULL,
    [MaLo] int NOT NULL,
    [SoLuong] decimal(10,2) NOT NULL,
    [DonGia] decimal(18,2) NOT NULL,
    [ThanhTien] decimal(18,2) NOT NULL,
    [SoTienGiam] decimal(18,2) NOT NULL
);
GO

-- Table: [PHIEU_NHAP]
CREATE TABLE [PHIEU_NHAP] (
    [MaPN] varchar(20) NOT NULL,
    [NgayNhap] datetime NULL,
    [MaNV] varchar(10) NULL,
    [MaNCC] varchar(10) NULL,
    [TongTien] decimal(18,2) NOT NULL,
    [MaNVSuaCuoi] varchar(10) NULL,
    [NgaySuaCuoi] datetime NULL,
    [GhiChu] nvarchar(1000) NULL
);
GO

-- Table: [CHI_TIET_PHIEU_NHAP]
CREATE TABLE [CHI_TIET_PHIEU_NHAP] (
    [MaPN] varchar(20) NOT NULL,
    [MaSP] varchar(15) NOT NULL,
    [SoLuong] decimal(10,2) NOT NULL,
    [GiaNhap] decimal(18,2) NOT NULL,
    [NgaySanXuat] date NULL,
    [HanSuDung] date NOT NULL
);
GO

-- Foreign Keys
ALTER TABLE [SAN_PHAM] ADD CONSTRAINT [FK__SAN_PHAM__MaDanh__398D8EEE] FOREIGN KEY ([MaDanhMuc]) REFERENCES [DANH_MUC] ([MaDanhMuc])
GO

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [FK__HANG_TIEU___MaSP__1CBC4616] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [LO_HANG] ADD CONSTRAINT [FK__LO_HANG__MaSP__403A8C7D] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [KM_SAN_PHAM] ADD CONSTRAINT [FK__KM_SAN_PHA__MaSP__5070F446] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [FK__CHI_TIET_H__MaSP__5EBF139D] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [CHI_TIET_PHIEU_NHAP] ADD CONSTRAINT [FK__CHI_TIET_P__MaSP__6B24EA82] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [FK__PHIEU_NHA__MaNCC__66603565] FOREIGN KEY ([MaNCC]) REFERENCES [NHA_CUNG_CAP] ([MaNCC])
GO

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [FK__HANG_TIEU___MaLo__1DB06A4F] FOREIGN KEY ([MaLo]) REFERENCES [LO_HANG] ([MaLo])
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [FK__CHI_TIET_H__MaLo__5FB337D6] FOREIGN KEY ([MaLo]) REFERENCES [LO_HANG] ([MaLo])
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [FK__HOA_DON__MaNVSua__02084FDA] FOREIGN KEY ([MaNVSuaCuoi]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [FK__PHIEU_NHA__MaNVS__02FC7413] FOREIGN KEY ([MaNVSuaCuoi]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [FK__HANG_TIEU___MaNV__1EA48E88] FOREIGN KEY ([MaNV]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [FK__HOA_DON__MaNV__5441852A] FOREIGN KEY ([MaNV]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [FK__PHIEU_NHAP__MaNV__656C112C] FOREIGN KEY ([MaNV]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [FK__HOA_DON__MaKH__5535A963] FOREIGN KEY ([MaKH]) REFERENCES [KHACH_HANG] ([MaKH])
GO

ALTER TABLE [KM_SAN_PHAM] ADD CONSTRAINT [FK__KM_SAN_PHA__MaKM__4F7CD00D] FOREIGN KEY ([MaKM]) REFERENCES [KHUYEN_MAI] ([MaKM])
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [FK__CHI_TIET_H__MaHD__5DCAEF64] FOREIGN KEY ([MaHD]) REFERENCES [HOA_DON] ([MaHD])
GO

ALTER TABLE [CHI_TIET_PHIEU_NHAP] ADD CONSTRAINT [FK__CHI_TIET_P__MaPN__6A30C649] FOREIGN KEY ([MaPN]) REFERENCES [PHIEU_NHAP] ([MaPN])
GO

-- Views
-- View: v_CanhBaoTonKho

        CREATE VIEW [dbo].[v_CanhBaoTonKho] AS
        SELECT 
            sp.MaSP,
            sp.TenSP,
            ISNULL(SUM(lh.SoLuongTon), 0) AS TongTonKho,
            CASE 
                WHEN ISNULL(SUM(lh.SoLuongTon), 0) = 0 THEN N'Hết hàng'
                ELSE N'Sắp hết (<= 10)'
            END AS TrangThai
        FROM SAN_PHAM sp
        LEFT JOIN LO_HANG lh ON sp.MaSP = lh.MaSP
        GROUP BY sp.MaSP, sp.TenSP
        HAVING ISNULL(SUM(lh.SoLuongTon), 0) <= 10;
        

GO

-- View: v_SanPhamSieuThi


--------------------------------------------------------------------------------
-- ĐỐI TƯỢNG 2: VIEWS (KHUNG NHÌN)
--------------------------------------------------------------------------------

-- View 1: Danh sách sản phẩm siêu thị và tổng tồn kho của các lô hàng còn hạn sử dụng
CREATE VIEW v_SanPhamSieuThi AS
SELECT 
    sp.MaSP,
    sp.TenSP,
    dm.TenDanhMuc,
    sp.DonViTinh,
    sp.GiaBan,
    dbo.fn_TinhTienSauKhuyenMai(sp.MaSP, sp.GiaBan) AS GiaKhuyenMai,
    ISNULL((
        SELECT SUM(lh.SoLuongTon)
        FROM LO_HANG lh
        WHERE lh.MaSP = sp.MaSP AND lh.HanSuDung > GETDATE()
    ), 0) AS TongTonKho,
    sp.LaHangTuoiSong
FROM SAN_PHAM sp
INNER JOIN DANH_MUC dm ON sp.MaDanhMuc = dm.MaDanhMuc;


GO

-- View: v_CanhBaoHanSD

-- View 2: Cảnh báo hạn sử dụng lô hàng
CREATE VIEW v_CanhBaoHanSD AS
SELECT 
    lh.MaLo,
    sp.MaSP,
    sp.TenSP,
    lh.NgaySanXuat,
    lh.HanSuDung,
    lh.SoLuongTon,
    lh.GiaNhap,
    DATEDIFF(day, GETDATE(), lh.HanSuDung) AS SoNgayConLai,
    CASE 
        WHEN lh.HanSuDung < GETDATE() THEN N'Đã hết hạn'
        WHEN DATEDIFF(day, GETDATE(), lh.HanSuDung) <= 7 THEN N'Sắp hết hạn (<= 7 ngày)'
        ELSE N'Bình thường'
    END AS TrangThai
FROM LO_HANG lh
INNER JOIN SAN_PHAM sp ON lh.MaSP = sp.MaSP
WHERE lh.SoLuongTon > 0;


GO

-- View: v_DoanhThuTheoNgay

-- View 3: Báo cáo doanh thu theo ngày
CREATE VIEW v_DoanhThuTheoNgay AS
SELECT 
    CAST(NgayLap AS DATE) AS Ngay,
    COUNT(MaHD) AS SoHoaDon,
    SUM(TongTienHang) AS TongTienHang,
    SUM(GiamGiaKM) AS TongGiamGiaKM,
    SUM(DiemSuDung) AS DiemSuDung,
    SUM(ThanhTien) AS DoanhThuThucTe
FROM HOA_DON
GROUP BY CAST(NgayLap AS DATE);


GO

-- Stored Procedures
-- Procedure: sp_SuaChiTietPhieuNhap

-- PROCEDURE Sá»¬A CHI TIáº¾T PHIáº¾U NHáº¬P
CREATE PROCEDURE sp_SuaChiTietPhieuNhap
    @MaPN VARCHAR(20),
    @MaSP VARCHAR(15),
    @SoLuongMoi DECIMAL(10,2),
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @SoLuongCu DECIMAL(10,2), @GiaNhap DECIMAL(18,2), @NgaySX DATE, @HanSD DATE;
        SELECT @SoLuongCu = SoLuong, @GiaNhap = GiaNhap, @NgaySX = NgaySanXuat, @HanSD = HanSuDung
        FROM CHI_TIET_PHIEU_NHAP 
        WHERE MaPN = @MaPN AND MaSP = @MaSP;
        
        IF @SoLuongCu IS NULL
        BEGIN
            RAISERROR(N'KhÃ´ng tÃ¬m tháº¥y chi tiáº¿t phiáº¿u nháº­p!', 16, 1);
        END
        
        DECLARE @ChenhLech DECIMAL(10,2) = @SoLuongMoi - @SoLuongCu;
        
        -- Cáº­p nháº­t chi tiáº¿t phiáº¿u nháº­p
        UPDATE CHI_TIET_PHIEU_NHAP SET SoLuong = @SoLuongMoi WHERE MaPN = @MaPN AND MaSP = @MaSP;
        
        -- Cáº­p nháº­t lÃ´ hÃ ng
        UPDATE LO_HANG SET SoLuongTon = SoLuongTon + @ChenhLech 
        WHERE MaSP = @MaSP AND NgaySanXuat = @NgaySX AND HanSuDung = @HanSD;
        
        -- Cáº­p nháº­t tá»•ng tiá»n phiáº¿u nháº­p
        UPDATE PHIEU_NHAP 
        SET TongTien = TongTien + (@ChenhLech * @GiaNhap),
            MaNVSuaCuoi = @MaNV,
            NgaySuaCuoi = GETDATE()
        WHERE MaPN = @MaPN;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;


GO

-- Procedure: sp_SuaChiTietHoaDon

CREATE   PROCEDURE sp_SuaChiTietHoaDon
    @MaHD VARCHAR(20),
    @MaSP VARCHAR(15),
    @MaLo INT,
    @SoLuongMoi DECIMAL(10,2),
    @MaNV VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @SoLuongCu DECIMAL(10,2), @DonGia DECIMAL(18,2), @SoTienGiam DECIMAL(18,2);
        SELECT @SoLuongCu = SoLuong, @DonGia = DonGia, @SoTienGiam = SoTienGiam
        FROM CHI_TIET_HOA_DON 
        WHERE MaHD = @MaHD AND MaSP = @MaSP AND MaLo = @MaLo;
        
        IF @SoLuongCu IS NULL
        BEGIN
            RAISERROR(N'Không tìm thấy chi tiết hóa đơn!', 16, 1);
        END
        
        DECLARE @ChenhLech DECIMAL(10,2) = @SoLuongMoi - @SoLuongCu;
        
        UPDATE LO_HANG SET SoLuongTon = SoLuongTon - @ChenhLech WHERE MaLo = @MaLo;
        
        -- Tính discount per unit and price per unit
        DECLARE @DiscountPerUnit DECIMAL(18,2) = @SoTienGiam / NULLIF(@SoLuongCu, 0);
        IF @DiscountPerUnit IS NULL SET @DiscountPerUnit = 0;
        DECLARE @FinalPricePerUnit DECIMAL(18,2) = @DonGia - @DiscountPerUnit;
        
        UPDATE CHI_TIET_HOA_DON 
        SET SoLuong = @SoLuongMoi, 
            SoTienGiam = @SoLuongMoi * @DiscountPerUnit,
            ThanhTien = @SoLuongMoi * @FinalPricePerUnit 
        WHERE MaHD = @MaHD AND MaSP = @MaSP AND MaLo = @MaLo;
        
        DECLARE @OldThanhTien DECIMAL(18,2), @MaKH INT;
        SELECT @OldThanhTien = ThanhTien, @MaKH = MaKH FROM HOA_DON WHERE MaHD = @MaHD;
        
        DECLARE @NewTongTienHang DECIMAL(18,2), @NewTotalDiscount DECIMAL(18,2);
        SELECT @NewTongTienHang = SUM(SoLuong * DonGia), @NewTotalDiscount = SUM(SoTienGiam)
        FROM CHI_TIET_HOA_DON WHERE MaHD = @MaHD;
        
        UPDATE HOA_DON 
        SET TongTienHang = @NewTongTienHang,
            ThanhTien = CASE WHEN (@NewTongTienHang - @NewTotalDiscount) < 0 THEN 0 ELSE (@NewTongTienHang - @NewTotalDiscount) END,
            MaNVSuaCuoi = @MaNV,
            NgaySuaCuoi = GETDATE()
        WHERE MaHD = @MaHD;
        
        DECLARE @NewThanhTien DECIMAL(18,2);
        SELECT @NewThanhTien = ThanhTien FROM HOA_DON WHERE MaHD = @MaHD;
        
        IF @MaKH IS NOT NULL
        BEGIN
            DECLARE @OldPoints INT = FLOOR(@OldThanhTien / 1000.0);
            DECLARE @NewPoints INT = FLOOR(@NewThanhTien / 1000.0);
            DECLARE @PointDiff INT = @NewPoints - @OldPoints;
            
            UPDATE KHACH_HANG SET DiemTichLuy = DiemTichLuy + @PointDiff WHERE MaKH = @MaKH;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg2 NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg2, 16, 1);
    END CATCH
END;


GO

-- Procedure: sp_BanHangFIFO

        CREATE PROCEDURE [dbo].[sp_BanHangFIFO]
            @MaHD VARCHAR(20),
            @MaSP VARCHAR(15),
            @SoLuongYeuCau DECIMAL(10,2),
            @DonGiaGoc DECIMAL(18,2),
            @SoTienGiam DECIMAL(18,2),
            @ThanhTien DECIMAL(18,2)
        AS
        BEGIN
            SET NOCOUNT ON;
            
            DECLARE @SoLuongConLai DECIMAL(10,2) = @SoLuongYeuCau;
            DECLARE @MaLo INT, @SoLuongTonLo DECIMAL(10,2);
            
            DECLARE @ConLaiTienGiam DECIMAL(18,2) = @SoTienGiam;
            DECLARE @ConLaiThanhTien DECIMAL(18,2) = @ThanhTien;
            
            DECLARE BatchCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT MaLo, SoLuongTon
            FROM LO_HANG
            WHERE MaSP = @MaSP AND HanSuDung > GETDATE() AND SoLuongTon > 0
            ORDER BY HanSuDung ASC;
            
            OPEN BatchCursor;
            FETCH NEXT FROM BatchCursor INTO @MaLo, @SoLuongTonLo;
            
            WHILE @@FETCH_STATUS = 0 AND @SoLuongConLai > 0
            BEGIN
                IF @SoLuongTonLo >= @SoLuongConLai
                BEGIN
                    UPDATE LO_HANG SET SoLuongTon = SoLuongTon - @SoLuongConLai WHERE MaLo = @MaLo;
                    
                    INSERT INTO CHI_TIET_HOA_DON (MaHD, MaSP, MaLo, SoLuong, DonGia, SoTienGiam, ThanhTien)
                    VALUES (@MaHD, @MaSP, @MaLo, @SoLuongConLai, @DonGiaGoc, 
                            @ConLaiTienGiam, @ConLaiThanhTien);
                    
                    SET @SoLuongConLai = 0;
                END
                ELSE
                BEGIN
                    UPDATE LO_HANG SET SoLuongTon = 0 WHERE MaLo = @MaLo;
                    
                    DECLARE @TienGiamLo DECIMAL(18,2) = (@SoTienGiam / @SoLuongYeuCau) * @SoLuongTonLo;
                    DECLARE @ThanhTienLo DECIMAL(18,2) = (@ThanhTien / @SoLuongYeuCau) * @SoLuongTonLo;
                    
                    INSERT INTO CHI_TIET_HOA_DON (MaHD, MaSP, MaLo, SoLuong, DonGia, SoTienGiam, ThanhTien)
                    VALUES (@MaHD, @MaSP, @MaLo, @SoLuongTonLo, @DonGiaGoc, 
                            @TienGiamLo, @ThanhTienLo);
                    
                    SET @ConLaiTienGiam = @ConLaiTienGiam - @TienGiamLo;
                    SET @ConLaiThanhTien = @ConLaiThanhTien - @ThanhTienLo;
                    SET @SoLuongConLai = @SoLuongConLai - @SoLuongTonLo;
                END
                
                FETCH NEXT FROM BatchCursor INTO @MaLo, @SoLuongTonLo;
            END
            
            CLOSE BatchCursor;
            DEALLOCATE BatchCursor;
            
            IF @SoLuongConLai > 0
            BEGIN
                DECLARE @TenSP NVARCHAR(150);
                SELECT @TenSP = TenSP FROM SAN_PHAM WHERE MaSP = @MaSP;
                DECLARE @ErrMsg NVARCHAR(255) = N'Lỗi: Sản phẩm "' + ISNULL(@TenSP, @MaSP) + N'" không đủ hàng tồn kho!';
                RAISERROR (@ErrMsg, 16, 1);
            END
        END;
        

GO

-- Procedure: sp_NhapKho
CREATE PROCEDURE sp_NhapKho
    @MaPN VARCHAR(20),
    @MaNV VARCHAR(10),
    @MaNCC VARCHAR(10),
    @MaSP VARCHAR(15),
    @SoLuong DECIMAL(10,2),
    @GiaNhap DECIMAL(18,2),
    @NgaySanXuat DATE,
    @HanSuDung DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @TongTien DECIMAL(18,2) = @SoLuong * @GiaNhap;
        
        -- 1. Tạo phiếu nhập nếu chưa tồn tại
        IF NOT EXISTS (SELECT 1 FROM PHIEU_NHAP WHERE MaPN = @MaPN)
        BEGIN
            INSERT INTO PHIEU_NHAP (MaPN, NgayNhap, MaNV, MaNCC, TongTien)
            VALUES (@MaPN, GETDATE(), @MaNV, @MaNCC, @TongTien);
        END
        ELSE
        BEGIN
            UPDATE PHIEU_NHAP
            SET TongTien = TongTien + @TongTien
            WHERE MaPN = @MaPN;
        END
        
        -- 2. Thêm vào chi tiết phiếu nhập
        INSERT INTO CHI_TIET_PHIEU_NHAP (MaPN, MaSP, SoLuong, GiaNhap, NgaySanXuat, HanSuDung)
        VALUES (@MaPN, @MaSP, @SoLuong, @GiaNhap, @NgaySanXuat, @HanSuDung);
        
        -- 3. Cập nhật lô hàng hoặc tạo lô mới
        IF EXISTS (SELECT 1 FROM LO_HANG WHERE MaSP = @MaSP AND NgaySanXuat = @NgaySanXuat AND HanSuDung = @HanSuDung)
        BEGIN
            UPDATE LO_HANG 
            SET SoLuongTon = SoLuongTon + @SoLuong,
                GiaNhap = @GiaNhap -- Cập nhật giá nhập mới nhất
            WHERE MaSP = @MaSP AND NgaySanXuat = @NgaySanXuat AND HanSuDung = @HanSuDung;
        END
        ELSE
        BEGIN
            INSERT INTO LO_HANG (MaSP, NgaySanXuat, HanSuDung, SoLuongTon, GiaNhap)
            VALUES (@MaSP, @NgaySanXuat, @HanSuDung, @SoLuong, @GiaNhap);
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;


GO

-- Triggers
-- Trigger: trg_SauKhiLapHoaDon


--------------------------------------------------------------------------------
-- ĐỐI TƯỢNG 3: TRIGGERS (BỘ KÍCH HOẠT)
--------------------------------------------------------------------------------

-- Trigger 1: Tự động cập nhật điểm tích lũy của khách hàng sau khi lập hóa đơn
CREATE TRIGGER trg_SauKhiLapHoaDon
ON HOA_DON
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaKH INT, @DiemSuDung INT, @ThanhTien DECIMAL(18,2), @DiemMoi INT;
    
    SELECT @MaKH = MaKH, @DiemSuDung = DiemSuDung, @ThanhTien = ThanhTien FROM inserted;
    
    IF @MaKH IS NOT NULL
    BEGIN
        -- Tính số điểm được tích lũy mới
        SET @DiemMoi = dbo.fn_TinhDiemTichLuy(@ThanhTien);
        
        -- Cập nhật vào bảng KHACH_HANG
        UPDATE KHACH_HANG
        SET DiemTichLuy = DiemTichLuy - @DiemSuDung + @DiemMoi
        WHERE MaKH = @MaKH;
        
        -- Kiểm tra nếu điểm tích lũy bị âm thì rollback
        IF EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKH = @MaKH AND DiemTichLuy < 0)
        BEGIN
            RAISERROR (N'Lỗi: Điểm sử dụng vượt quá số điểm tích lũy hiện có của khách hàng!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
    END
END;


GO

-- Trigger: trg_KiemTraHSDKhiBan

-- Trigger 2: Kiểm tra hạn sử dụng của lô hàng khi lưu chi tiết hóa đơn
CREATE TRIGGER trg_KiemTraHSDKhiBan
ON CHI_TIET_HOA_DON
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN LO_HANG lh ON i.MaLo = lh.MaLo
        WHERE lh.HanSuDung < GETDATE()
    )
    BEGIN
        RAISERROR (N'Lỗi: Không thể bán sản phẩm thuộc lô hàng đã hết hạn sử dụng!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;


GO
