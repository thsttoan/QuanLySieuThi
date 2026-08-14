USE [master]
GO
/****** Object:  Database [QL_BachHoaXanh]    Script Date: 8/13/2026 4:11:17 PM ******/
CREATE DATABASE [QL_BachHoaXanh]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'QL_BachHoaXanh', FILENAME = N'D:\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\QL_BachHoaXanh.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'QL_BachHoaXanh_log', FILENAME = N'D:\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\QL_BachHoaXanh_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [QL_BachHoaXanh].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [QL_BachHoaXanh] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET ARITHABORT OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [QL_BachHoaXanh] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [QL_BachHoaXanh] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [QL_BachHoaXanh] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET  ENABLE_BROKER 
GO
ALTER DATABASE [QL_BachHoaXanh] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [QL_BachHoaXanh] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [QL_BachHoaXanh] SET  MULTI_USER 
GO
ALTER DATABASE [QL_BachHoaXanh] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [QL_BachHoaXanh] SET DB_CHAINING OFF 
GO
ALTER DATABASE [QL_BachHoaXanh] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [QL_BachHoaXanh] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [QL_BachHoaXanh] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [QL_BachHoaXanh] SET QUERY_STORE = ON
GO
ALTER DATABASE [QL_BachHoaXanh] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO)
GO
USE [QL_BachHoaXanh]
GO
ALTER DATABASE SCOPED CONFIGURATION SET ACCELERATED_PLAN_FORCING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET ASYNC_STATS_UPDATE_WAIT_AT_LOW_PRIORITY = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET BATCH_MODE_ADAPTIVE_JOINS = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET BATCH_MODE_MEMORY_GRANT_FEEDBACK = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET BATCH_MODE_ON_ROWSTORE = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET CE_FEEDBACK = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET DEFERRED_COMPILATION_TV = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET DOP_FEEDBACK = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET DW_COMPATIBILITY_LEVEL = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION SET ELEVATE_ONLINE = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET ELEVATE_RESUMABLE = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET EXEC_QUERY_STATS_FOR_SCALAR_FUNCTIONS = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET FORCE_SHOWPLAN_RUNTIME_PARAMETER_COLLECTION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET GLOBAL_TEMPORARY_TABLE_AUTO_DROP = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET INTERLEAVED_EXECUTION_TVF = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET ISOLATE_SECURITY_POLICY_CARDINALITY = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LAST_QUERY_PLAN_STATS = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEDGER_DIGEST_STORAGE_ENDPOINT = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET LEGACY_CARDINALITY_ESTIMATION = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LIGHTWEIGHT_QUERY_PROFILING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET MAXDOP = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MEMORY_GRANT_FEEDBACK_PERCENTILE_GRANT = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MEMORY_GRANT_FEEDBACK_PERSISTENCE = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET OPTIMIZED_PLAN_FORCING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET OPTIMIZE_FOR_AD_HOC_WORKLOADS = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SENSITIVE_PLAN_OPTIMIZATION = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET PARAMETER_SNIFFING = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PAUSED_RESUMABLE_INDEX_ABORT_DURATION_MINUTES = 1440;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET QUERY_OPTIMIZER_HOTFIXES = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET ROW_MODE_MEMORY_GRANT_FEEDBACK = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET TSQL_SCALAR_UDF_INLINING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET VERBOSE_TRUNCATION_WARNINGS = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET XTP_PROCEDURE_EXECUTION_STATISTICS = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET XTP_QUERY_EXECUTION_STATISTICS = OFF;
GO
USE [QL_BachHoaXanh]
GO
/****** Object:  UserDefinedFunction [dbo].[fn_TinhDiemTichLuy]    Script Date: 8/13/2026 4:11:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- 2. Cáº­p nháº­t hÃ m tÃ­nh Ä‘iá»ƒm tÃ­ch lÅ©y (1000Ä‘ = 1 Ä‘iá»ƒm)
CREATE FUNCTION [dbo].[fn_TinhDiemTichLuy] (
    @ThanhTien DECIMAL(18,2)
)
RETURNS INT
AS
BEGIN
    RETURN FLOOR(@ThanhTien / 1000.0);
END;

GO
/****** Object:  UserDefinedFunction [dbo].[fn_TinhTienSauKhuyenMai]    Script Date: 8/13/2026 4:11:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--------------------------------------------------------------------------------
-- ĐỐI TƯỢNG 1: FUNCTIONS (HÀM)
--------------------------------------------------------------------------------

-- Hàm 1: Tính giá trị sản phẩm sau khuyến mãi
CREATE FUNCTION [dbo].[fn_TinhTienSauKhuyenMai] (
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
/****** Object:  Table [dbo].[DANH_MUC]    Script Date: 8/13/2026 4:11:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DANH_MUC](
	[MaDanhMuc] [varchar](10) NOT NULL,
	[TenDanhMuc] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDanhMuc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SAN_PHAM]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SAN_PHAM](
	[MaSP] [varchar](15) NOT NULL,
	[TenSP] [nvarchar](150) NOT NULL,
	[MaDanhMuc] [varchar](10) NULL,
	[DonViTinh] [nvarchar](20) NOT NULL,
	[GiaBan] [decimal](18, 2) NOT NULL,
	[LaHangTuoiSong] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaSP] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LO_HANG]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LO_HANG](
	[MaLo] [int] IDENTITY(1,1) NOT NULL,
	[MaSP] [varchar](15) NULL,
	[NgaySanXuat] [date] NULL,
	[HanSuDung] [date] NOT NULL,
	[SoLuongTon] [decimal](10, 2) NOT NULL,
	[GiaNhap] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaLo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[v_SanPhamSieuThi]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--------------------------------------------------------------------------------
-- ĐỐI TƯỢNG 2: VIEWS (KHUNG NHÌN)
--------------------------------------------------------------------------------

-- View 1: Danh sách sản phẩm siêu thị và tổng tồn kho của các lô hàng còn hạn sử dụng
CREATE VIEW [dbo].[v_SanPhamSieuThi] AS
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
/****** Object:  View [dbo].[v_CanhBaoHanSD]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- View 2: Cảnh báo hạn sử dụng lô hàng
CREATE VIEW [dbo].[v_CanhBaoHanSD] AS
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
/****** Object:  View [dbo].[v_CanhBaoTonKho]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- View 4: Cảnh báo tồn kho thấp (dưới 10)
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
/****** Object:  Table [dbo].[HOA_DON]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HOA_DON](
	[MaHD] [varchar](20) NOT NULL,
	[NgayLap] [datetime] NULL,
	[MaNV] [varchar](10) NULL,
	[MaKH] [int] NULL,
	[TongTienHang] [decimal](18, 2) NOT NULL,
	[GiamGiaKM] [decimal](18, 2) NULL,
	[DiemSuDung] [int] NULL,
	[ThanhTien] [decimal](18, 2) NOT NULL,
	[PhuongThucTT] [nvarchar](30) NOT NULL,
	[MaNVSuaCuoi] [varchar](10) NULL,
	[NgaySuaCuoi] [datetime] NULL,
	[GhiChu] [nvarchar](500) NULL,
	[MaVoucher] [varchar](20) NULL,
	[GiamGiaVoucher] [decimal](18, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaHD] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[v_DoanhThuTheoNgay]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- View 3: Báo cáo doanh thu theo ngày
CREATE VIEW [dbo].[v_DoanhThuTheoNgay] AS
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
/****** Object:  Table [dbo].[CHI_TIET_HOA_DON]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CHI_TIET_HOA_DON](
	[MaHD] [varchar](20) NOT NULL,
	[MaSP] [varchar](15) NOT NULL,
	[MaLo] [int] NOT NULL,
	[SoLuong] [decimal](10, 2) NOT NULL,
	[DonGia] [decimal](18, 2) NOT NULL,
	[ThanhTien] [decimal](18, 2) NOT NULL,
	[SoTienGiam] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaHD] ASC,
	[MaSP] ASC,
	[MaLo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CHI_TIET_PHIEU_NHAP]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CHI_TIET_PHIEU_NHAP](
	[MaPN] [varchar](20) NOT NULL,
	[MaSP] [varchar](15) NOT NULL,
	[SoLuong] [decimal](10, 2) NOT NULL,
	[GiaNhap] [decimal](18, 2) NOT NULL,
	[NgaySanXuat] [date] NULL,
	[HanSuDung] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPN] ASC,
	[MaSP] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KHACH_HANG]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KHACH_HANG](
	[MaKH] [int] IDENTITY(1,1) NOT NULL,
	[SoDienThoai] [varchar](15) NOT NULL,
	[TenKH] [nvarchar](100) NOT NULL,
	[DiemTichLuy] [int] NULL,
	[NgayDangKy] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKH] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[SoDienThoai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KHUYEN_MAI]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KHUYEN_MAI](
	[MaKM] [varchar](10) NOT NULL,
	[TenKM] [nvarchar](100) NOT NULL,
	[PhanTramGiam] [int] NOT NULL,
	[NgayBatDau] [datetime] NOT NULL,
	[NgayKetThuc] [datetime] NOT NULL,
	[LoaiKM] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKM] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KM_SAN_PHAM]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KM_SAN_PHAM](
	[MaKM] [varchar](10) NOT NULL,
	[MaSP] [varchar](15) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKM] ASC,
	[MaSP] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NHA_CUNG_CAP]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NHA_CUNG_CAP](
	[MaNCC] [varchar](10) NOT NULL,
	[TenNCC] [nvarchar](150) NOT NULL,
	[SoDienThoai] [varchar](15) NULL,
	[DiaChi] [nvarchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNCC] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NHAN_VIEN]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NHAN_VIEN](
	[MaNV] [varchar](10) NOT NULL,
	[TenNV] [nvarchar](100) NOT NULL,
	[ChucVu] [nvarchar](50) NOT NULL,
	[SoDienThoai] [varchar](15) NULL,
	[MatKhau] [varchar](255) NOT NULL,
	[Role] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNV] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PHIEU_NHAP]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PHIEU_NHAP](
	[MaPN] [varchar](20) NOT NULL,
	[NgayNhap] [datetime] NULL,
	[MaNV] [varchar](10) NULL,
	[MaNCC] [varchar](10) NULL,
	[TongTien] [decimal](18, 2) NOT NULL,
	[MaNVSuaCuoi] [varchar](10) NULL,
	[NgaySuaCuoi] [datetime] NULL,
	[GhiChu] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPN] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VOUCHER]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VOUCHER](
	[MaVoucher] [varchar](20) NOT NULL,
	[TenVoucher] [nvarchar](100) NOT NULL,
	[LoaiVoucher] [varchar](20) NOT NULL,
	[GiaTri] [decimal](18, 2) NULL,
	[MaSPTang] [varchar](15) NULL,
	[SoLuongTang] [int] NULL,
	[NgayBatDau] [date] NOT NULL,
	[NgayKetThuc] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaVoucher] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[CHI_TIET_HOA_DON] ADD  DEFAULT ((0)) FOR [SoTienGiam]
GO
ALTER TABLE [dbo].[HOA_DON] ADD  DEFAULT (getdate()) FOR [NgayLap]
GO
ALTER TABLE [dbo].[HOA_DON] ADD  DEFAULT ((0)) FOR [GiamGiaKM]
GO
ALTER TABLE [dbo].[HOA_DON] ADD  DEFAULT ((0)) FOR [DiemSuDung]
GO
ALTER TABLE [dbo].[KHACH_HANG] ADD  DEFAULT ((0)) FOR [DiemTichLuy]
GO
ALTER TABLE [dbo].[KHACH_HANG] ADD  DEFAULT (getdate()) FOR [NgayDangKy]
GO
ALTER TABLE [dbo].[KHUYEN_MAI] ADD  DEFAULT ('SanPham') FOR [LoaiKM]
GO
ALTER TABLE [dbo].[NHAN_VIEN] ADD  DEFAULT ((1)) FOR [Role]
GO
ALTER TABLE [dbo].[PHIEU_NHAP] ADD  DEFAULT (getdate()) FOR [NgayNhap]
GO
ALTER TABLE [dbo].[SAN_PHAM] ADD  DEFAULT ((0)) FOR [LaHangTuoiSong]
GO
ALTER TABLE [dbo].[CHI_TIET_HOA_DON]  WITH CHECK ADD FOREIGN KEY([MaHD])
REFERENCES [dbo].[HOA_DON] ([MaHD])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CHI_TIET_HOA_DON]  WITH CHECK ADD FOREIGN KEY([MaLo])
REFERENCES [dbo].[LO_HANG] ([MaLo])
GO
ALTER TABLE [dbo].[CHI_TIET_HOA_DON]  WITH CHECK ADD FOREIGN KEY([MaSP])
REFERENCES [dbo].[SAN_PHAM] ([MaSP])
GO
ALTER TABLE [dbo].[CHI_TIET_PHIEU_NHAP]  WITH CHECK ADD FOREIGN KEY([MaPN])
REFERENCES [dbo].[PHIEU_NHAP] ([MaPN])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CHI_TIET_PHIEU_NHAP]  WITH CHECK ADD FOREIGN KEY([MaSP])
REFERENCES [dbo].[SAN_PHAM] ([MaSP])
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD FOREIGN KEY([MaKH])
REFERENCES [dbo].[KHACH_HANG] ([MaKH])
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD FOREIGN KEY([MaNV])
REFERENCES [dbo].[NHAN_VIEN] ([MaNV])
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD FOREIGN KEY([MaNVSuaCuoi])
REFERENCES [dbo].[NHAN_VIEN] ([MaNV])
GO
ALTER TABLE [dbo].[KM_SAN_PHAM]  WITH CHECK ADD FOREIGN KEY([MaKM])
REFERENCES [dbo].[KHUYEN_MAI] ([MaKM])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[KM_SAN_PHAM]  WITH CHECK ADD FOREIGN KEY([MaSP])
REFERENCES [dbo].[SAN_PHAM] ([MaSP])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[LO_HANG]  WITH CHECK ADD FOREIGN KEY([MaSP])
REFERENCES [dbo].[SAN_PHAM] ([MaSP])
GO
ALTER TABLE [dbo].[PHIEU_NHAP]  WITH CHECK ADD FOREIGN KEY([MaNCC])
REFERENCES [dbo].[NHA_CUNG_CAP] ([MaNCC])
GO
ALTER TABLE [dbo].[PHIEU_NHAP]  WITH CHECK ADD FOREIGN KEY([MaNVSuaCuoi])
REFERENCES [dbo].[NHAN_VIEN] ([MaNV])
GO
ALTER TABLE [dbo].[PHIEU_NHAP]  WITH CHECK ADD FOREIGN KEY([MaNV])
REFERENCES [dbo].[NHAN_VIEN] ([MaNV])
GO
ALTER TABLE [dbo].[SAN_PHAM]  WITH CHECK ADD FOREIGN KEY([MaDanhMuc])
REFERENCES [dbo].[DANH_MUC] ([MaDanhMuc])
GO
ALTER TABLE [dbo].[CHI_TIET_HOA_DON]  WITH CHECK ADD CHECK  (([DonGia]>=(0)))
GO
ALTER TABLE [dbo].[CHI_TIET_HOA_DON]  WITH CHECK ADD CHECK  (([SoLuong]>(0)))
GO
ALTER TABLE [dbo].[CHI_TIET_PHIEU_NHAP]  WITH CHECK ADD CHECK  (([GiaNhap]>(0)))
GO
ALTER TABLE [dbo].[CHI_TIET_PHIEU_NHAP]  WITH CHECK ADD CHECK  (([SoLuong]>(0)))
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD CHECK  (([DiemSuDung]>=(0)))
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD CHECK  (([GiamGiaKM]>=(0)))
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD CHECK  (([ThanhTien]>=(0)))
GO
ALTER TABLE [dbo].[HOA_DON]  WITH CHECK ADD CHECK  (([TongTienHang]>=(0)))
GO
ALTER TABLE [dbo].[KHACH_HANG]  WITH CHECK ADD CHECK  (([DiemTichLuy]>=(0)))
GO
ALTER TABLE [dbo].[KHUYEN_MAI]  WITH CHECK ADD CHECK  (([PhanTramGiam]>=(0) AND [PhanTramGiam]<=(100)))
GO
ALTER TABLE [dbo].[LO_HANG]  WITH CHECK ADD CHECK  (([GiaNhap]>(0)))
GO
ALTER TABLE [dbo].[LO_HANG]  WITH CHECK ADD CHECK  (([SoLuongTon]>=(0)))
GO
ALTER TABLE [dbo].[PHIEU_NHAP]  WITH CHECK ADD CHECK  (([TongTien]>=(0)))
GO
ALTER TABLE [dbo].[SAN_PHAM]  WITH CHECK ADD CHECK  (([GiaBan]>(0)))
GO
/****** Object:  StoredProcedure [dbo].[sp_BanHangFIFO]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_BanHangFIFO]
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
/****** Object:  StoredProcedure [dbo].[sp_NhapKho]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_NhapKho]
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
/****** Object:  StoredProcedure [dbo].[sp_SuaChiTietHoaDon]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_SuaChiTietHoaDon]
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
/****** Object:  StoredProcedure [dbo].[sp_SuaChiTietPhieuNhap]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- PROCEDURE Sá»¬A CHI TIáº¾T PHIáº¾U NHáº¬P
CREATE PROCEDURE [dbo].[sp_SuaChiTietPhieuNhap]
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
/****** Object:  Trigger [dbo].[trg_KiemTraHSDKhiBan]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- Trigger 2: Kiểm tra hạn sử dụng của lô hàng khi lưu chi tiết hóa đơn
CREATE TRIGGER [dbo].[trg_KiemTraHSDKhiBan]
ON [dbo].[CHI_TIET_HOA_DON]
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
ALTER TABLE [dbo].[CHI_TIET_HOA_DON] ENABLE TRIGGER [trg_KiemTraHSDKhiBan]
GO
/****** Object:  Trigger [dbo].[trg_SauKhiLapHoaDon]    Script Date: 8/13/2026 4:11:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--------------------------------------------------------------------------------
-- ĐỐI TƯỢNG 3: TRIGGERS (BỘ KÍCH HOẠT)
--------------------------------------------------------------------------------

-- Trigger 1: Tự động cập nhật điểm tích lũy của khách hàng sau khi lập hóa đơn
CREATE TRIGGER [dbo].[trg_SauKhiLapHoaDon]
ON [dbo].[HOA_DON]
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
ALTER TABLE [dbo].[HOA_DON] ENABLE TRIGGER [trg_SauKhiLapHoaDon]
GO
USE [master]
GO
ALTER DATABASE [QL_BachHoaXanh] SET  READ_WRITE 
GO
USE [QL_BachHoaXanh]
GO
CREATE TABLE [dbo].[HANG_TIEU_HUY] (
    [MaTieuHuy] INT IDENTITY(1,1) PRIMARY KEY,
    [MaSP] VARCHAR(15) NOT NULL,
    [MaLo] INT NOT NULL,
    [SoLuongHuy] DECIMAL(10,2) NOT NULL,
    [NgayTieuHuy] DATETIME DEFAULT GETDATE(),
    [MaNV] VARCHAR(10) NOT NULL,
    FOREIGN KEY ([MaSP]) REFERENCES [dbo].[SAN_PHAM]([MaSP]),
    FOREIGN KEY ([MaLo]) REFERENCES [dbo].[LO_HANG]([MaLo]),
    FOREIGN KEY ([MaNV]) REFERENCES [dbo].[NHAN_VIEN]([MaNV])
);
GO
