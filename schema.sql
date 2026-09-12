-- ============================================================================
-- CẤU TRÚC BẢNG DỮ LIỆU (TABLES)
-- ============================================================================

-- Table: [VOUCHER]
CREATE TABLE [VOUCHER] (
    [MaVoucher] varchar(20) NOT NULL,
    [TenVoucher] nvarchar(100) NOT NULL,
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
    [NgayTieuHuy] datetime NULL DEFAULT (getdate()),
    [MaNV] varchar(10) NOT NULL
);
GO

-- Table: [DANH_MUC]
CREATE TABLE [DANH_MUC] (
    [MaDanhMuc] varchar(10) NOT NULL,
    [TenDanhMuc] nvarchar(100) NOT NULL
);
GO

-- Table: [SAN_PHAM]
CREATE TABLE [SAN_PHAM] (
    [MaSP] varchar(15) NOT NULL,
    [TenSP] nvarchar(150) NOT NULL,
    [MaDanhMuc] varchar(10) NULL,
    [DonViTinh] nvarchar(20) NOT NULL,
    [GiaBan] decimal(18,2) NOT NULL,
    [LaHangTuoiSong] bit NULL DEFAULT ((0)),
    [MaNVSuaCuoi] varchar(10) NULL,
    [NgaySuaCuoi] datetime NULL
);
GO

-- Table: [NHA_CUNG_CAP]
CREATE TABLE [NHA_CUNG_CAP] (
    [MaNCC] varchar(10) NOT NULL,
    [TenNCC] nvarchar(150) NOT NULL,
    [SoDienThoai] varchar(15) NULL,
    [DiaChi] nvarchar(200) NULL
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

-- Table: [KHUYEN_MAI]
CREATE TABLE [KHUYEN_MAI] (
    [MaKM] varchar(10) NOT NULL,
    [TenKM] nvarchar(100) NOT NULL,
    [PhanTramGiam] int NOT NULL,
    [NgayBatDau] datetime NOT NULL,
    [NgayKetThuc] datetime NOT NULL,
    [LoaiKM] varchar(20) NULL DEFAULT ('SanPham')
);
GO

-- Table: [KM_SAN_PHAM]
CREATE TABLE [KM_SAN_PHAM] (
    [MaKM] varchar(10) NOT NULL,
    [MaSP] varchar(15) NOT NULL
);
GO

-- Table: [KHACH_HANG]
CREATE TABLE [KHACH_HANG] (
    [MaKH] int identity NOT NULL,
    [SoDienThoai] varchar(15) NOT NULL,
    [TenKH] nvarchar(100) NOT NULL,
    [DiemTichLuy] int NULL DEFAULT ((0)),
    [NgayDangKy] datetime NULL DEFAULT (getdate()),
    [HangThanhVien] nvarchar(20) NULL DEFAULT (N'Đồng')
);
GO

-- Table: [NHAN_VIEN]
CREATE TABLE [NHAN_VIEN] (
    [MaNV] varchar(10) NOT NULL,
    [TenNV] nvarchar(100) NOT NULL,
    [ChucVu] nvarchar(50) NOT NULL,
    [SoDienThoai] varchar(15) NULL,
    [MatKhau] varchar(255) NOT NULL,
    [Role] int NULL DEFAULT ((1))
);
GO

-- Table: [HOA_DON]
CREATE TABLE [HOA_DON] (
    [MaHD] varchar(20) NOT NULL,
    [NgayLap] datetime NULL DEFAULT (getdate()),
    [MaNV] varchar(10) NULL,
    [MaKH] int NULL,
    [TongTienHang] decimal(18,2) NOT NULL,
    [GiamGiaKM] decimal(18,2) NULL DEFAULT ((0)),
    [DiemSuDung] int NULL DEFAULT ((0)),
    [ThanhTien] decimal(18,2) NOT NULL,
    [PhuongThucTT] nvarchar(30) NOT NULL,
    [MaNVSuaCuoi] varchar(10) NULL,
    [NgaySuaCuoi] datetime NULL,
    [GhiChu] nvarchar(500) NULL,
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
    [SoTienGiam] decimal(18,2) NOT NULL DEFAULT ((0))
);
GO

-- Table: [PHIEU_NHAP]
CREATE TABLE [PHIEU_NHAP] (
    [MaPN] varchar(20) NOT NULL,
    [NgayNhap] datetime NULL DEFAULT (getdate()),
    [MaNV] varchar(10) NULL,
    [MaNCC] varchar(10) NULL,
    [TongTien] decimal(18,2) NOT NULL,
    [MaNVSuaCuoi] varchar(10) NULL,
    [NgaySuaCuoi] datetime NULL,
    [GhiChu] nvarchar(500) NULL
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

-- Table: [BANG_LOG_GIA]
CREATE TABLE [BANG_LOG_GIA] (
    [MaLog] int identity NOT NULL,
    [MaSP] varchar(15) NOT NULL,
    [GiaCu] decimal(18,2) NULL,
    [GiaMoi] decimal(18,2) NULL,
    [NgayThayDoi] datetime NULL DEFAULT (getdate()),
    [NguoiThayDoi] nvarchar(50) NULL DEFAULT (N'Hệ Thống')
);
GO

-- ============================================================================
-- KHÓA CHÍNH (PRIMARY KEYS)
-- ============================================================================

ALTER TABLE [VOUCHER] ADD CONSTRAINT [PK__VOUCHER__0AAC5B11C6DA498C] PRIMARY KEY CLUSTERED ([MaVoucher] ASC)
GO

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [PK__HANG_TIE__B9ECFC7EDBA9D83D] PRIMARY KEY CLUSTERED ([MaTieuHuy] ASC)
GO

ALTER TABLE [DANH_MUC] ADD CONSTRAINT [PK__DANH_MUC__B375088772A4C04E] PRIMARY KEY CLUSTERED ([MaDanhMuc] ASC)
GO

ALTER TABLE [SAN_PHAM] ADD CONSTRAINT [PK__SAN_PHAM__2725081C85321AEB] PRIMARY KEY CLUSTERED ([MaSP] ASC)
GO

ALTER TABLE [NHA_CUNG_CAP] ADD CONSTRAINT [PK__NHA_CUNG__3A185DEBD81ED734] PRIMARY KEY CLUSTERED ([MaNCC] ASC)
GO

ALTER TABLE [LO_HANG] ADD CONSTRAINT [PK__LO_HANG__2725C756D40BAE3B] PRIMARY KEY CLUSTERED ([MaLo] ASC)
GO

ALTER TABLE [KHUYEN_MAI] ADD CONSTRAINT [PK__KHUYEN_M__2725CF155A2BC1B0] PRIMARY KEY CLUSTERED ([MaKM] ASC)
GO

ALTER TABLE [KM_SAN_PHAM] ADD CONSTRAINT [PK__KM_SAN_P__F5579F94CE40A2AD] PRIMARY KEY CLUSTERED ([MaKM] ASC, [MaSP] ASC)
GO

ALTER TABLE [KHACH_HANG] ADD CONSTRAINT [PK__KHACH_HA__2725CF1E0E190C50] PRIMARY KEY CLUSTERED ([MaKH] ASC)
GO

ALTER TABLE [NHAN_VIEN] ADD CONSTRAINT [PK__NHAN_VIE__2725D70A52110DF2] PRIMARY KEY CLUSTERED ([MaNV] ASC)
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [PK__HOA_DON__2725A6E0DFA8C7C7] PRIMARY KEY CLUSTERED ([MaHD] ASC)
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [PK__CHI_TIET__A270D3A606AB8A9B] PRIMARY KEY CLUSTERED ([MaHD] ASC, [MaSP] ASC, [MaLo] ASC)
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [PK__PHIEU_NH__2725E7F05C16F1CB] PRIMARY KEY CLUSTERED ([MaPN] ASC)
GO

ALTER TABLE [CHI_TIET_PHIEU_NHAP] ADD CONSTRAINT [PK__CHI_TIET__F557B771C12C90BA] PRIMARY KEY CLUSTERED ([MaPN] ASC, [MaSP] ASC)
GO

ALTER TABLE [BANG_LOG_GIA] ADD CONSTRAINT [PK__BANG_LOG__3B98D24AA58C77B3] PRIMARY KEY CLUSTERED ([MaLog] ASC)
GO

-- ============================================================================
-- KHÓA NGOẠI (FOREIGN KEYS)
-- ============================================================================

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [FK__HANG_TIEU___MaSP__1CBC4616] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [FK__HANG_TIEU___MaLo__1DB06A4F] FOREIGN KEY ([MaLo]) REFERENCES [LO_HANG] ([MaLo])
GO

ALTER TABLE [HANG_TIEU_HUY] ADD CONSTRAINT [FK__HANG_TIEU___MaNV__1EA48E88] FOREIGN KEY ([MaNV]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [SAN_PHAM] ADD CONSTRAINT [FK__SAN_PHAM__MaDanh__398D8EEE] FOREIGN KEY ([MaDanhMuc]) REFERENCES [DANH_MUC] ([MaDanhMuc])
GO

ALTER TABLE [LO_HANG] ADD CONSTRAINT [FK__LO_HANG__MaSP__403A8C7D] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [KM_SAN_PHAM] ADD CONSTRAINT [FK__KM_SAN_PHA__MaSP__5070F446] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [KM_SAN_PHAM] ADD CONSTRAINT [FK__KM_SAN_PHA__MaKM__4F7CD00D] FOREIGN KEY ([MaKM]) REFERENCES [KHUYEN_MAI] ([MaKM])
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [FK__HOA_DON__MaNVSua__02084FDA] FOREIGN KEY ([MaNVSuaCuoi]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [FK__HOA_DON__MaNV__5441852A] FOREIGN KEY ([MaNV]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [HOA_DON] ADD CONSTRAINT [FK__HOA_DON__MaKH__5535A963] FOREIGN KEY ([MaKH]) REFERENCES [KHACH_HANG] ([MaKH])
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [FK__CHI_TIET_H__MaSP__5EBF139D] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [FK__CHI_TIET_H__MaLo__5FB337D6] FOREIGN KEY ([MaLo]) REFERENCES [LO_HANG] ([MaLo])
GO

ALTER TABLE [CHI_TIET_HOA_DON] ADD CONSTRAINT [FK__CHI_TIET_H__MaHD__5DCAEF64] FOREIGN KEY ([MaHD]) REFERENCES [HOA_DON] ([MaHD])
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [FK__PHIEU_NHA__MaNCC__66603565] FOREIGN KEY ([MaNCC]) REFERENCES [NHA_CUNG_CAP] ([MaNCC])
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [FK__PHIEU_NHA__MaNVS__02FC7413] FOREIGN KEY ([MaNVSuaCuoi]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [PHIEU_NHAP] ADD CONSTRAINT [FK__PHIEU_NHAP__MaNV__656C112C] FOREIGN KEY ([MaNV]) REFERENCES [NHAN_VIEN] ([MaNV])
GO

ALTER TABLE [CHI_TIET_PHIEU_NHAP] ADD CONSTRAINT [FK__CHI_TIET_P__MaSP__6B24EA82] FOREIGN KEY ([MaSP]) REFERENCES [SAN_PHAM] ([MaSP])
GO

ALTER TABLE [CHI_TIET_PHIEU_NHAP] ADD CONSTRAINT [FK__CHI_TIET_P__MaPN__6A30C649] FOREIGN KEY ([MaPN]) REFERENCES [PHIEU_NHAP] ([MaPN])
GO

-- ============================================================================
-- HÀM DO NGƯỜI DÙNG ĐỊNH NGHĨA (FUNCTIONS)
-- ============================================================================

-- Function: fn_BaoCaoDoanhThuTheoKhoangNgay
-- 5. HÀM UDF BÁO CÁO DOANH THU THEO KHOẢNG NGÀY (INLINE TABLE-VALUED FUNCTION)
CREATE   FUNCTION dbo.fn_BaoCaoDoanhThuTheoKhoangNgay (
    @TuNgay DATE,
    @DenNgay DATE
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        CAST(hd.NgayLap AS DATE) AS Ngay,
        COUNT(DISTINCT hd.MaHD) AS SoHoaDon,
        ISNULL(SUM(hd.TongTienHang), 0) AS TongTienHang,
        ISNULL(SUM(hd.GiamGiaKM + hd.GiamGiaVoucher), 0) AS TongGiamGia,
        ISNULL(SUM(hd.DiemSuDung), 0) AS TongDiemSuDung,
        ISNULL(SUM(hd.ThanhTien), 0) AS DoanhThuThucTe
    FROM HOA_DON hd
    WHERE CAST(hd.NgayLap AS DATE) BETWEEN @TuNgay AND @DenNgay
    GROUP BY CAST(hd.NgayLap AS DATE)
);
GO

-- Function: fn_KiemTraDieuKienVoucher
-- 4. HÀM UDF: KIỂM TRA ĐIỀU KIỆN VOUCHER (SCALAR FUNCTION)
CREATE   FUNCTION dbo.fn_KiemTraDieuKienVoucher (
    @MaVoucher VARCHAR(20),
    @TongTien DECIMAL(18,2)
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @GiamGia DECIMAL(18,2) = 0;
    DECLARE @LoaiVoucher VARCHAR(20), @GiaTri DECIMAL(18,2);
    
    SELECT @LoaiVoucher = LoaiVoucher, @GiaTri = GiaTri
    FROM VOUCHER
    WHERE MaVoucher = @MaVoucher
      AND CAST(GETDATE() AS DATE) BETWEEN NgayBatDau AND NgayKetThuc;
      
    IF @LoaiVoucher = 'GiamGia'
    BEGIN
        SET @GiamGia = @TongTien * (ISNULL(@GiaTri, 0) / 100.0);
    END
    
    RETURN @GiamGia;
END;
GO

-- Function: fn_SinhMaHoaDon
CREATE   FUNCTION dbo.fn_SinhMaHoaDon()
    RETURNS VARCHAR(20)
    AS
    BEGIN
        DECLARE @Prefix VARCHAR(16) = 'HD' + CONVERT(VARCHAR(8), GETDATE(), 112) + 
                                      REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
        DECLARE @Count INT = 0;
        SELECT @Count = COUNT(*) FROM HOA_DON WHERE MaHD LIKE @Prefix + '%';
        RETURN @Prefix + RIGHT('000' + CAST((@Count + 1) AS VARCHAR(3)), 3);
    END;
GO

-- Function: fn_SinhMaPhieuNhap
CREATE   FUNCTION dbo.fn_SinhMaPhieuNhap()
    RETURNS VARCHAR(20)
    AS
    BEGIN
        DECLARE @Base VARCHAR(16) = 'PN' + CONVERT(VARCHAR(8), GETDATE(), 112) + 
                                    REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
        IF NOT EXISTS (SELECT 1 FROM PHIEU_NHAP WHERE MaPN = @Base)
            RETURN @Base;
            
        DECLARE @Count INT = 0;
        SELECT @Count = COUNT(*) FROM PHIEU_NHAP WHERE MaPN LIKE @Base + '%';
        RETURN @Base + '_' + CAST((@Count + 1) AS VARCHAR(3));
    END;
GO

-- Function: fn_TinhDiemTichLuy
-- 2. Cáº­p nháº­t hÃ m tÃ­nh Ä‘iá»ƒm tÃ­ch lÅ©y (1000Ä‘ = 1 Ä‘iá»ƒm)
CREATE FUNCTION fn_TinhDiemTichLuy (
    @ThanhTien DECIMAL(18,2)
)
RETURNS INT
AS
BEGIN
    RETURN FLOOR(@ThanhTien / 1000.0);
END;
GO

-- Function: fn_TinhTienSauKhuyenMai
--------------------------------------------------------------------------------
-- ĐỐI TƯỢNG 1: FUNCTIONS (HÀM)
--------------------------------------------------------------------------------

-- Hàm 1: Tính giá trị sản phẩm sau khuyến mãi
CREATE FUNCTION fn_TinhTienSauKhuyenMai (
    @MaSP VARCHAR(15),
    @DonGia DECIMAL(18,2)
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @PhanTramGiam INT = 0;
    
    -- Lấy % giảm giá lớn nhất của sản phẩm đang còn hiệu lực
    SELECT TOP 1 @PhanTramGiam = km.PhanTramGiam
    FROM KHUYEN_MAI km
    INNER JOIN KM_SAN_PHAM ksp ON km.MaKM = ksp.MaKM
    WHERE ksp.MaSP = @MaSP 
      AND GETDATE() BETWEEN km.NgayBatDau AND km.NgayKetThuc
    ORDER BY km.PhanTramGiam DESC;
    
    RETURN @DonGia * (1 - ISNULL(@PhanTramGiam, 0) / 100.0);
END;
GO

-- Function: fn_XepHangKhachHang
-- 3. HÀM UDF: XẾP HẠNG THÀNH VIÊN TÍCH LŨY (SCALAR FUNCTION)
CREATE   FUNCTION dbo.fn_XepHangKhachHang (@MaKH INT)
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @TongChiTieu DECIMAL(18,2) = 0;
    SELECT @TongChiTieu = ISNULL(SUM(ThanhTien), 0)
    FROM HOA_DON
    WHERE MaKH = @MaKH;
    
    RETURN CASE 
        WHEN @TongChiTieu >= 10000000 THEN N'Kim Cương'
        WHEN @TongChiTieu >= 5000000 THEN N'Vàng'
        WHEN @TongChiTieu >= 2000000 THEN N'Bạc'
        ELSE N'Đồng'
    END;
END;
GO

-- ============================================================================
-- KHUNG NHÌN (VIEWS)
-- ============================================================================

-- View: v_BaoCaoHieuSuatNhanVien
-- 7. KHUNG NHÌN: BÁO CÁO HIỆU SUẤT NHÂN VIÊN (VIEW)
CREATE   VIEW dbo.v_BaoCaoHieuSuatNhanVien AS
SELECT 
    nv.MaNV,
    nv.TenNV,
    nv.ChucVu,
    COUNT(hd.MaHD) AS SoHoaDonDaLap,
    ISNULL(SUM(hd.ThanhTien), 0) AS TongDoanhThuBanDuoc
FROM NHAN_VIEN nv
LEFT JOIN HOA_DON hd ON nv.MaNV = hd.MaNV
GROUP BY nv.MaNV, nv.TenNV, nv.ChucVu;
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

-- View: v_DoanhThuTheoDanhMuc
CREATE   VIEW dbo.v_DoanhThuTheoDanhMuc AS
    SELECT 
        c.MaDanhMuc,
        c.TenDanhMuc, 
        ISNULL(SUM(ct.ThanhTien), 0) AS DoanhThu
    FROM DANH_MUC c
    LEFT JOIN SAN_PHAM s ON s.MaDanhMuc = c.MaDanhMuc
    LEFT JOIN CHI_TIET_HOA_DON ct ON ct.MaSP = s.MaSP
    GROUP BY c.MaDanhMuc, c.TenDanhMuc;
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

-- View: v_SanPhamSieuThi
CREATE   VIEW v_SanPhamSieuThi AS
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
        sp.LaHangTuoiSong
    FROM SAN_PHAM sp
    INNER JOIN DANH_MUC dm ON sp.MaDanhMuc = dm.MaDanhMuc;
GO

-- View: v_TopSanPhamBanChay
-- 6. KHUNG NHÌN: TOP SẢN PHẨM BÁN CHẠY (VIEW)
CREATE   VIEW dbo.v_TopSanPhamBanChay AS
SELECT TOP 10
    sp.MaSP,
    sp.TenSP,
    dm.TenDanhMuc,
    sp.DonViTinh,
    ISNULL(SUM(ct.SoLuong), 0) AS TongSoLuongBan,
    ISNULL(SUM(ct.ThanhTien), 0) AS TongDoanhThu
FROM SAN_PHAM sp
LEFT JOIN CHI_TIET_HOA_DON ct ON sp.MaSP = ct.MaSP
LEFT JOIN DANH_MUC dm ON sp.MaDanhMuc = dm.MaDanhMuc
GROUP BY sp.MaSP, sp.TenSP, dm.TenDanhMuc, sp.DonViTinh
ORDER BY TongSoLuongBan DESC;
GO

-- ============================================================================
-- THỦ TỤC LƯU TRỮ (STORED PROCEDURES)
-- ============================================================================

-- Procedure: sp_BanHangFIFO
-- 11. CẬP NHẬT THỦ TỤC sp_BanHangFIFO CÓ KHÓA HÀNG CONCURRENCY (UPDLOCK, ROWLOCK)
CREATE   PROCEDURE dbo.sp_BanHangFIFO
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
    
    -- Gợi ý khóa UPDLOCK, ROWLOCK để tránh hiện tượng Lost Update khi nhiều thu ngân cùng bán
    DECLARE BatchCursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT MaLo, SoLuongTon
    FROM LO_HANG WITH (UPDLOCK, ROWLOCK)
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

-- Procedure: sp_Demo_Deadlock
CREATE   PROCEDURE sp_Demo_Deadlock
    @Mode VARCHAR(10) = 'error', -- 'error' (Gây lỗi), 'fixed' (Sắp xếp thứ tự), 'timeout' (Giới hạn chờ)
    @Tx VARCHAR(10) = '1',       -- '1': Nhân viên kho 1, '2': Nhân viên kho 2
    @MaLo1 INT = 11,             -- Lô hàng 11
    @MaLo2 INT = 12              -- Lô hàng 12
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;

    -- Cấu hình Timeout nếu chọn chế độ timeout
    IF @Mode = 'timeout'
        SET LOCK_TIMEOUT 3000; -- Timeout 3 giây (Ném lỗi 1222)
    ELSE
        SET LOCK_TIMEOUT -1;   -- Chờ mặc định của hệ thống

    BEGIN TRANSACTION;

    DECLARE @FirstLo INT, @SecondLo INT;
    DECLARE @LogMsg NVARCHAR(MAX);

    IF @Mode = 'fixed'
    BEGIN
        -- GIAO THỨC SẮP XẾP THỨ TỰ CÁC ĐƠN VỊ DỮ LIỆU (Ordering Protocol)
        -- Chuẩn hóa: Luôn xin khóa Lô hàng có mã nhỏ hơn trước, mã lớn hơn sau
        IF @MaLo1 < @MaLo2
        BEGIN
            SET @FirstLo = @MaLo1; SET @SecondLo = @MaLo2;
        END
        ELSE
        BEGIN
            SET @FirstLo = @MaLo2; SET @SecondLo = @MaLo1;
        END
    END
    ELSE
    BEGIN
        -- KỊCH BẢN GÂY DEADLOCK: 
        -- Nhân viên kho 1 (Tx 1): Khóa Lô 1 -> đòi Lô 2
        -- Nhân viên kho 2 (Tx 2): Khóa Lô 2 -> đòi Lô 1
        -- Tạo chu trình chờ khép kín trong Đồ thị chờ (Waiting Graph): T1 <-> T2
        IF @Tx = '1'
        BEGIN
            SET @FirstLo = @MaLo1; SET @SecondLo = @MaLo2;
        END
        ELSE
        BEGIN
            SET @FirstLo = @MaLo2; SET @SecondLo = @MaLo1;
        END
    END

    BEGIN TRY
        -- Bước 1: Nhân viên kho cập nhật giảm số lượng tồn lô hàng thứ nhất (giữ khóa Exclusive X-Lock)
        UPDATE LO_HANG WITH (ROWLOCK) 
        SET SoLuongTon = SoLuongTon - 1 
        WHERE MaLo = @FirstLo;

        -- Bước 2: Tạm dừng 3 giây để giao tác của nhân viên kho còn lại kịp khóa lô hàng thứ hai
        WAITFOR DELAY '00:00:03';

        -- Bước 3: Nhân viên kho tiếp tục yêu cầu cập nhật lô hàng thứ hai (gây xung đột chu trình nếu ngược thứ tự)
        UPDATE LO_HANG WITH (ROWLOCK) 
        SET SoLuongTon = SoLuongTon - 1 
        WHERE MaLo = @SecondLo;

        -- Hoàn lại số lượng đã trừ test để bảo toàn dữ liệu tồn kho ban đầu
        UPDATE LO_HANG 
        SET SoLuongTon = SoLuongTon + 1 
        WHERE MaLo IN (@FirstLo, @SecondLo);

        COMMIT TRANSACTION;

        IF @Mode = 'fixed'
            SET @LogMsg = N'[Nhân viên kho ' + @Tx + N'] THÀNH CÔNG: Đã áp dụng Giao thức sắp xếp thứ tự khóa (Lô ' + CAST(@FirstLo AS NVARCHAR) + N' -> Lô ' + CAST(@SecondLo AS NVARCHAR) + N'). Đồ thị chờ không có chu trình (KHÔNG BỊ DEADLOCK)!';
        ELSE
            SET @LogMsg = N'[Nhân viên kho ' + @Tx + N'] THÀNH CÔNG: Sống sót qua kiểm tra Deadlock (Lô ' + CAST(@FirstLo AS NVARCHAR) + N' -> Lô ' + CAST(@SecondLo AS NVARCHAR) + N')!';

        SELECT 'SUCCESS' AS Status, @LogMsg AS Message;
    END TRY
    BEGIN CATCH
        DECLARE @ErrNum INT = ERROR_NUMBER();
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();

        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        IF @ErrNum = 1205
            SET @LogMsg = N'[Nhân viên kho ' + @Tx + N'] PHÁT HIỆN DEADLOCK (Mã lỗi 1205): Hai nhân viên kho khóa lô hàng ngược nhau tạo chu trình T1 <-> T2. SQL Server phát hiện Deadlock, chọn giao tác này làm DEADLOCK VICTIM và tự động ROLLBACK!';
        ELSE IF @ErrNum = 1222
            SET @LogMsg = N'[Nhân viên kho ' + @Tx + N'] TIMEOUT KHÓA (Mã lỗi 1222): Chờ khóa Lô hàng quá 3 giây nên tự động hủy và ROLLBACK để giải phóng hệ thống!';
        ELSE
            SET @LogMsg = N'[Nhân viên kho ' + @Tx + N'] LỖI (' + CAST(@ErrNum AS VARCHAR(10)) + N'): ' + @ErrMsg;

        SELECT 'ERROR' AS Status, @LogMsg AS Message;
    END CATCH
END;
GO

-- Procedure: sp_Demo_DirtyRead_Read
-- 3. Demo Dirty Read: Giao tác đọc
CREATE   PROCEDURE sp_Demo_DirtyRead_Read
    @Mode VARCHAR(10) = 'error',
    @MaSP VARCHAR(15) = 'SP002'
AS
BEGIN
    SET NOCOUNT ON;
    IF @Mode = 'fixed'
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    ELSE
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    BEGIN TRANSACTION;

    DECLARE @TongTon FLOAT;
    SELECT @TongTon = ISNULL(SUM(SoLuongTon), 0) FROM LO_HANG WHERE MaSP = @MaSP;

    COMMIT TRANSACTION;

    SELECT @TongTon AS SoLuongTon;
END
GO

-- Procedure: sp_Demo_DirtyRead_Transaction
-- 2. Demo Dirty Read: Giao tác cập nhật rồi Rollback
CREATE   PROCEDURE sp_Demo_DirtyRead_Transaction
    @MaSP VARCHAR(15) = 'SP002'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DECLARE @MaLo INT;
    SELECT TOP 1 @MaLo = MaLo FROM LO_HANG WHERE MaSP = @MaSP ORDER BY HanSuDung ASC;

    IF @MaLo IS NOT NULL
    BEGIN
        UPDATE LO_HANG SET SoLuongTon = 9999 WHERE MaLo = @MaLo;
    END

    WAITFOR DELAY '00:00:05';

    ROLLBACK TRANSACTION;

    SELECT N'Giao dịch đã bị Hủy (Rollback). Tồn kho quay về ban đầu!' AS ThongBao;
END
GO

-- Procedure: sp_Demo_LostUpdate
CREATE   PROCEDURE sp_Demo_LostUpdate
        @Mode VARCHAR(10) = 'error',
        @Tx VARCHAR(10) = '1',
        @MaSP VARCHAR(15) = 'SP002'
    AS
    BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;

        DECLARE @MaLo INT, @Qty FLOAT, @GiaBan DECIMAL(18,2), @GiaKM DECIMAL(18,2);
        DECLARE @SoLuong FLOAT = 1.0;
        DECLARE @TongTienHang DECIMAL(18,2), @GiamGiaKM DECIMAL(18,2), @ThanhTien DECIMAL(18,2);
        DECLARE @NewQty FLOAT;
        DECLARE @MaHD VARCHAR(20);
        DECLARE @MaNV VARCHAR(20) = 'thungan' + @Tx;

        IF @Mode = 'fixed'
        BEGIN
            SELECT TOP 1 @MaLo = MaLo, @Qty = SoLuongTon
            FROM LO_HANG WITH (UPDLOCK, HOLDLOCK)
            WHERE MaSP = @MaSP AND SoLuongTon > 0
            ORDER BY HanSuDung ASC;
        END
        ELSE
        BEGIN
            SELECT TOP 1 @MaLo = MaLo, @Qty = SoLuongTon
            FROM LO_HANG
            WHERE MaSP = @MaSP AND SoLuongTon > 0
            ORDER BY HanSuDung ASC;
        END

        IF @MaLo IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50000, N'Sản phẩm đã hết hàng trong mọi lô', 1;
        END

        SELECT @GiaBan = GiaBan, @GiaKM = GiaKhuyenMai
        FROM v_SanPhamSieuThi WHERE MaSP = @MaSP;

        SET @TongTienHang = @GiaBan * @SoLuong;
        SET @GiamGiaKM = ISNULL((@GiaBan - @GiaKM) * @SoLuong, 0);
        SET @ThanhTien = @TongTienHang - @GiamGiaKM;

        WAITFOR DELAY '00:00:05';

        SET @MaHD = 'HD' + FORMAT(GETDATE(), 'yyMMddHHmmss') + @Tx;

        INSERT INTO HOA_DON (MaHD, NgayLap, MaNV, TongTienHang, GiamGiaKM, ThanhTien, PhuongThucTT)
        VALUES (@MaHD, GETDATE(), @MaNV, @TongTienHang, @GiamGiaKM, @ThanhTien, N'Tiền mặt');

        INSERT INTO CHI_TIET_HOA_DON (MaHD, MaSP, MaLo, SoLuong, DonGia, ThanhTien, SoTienGiam)
        VALUES (@MaHD, @MaSP, @MaLo, @SoLuong, @GiaBan, @ThanhTien, @GiamGiaKM);

        SET @NewQty = @Qty - @SoLuong;
        UPDATE LO_HANG SET SoLuongTon = @NewQty WHERE MaLo = @MaLo;

        COMMIT TRANSACTION;

        SELECT @MaHD AS MaHD, @Qty AS QtyOld, @NewQty AS QtyNew, 
               N'Đã bán 1 SP (HD: ' + @MaHD + N'). Tồn kho tính toán: ' + CAST(@Qty AS NVARCHAR(20)) + N' -> ' + CAST(@NewQty AS NVARCHAR(20)) AS ThongBao;
    END
GO

-- Procedure: sp_Demo_NonRepeatableRead_Read
-- 4. Demo Non-repeatable Read: Giao tác đọc 2 lần cách nhau 5 giây
CREATE   PROCEDURE sp_Demo_NonRepeatableRead_Read
    @Mode VARCHAR(10) = 'error',
    @MaSP VARCHAR(15) = 'SP002'
AS
BEGIN
    SET NOCOUNT ON;
    IF @Mode = 'fixed'
        SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    ELSE
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    BEGIN TRANSACTION;

    DECLARE @Price1 DECIMAL(18,2), @Price2 DECIMAL(18,2);

    SELECT @Price1 = ISNULL(GiaBan, 0) FROM SAN_PHAM WHERE MaSP = @MaSP;

    WAITFOR DELAY '00:00:05';

    SELECT @Price2 = ISNULL(GiaBan, 0) FROM SAN_PHAM WHERE MaSP = @MaSP;

    COMMIT TRANSACTION;

    SELECT @Price1 AS price1, @Price2 AS price2;
END
GO

-- Procedure: sp_Demo_NonRepeatableRead_Update
CREATE   PROCEDURE sp_Demo_NonRepeatableRead_Update
        @MaSP VARCHAR(15) = 'SP002',
        @MaNV VARCHAR(10) = 'demo'
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE SAN_PHAM 
        SET GiaBan = GiaBan + 1000,
            MaNVSuaCuoi = @MaNV,
            NgaySuaCuoi = GETDATE()
        WHERE MaSP = @MaSP;

        SELECT N'Đã cập nhật giá sản phẩm ' + @MaSP + N' tăng thêm 1,000 VNĐ (Người đổi: ' + @MaNV + N') và ghi vào BANG_LOG_GIA!' AS ThongBao;
    END;
GO

-- Procedure: sp_Demo_PhantomRead_Insert
CREATE   PROCEDURE sp_Demo_PhantomRead_Insert
        @MaSP VARCHAR(15) = 'SP002'
    AS
    BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;

        DECLARE @MaHD VARCHAR(20);
        SET @MaHD = 'HDPT' + FORMAT(GETDATE(), 'yyMMddHHmmss');

        DECLARE @GiaBan DECIMAL(18,2), @GiaKM DECIMAL(18,2);
        DECLARE @SoLuong FLOAT = 1.0;
        DECLARE @TongTienHang DECIMAL(18,2), @GiamGiaKM DECIMAL(18,2), @ThanhTien DECIMAL(18,2);

        SELECT @GiaBan = GiaBan, @GiaKM = GiaKhuyenMai
        FROM v_SanPhamSieuThi WHERE MaSP = @MaSP;

        SET @TongTienHang = @GiaBan * @SoLuong;
        SET @GiamGiaKM = (@GiaBan - @GiaKM) * @SoLuong;
        SET @ThanhTien = @TongTienHang - @GiamGiaKM;

        INSERT INTO HOA_DON (MaHD, NgayLap, MaNV, TongTienHang, GiamGiaKM, ThanhTien, PhuongThucTT)
        VALUES (@MaHD, GETDATE(), 'thungan1', @TongTienHang, @GiamGiaKM, @ThanhTien, N'Tiền mặt');

        EXEC sp_BanHangFIFO @MaHD=@MaHD, @MaSP=@MaSP, @SoLuongYeuCau=@SoLuong, @DonGiaGoc=@GiaBan, @SoTienGiam=@GiamGiaKM, @ThanhTien=@ThanhTien;

        COMMIT TRANSACTION;

        SELECT @MaHD AS MaHD, @ThanhTien AS ThanhTien,
               N'Đã tạo hóa đơn ' + @MaHD + N' (SP: ' + @MaSP + N', ' + FORMAT(@ThanhTien, 'N0') + N' VNĐ)' AS ThongBao;
    END
GO

-- Procedure: sp_Demo_PhantomRead_Read
-- 6. Demo Phantom Read: Đếm số lượng hóa đơn 2 lần cách nhau 5 giây
CREATE   PROCEDURE sp_Demo_PhantomRead_Read
    @Mode VARCHAR(10) = 'error'
AS
BEGIN
    SET NOCOUNT ON;
    IF @Mode = 'fixed'
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    ELSE
        SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

    BEGIN TRANSACTION;

    DECLARE @Count1 INT, @Count2 INT;

    SELECT @Count1 = COUNT(*) FROM HOA_DON;

    WAITFOR DELAY '00:00:05';

    SELECT @Count2 = COUNT(*) FROM HOA_DON;

    COMMIT TRANSACTION;

    SELECT @Count1 AS count1, @Count2 AS count2;
END
GO

-- Procedure: sp_NhapKho
CREATE   PROCEDURE dbo.sp_NhapKho
        @MaPN VARCHAR(20) = NULL,
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
            
            IF @MaPN IS NULL OR LTRIM(RTRIM(@MaPN)) = ''
            BEGIN
                SET @MaPN = dbo.fn_SinhMaPhieuNhap();
            END
            
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
                    GiaNhap = @GiaNhap
                WHERE MaSP = @MaSP AND NgaySanXuat = @NgaySanXuat AND HanSuDung = @HanSuDung;
            END
            ELSE
            BEGIN
                INSERT INTO LO_HANG (MaSP, NgaySanXuat, HanSuDung, SoLuongTon, GiaNhap)
                VALUES (@MaSP, @NgaySanXuat, @HanSuDung, @SoLuong, @GiaNhap);
            END
            
            COMMIT TRANSACTION;
            
            SELECT @MaPN AS MaPN;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            
            DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrorMessage, 16, 1);
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

-- Procedure: sp_ThanhToanHoaDon
CREATE   PROCEDURE dbo.sp_ThanhToanHoaDon
        @MaNV VARCHAR(10),
        @SoDienThoaiKH VARCHAR(15) = NULL,
        @DiemSuDung INT = 0,
        @MaVoucher VARCHAR(20) = NULL,
        @PhuongThucTT NVARCHAR(60) = N'Tiền mặt',
        @ChiTietGioHangJSON NVARCHAR(MAX)
    AS
    BEGIN
        SET NOCOUNT ON;
        
        BEGIN TRY
            -- Khai báo bảng tạm lưu giỏ hàng
            DECLARE @GioHang TABLE (
                Id INT IDENTITY(1,1),
                MaSP VARCHAR(15),
                SoLuong DECIMAL(10,2),
                GiaBan DECIMAL(18,2) NULL,
                GiaKhuyenMai DECIMAL(18,2) NULL,
                TongTienHang DECIMAL(18,2) NULL,
                TienGiamKM DECIMAL(18,2) NULL,
                TienGiamVoucherDiem DECIMAL(18,2) DEFAULT 0,
                TongTienGiam DECIMAL(18,2) DEFAULT 0,
                ThanhTien DECIMAL(18,2) DEFAULT 0
            );
            
            -- 1. Đọc dữ liệu giỏ hàng từ JSON
            INSERT INTO @GioHang (MaSP, SoLuong)
            SELECT ma_sp, CAST(so_luong AS DECIMAL(10,2))
            FROM OPENJSON(@ChiTietGioHangJSON)
            WITH (
                ma_sp VARCHAR(15) '$.ma_sp',
                so_luong DECIMAL(10,2) '$.so_luong'
            );
            
            IF NOT EXISTS (SELECT 1 FROM @GioHang)
            BEGIN
                RAISERROR(N'Giỏ hàng trống!', 16, 1);
            END
            
            -- 2. Tra cứu giá bán và giá khuyến mãi từ View v_SanPhamSieuThi
            UPDATE g
            SET g.GiaBan = sp.GiaBan,
                g.GiaKhuyenMai = sp.GiaKhuyenMai,
                g.TongTienHang = g.SoLuong * sp.GiaBan,
                g.TienGiamKM = g.SoLuong * (sp.GiaBan - sp.GiaKhuyenMai)
            FROM @GioHang g
            INNER JOIN v_SanPhamSieuThi sp ON g.MaSP = sp.MaSP;
            
            IF EXISTS (SELECT 1 FROM @GioHang WHERE GiaBan IS NULL)
            BEGIN
                RAISERROR(N'Có sản phẩm trong giỏ hàng không tồn tại trong hệ thống!', 16, 1);
            END
            
            -- 3. Kiểm tra thông tin khách hàng & điểm tích lũy
            DECLARE @MaKH INT = NULL, @DiemHienCo INT = 0;
            IF @SoDienThoaiKH IS NOT NULL AND LTRIM(RTRIM(@SoDienThoaiKH)) <> ''
            BEGIN
                SELECT @MaKH = MaKH, @DiemHienCo = ISNULL(DiemTichLuy, 0)
                FROM KHACH_HANG 
                WHERE SoDienThoai = LTRIM(RTRIM(@SoDienThoaiKH));
                
                IF @MaKH IS NULL
                BEGIN
                    DECLARE @ErrKH NVARCHAR(200) = N'Số điện thoại khách hàng ' + @SoDienThoaiKH + N' chưa đăng ký hội viên!';
                    RAISERROR(@ErrKH, 16, 1);
                END
            END
            
            IF @DiemSuDung > 0
            BEGIN
                IF @MaKH IS NULL
                BEGIN
                    RAISERROR(N'Không thể dùng điểm tích lũy cho khách vãng lai!', 16, 1);
                END
                IF @DiemSuDung > @DiemHienCo
                BEGIN
                    DECLARE @ErrDiem NVARCHAR(200) = N'Khách hàng chỉ có ' + CAST(@DiemHienCo AS NVARCHAR) + N' điểm, không thể sử dụng ' + CAST(@DiemSuDung AS NVARCHAR) + N' điểm!';
                    RAISERROR(@ErrDiem, 16, 1);
                END
            END
            
            -- 4. Tính toán tổng tiền hàng & giảm giá khuyến mãi
            DECLARE @TongTienHang DECIMAL(18,2) = 0, @GiamGiaKM DECIMAL(18,2) = 0;
            SELECT @TongTienHang = SUM(TongTienHang), @GiamGiaKM = SUM(TienGiamKM) FROM @GioHang;
            
            -- 5. Kiểm tra và áp dụng Voucher
            DECLARE @GiamGiaVoucher DECIMAL(18,2) = 0;
            DECLARE @MaSPTang VARCHAR(15) = NULL, @SoLuongTang INT = 0;
            
            IF @MaVoucher IS NOT NULL AND LTRIM(RTRIM(@MaVoucher)) <> ''
            BEGIN
                SET @MaVoucher = LTRIM(RTRIM(@MaVoucher));
                DECLARE @LoaiVoucher VARCHAR(20), @GiaTriVoucher DECIMAL(18,2);
                
                SELECT @LoaiVoucher = LoaiVoucher, @GiaTriVoucher = GiaTri, 
                       @MaSPTang = MaSPTang, @SoLuongTang = SoLuongTang
                FROM VOUCHER
                WHERE MaVoucher = @MaVoucher 
                  AND CAST(GETDATE() AS DATE) BETWEEN NgayBatDau AND NgayKetThuc;
                  
                IF @LoaiVoucher IS NULL
                BEGIN
                    RAISERROR(N'Mã Voucher không hợp lệ hoặc đã hết hạn sử dụng!', 16, 1);
                END
                
                IF @LoaiVoucher = 'GiamGia'
                BEGIN
                    SET @GiamGiaVoucher = (@TongTienHang - @GiamGiaKM) * (ISNULL(@GiaTriVoucher, 0) / 100.0);
                END
                ELSE IF @LoaiVoucher = 'TangSanPham' AND @MaSPTang IS NOT NULL AND @SoLuongTang > 0
                BEGIN
                    -- Thêm sản phẩm tặng kèm vào giỏ hàng với giá 0đ
                    INSERT INTO @GioHang (MaSP, SoLuong, GiaBan, GiaKhuyenMai, TongTienHang, TienGiamKM, TienGiamVoucherDiem, TongTienGiam, ThanhTien)
                    VALUES (@MaSPTang, @SoLuongTang, 0, 0, 0, 0, 0, 0, 0);
                END
            END
            
            -- 6. Tính Thành Tiền cuối cùng của hóa đơn
            DECLARE @GiaTriDiem DECIMAL(18,2) = @DiemSuDung * 100.0;
            DECLARE @ThanhTien DECIMAL(18,2) = @TongTienHang - @GiamGiaKM - @GiamGiaVoucher - @GiaTriDiem;
            IF @ThanhTien < 0 SET @ThanhTien = 0;
            
            -- 7. Phân bổ chiết khấu tổng (Voucher + Điểm) cho từng mặt hàng
            DECLARE @TongGiamTongThe DECIMAL(18,2) = @GiamGiaVoucher + @GiaTriDiem;
            DECLARE @TongGiaSauKM DECIMAL(18,2) = @TongTienHang - @GiamGiaKM;
            
            IF @TongGiaSauKM > 0
            BEGIN
                UPDATE @GioHang
                SET TienGiamVoucherDiem = CASE 
                        WHEN GiaBan > 0 THEN ((TongTienHang - TienGiamKM) / @TongGiaSauKM) * @TongGiamTongThe 
                        ELSE 0 
                    END
                WHERE GiaBan > 0;
            END
            
            UPDATE @GioHang
            SET TongTienGiam = TienGiamKM + TienGiamVoucherDiem,
                ThanhTien = CASE 
                    WHEN GiaBan > 0 THEN 
                        CASE WHEN (TongTienHang - (TienGiamKM + TienGiamVoucherDiem)) < 0 THEN 0 
                             ELSE (TongTienHang - (TienGiamKM + TienGiamVoucherDiem)) END
                    ELSE 0 
                END;
                
            -- =======================================================
            -- BẮT ĐẦU GIAO TÁC CƠ SỞ DỮ LIỆU (ACID TRANSACTION)
            -- =======================================================
            BEGIN TRANSACTION;
            
            -- Sinh mã hóa đơn chuẩn CSDL
            DECLARE @MaHD VARCHAR(20) = dbo.fn_SinhMaHoaDon();
            
            -- Ghi vào bảng HOA_DON (trigger trg_SauKhiLapHoaDon sẽ tự động xử lý điểm)
            INSERT INTO HOA_DON (
                MaHD, NgayLap, MaNV, MaKH, TongTienHang, GiamGiaKM, 
                MaVoucher, GiamGiaVoucher, DiemSuDung, ThanhTien, PhuongThucTT
            )
            VALUES (
                @MaHD, GETDATE(), @MaNV, @MaKH, @TongTienHang, @GiamGiaKM,
                CASE WHEN @MaVoucher = '' THEN NULL ELSE @MaVoucher END,
                @GiamGiaVoucher, @DiemSuDung, @ThanhTien, @PhuongThucTT
            );
            
            -- Duyệt từng sản phẩm để gọi trừ kho FIFO (sp_BanHangFIFO)
            DECLARE @CurMaSP VARCHAR(15), @CurSL DECIMAL(10,2), @CurDonGia DECIMAL(18,2),
                    @CurTienGiam DECIMAL(18,2), @CurThanhTien DECIMAL(18,2);
                    
            DECLARE CartCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT MaSP, SoLuong, GiaBan, TongTienGiam, ThanhTien FROM @GioHang;
            
            OPEN CartCursor;
            FETCH NEXT FROM CartCursor INTO @CurMaSP, @CurSL, @CurDonGia, @CurTienGiam, @CurThanhTien;
            
            WHILE @@FETCH_STATUS = 0
            BEGIN
                EXEC sp_BanHangFIFO 
                    @MaHD = @MaHD, 
                    @MaSP = @CurMaSP, 
                    @SoLuongYeuCau = @CurSL, 
                    @DonGiaGoc = @CurDonGia, 
                    @SoTienGiam = @CurTienGiam, 
                    @ThanhTien = @CurThanhTien;
                    
                FETCH NEXT FROM CartCursor INTO @CurMaSP, @CurSL, @CurDonGia, @CurTienGiam, @CurThanhTien;
            END
            
            CLOSE CartCursor;
            DEALLOCATE CartCursor;
            
            -- Cam kết giao tác nếu mọi thứ thành công
            COMMIT TRANSACTION;
            
            -- Trả kết quả chuẩn JSON/Dataset về cho tầng ứng dụng
            DECLARE @DiemMoi INT = dbo.fn_TinhDiemTichLuy(@ThanhTien);
            
            SELECT 
                @MaHD AS MaHD,
                @TongTienHang AS TongTienHang,
                @GiamGiaKM AS GiamGiaKM,
                @GiamGiaVoucher AS GiamGiaVoucher,
                @DiemSuDung AS DiemSuDung,
                @ThanhTien AS ThanhTien,
                @DiemMoi AS DiemTichLuyMoi,
                ISNULL(@MaVoucher, '') AS MaVoucher,
                N'Thanh toán thành công' AS Message;
                
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrorMessage, 16, 1);
        END CATCH
    END;
GO

-- Procedure: sp_TieuHuyHang
CREATE   PROCEDURE dbo.sp_TieuHuyHang
        @MaLo INT,
        @MaSP VARCHAR(15),
        @SoLuongHuy DECIMAL(10,2),
        @MaNV VARCHAR(10)
    AS
    BEGIN
        SET NOCOUNT ON;
        BEGIN TRY
            BEGIN TRANSACTION;
            
            DECLARE @TonKho DECIMAL(10,2);
            SELECT @TonKho = SoLuongTon FROM LO_HANG WHERE MaLo = @MaLo;
            
            IF @TonKho IS NULL
            BEGIN
                RAISERROR(N'Lô hàng không tồn tại!', 16, 1);
            END
            
            IF @TonKho < @SoLuongHuy
            BEGIN
                RAISERROR(N'Số lượng tiêu hủy vượt quá tồn kho hiện có của lô!', 16, 1);
            END
            
            -- Trừ tồn kho
            UPDATE LO_HANG 
            SET SoLuongTon = SoLuongTon - @SoLuongHuy 
            WHERE MaLo = @MaLo;
            
            -- Thêm vào bảng HANG_TIEU_HUY
            INSERT INTO HANG_TIEU_HUY (MaSP, MaLo, SoLuongHuy, NgayTieuHuy, MaNV)
            VALUES (@MaSP, @MaLo, @SoLuongHuy, GETDATE(), @MaNV);
            
            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
            RAISERROR(@ErrMsg, 16, 1);
        END CATCH
    END;
GO

-- ============================================================================
-- BỘ KÍCH HOẠT (TRIGGERS)
-- ============================================================================

-- Trigger: trg_Audit_GiaSanPham
CREATE   TRIGGER dbo.trg_Audit_GiaSanPham
    ON dbo.SAN_PHAM
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        IF UPDATE(GiaBan)
        BEGIN
            INSERT INTO dbo.BANG_LOG_GIA (MaSP, GiaCu, GiaMoi, NgayThayDoi, NguoiThayDoi)
            SELECT 
                i.MaSP, 
                d.GiaBan, 
                i.GiaBan, 
                GETDATE(), 
                ISNULL(i.MaNVSuaCuoi, 'demo')
            FROM deleted d
            JOIN inserted i ON d.MaSP = i.MaSP
            WHERE d.GiaBan <> i.GiaBan;
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

-- Trigger: trg_KiemTraTonKhoKhongAm
-- 9. TRIGGER: RÀNG BUỘC TOÀN VẸN TỒN KHO KHÔNG ÂM
CREATE   TRIGGER dbo.trg_KiemTraTonKhoKhongAm
ON dbo.LO_HANG
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted WHERE SoLuongTon < 0)
    BEGIN
        RAISERROR(N'Lỗi ràng buộc: Số lượng tồn kho của lô hàng không được phép âm!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- Trigger: trg_SauKhiLapHoaDon
-- 10. TRIGGER: TỰ ĐỘNG TÍCH ĐIỂM VÀ NÂNG HẠNG THÀNH VIÊN SAU KHI LẬP HÓA ĐƠN
CREATE   TRIGGER dbo.trg_SauKhiLapHoaDon
ON dbo.HOA_DON
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaKH INT, @DiemSuDung INT, @ThanhTien DECIMAL(18,2), @DiemMoi INT;
    
    SELECT @MaKH = MaKH, @DiemSuDung = DiemSuDung, @ThanhTien = ThanhTien FROM inserted;
    
    IF @MaKH IS NOT NULL
    BEGIN
        -- Tính điểm thưởng mới
        SET @DiemMoi = dbo.fn_TinhDiemTichLuy(@ThanhTien);
        
        -- Xác định hạng thành viên mới dựa vào tổng chi tiêu lũy kế
        DECLARE @HangMoi NVARCHAR(20) = dbo.fn_XepHangKhachHang(@MaKH);
        
        -- Cập nhật vào bảng KHACH_HANG
        UPDATE KHACH_HANG
        SET DiemTichLuy = DiemTichLuy - @DiemSuDung + @DiemMoi,
            HangThanhVien = @HangMoi
        WHERE MaKH = @MaKH;
        
        -- Kiểm tra nếu điểm bị âm thì rollback
        IF EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKH = @MaKH AND DiemTichLuy < 0)
        BEGIN
            RAISERROR (N'Lỗi: Điểm sử dụng vượt quá số điểm tích lũy hiện có của khách hàng!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
    END
END;
GO
