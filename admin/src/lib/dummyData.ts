// ─── Buyers ────────────────────────────────────────────────────────────────
export const buyers = [
  {
    id: "B-1001",
    initials: "AM",
    name: "Andi Maulana",
    type: "Mahasiswa",
    faculty: "Fakultas Rekayasa Industri",
    nim: "1202204012",
    status: "Aktif" as const,
    joinedDate: "10 Jan 2024",
    phone: "081234567890",
    email: "andi.maulana@student.umm.ac.id",
    bio: "Suka makan pedas.",
    gender: "Laki-laki",
    birthDate: "15-Aug-2002",
  },
  {
    id: "B-1002",
    initials: "BK",
    name: "Budi Kusuma",
    type: "Mahasiswa",
    faculty: "Fakultas Informatika",
    nim: "1301201100",
    status: "Nonaktif" as const,
    joinedDate: "12 Feb 2024",
    phone: "081234567891",
    email: "budi.kusuma@student.umm.ac.id",
    bio: "Penggemar kopi.",
    gender: "Laki-laki",
    birthDate: "20-Sep-2001",
  },
  {
    id: "B-1003",
    initials: "RF",
    name: "Ricky Febrian",
    type: "Non-Aktif",
    faculty: "Fakultas Ekonomi Bisnis",
    nim: "1402204421",
    status: "Libur" as const,
    joinedDate: "05 Mar 2024",
    phone: "081234567892",
    email: "ricky.febrian@student.umm.ac.id",
    bio: "Makan untuk hidup.",
    gender: "Laki-laki",
    birthDate: "05-May-2000",
  },
  {
    id: "B-1004",
    initials: "SP",
    name: "Siti Pertiwi",
    type: "Karyawan",
    faculty: "Bagian Administrasi Umum",
    nip: "1988010293",
    status: "Aktif" as const,
    joinedDate: "15 Mar 2024",
    phone: "081234567893",
    email: "siti.pertiwi@umm.ac.id",
    bio: "Vegetarian.",
    gender: "Perempuan",
    birthDate: "10-Oct-1988",
  },
  {
    id: "B-1005",
    initials: "DP",
    name: "Diana Putri",
    type: "Mahasiswa",
    faculty: "Fakultas Hukum",
    nim: "1505201033",
    status: "Aktif" as const,
    joinedDate: "20 Apr 2024",
    phone: "081234567894",
    email: "diana.putri@student.umm.ac.id",
    bio: "Suka kuliner nusantara.",
    gender: "Perempuan",
    birthDate: "22-Mar-2003",
  },
];

// ─── Sellers ────────────────────────────────────────────────────────────────
export const sellers = [
  {
    id: "SLR-202401",
    name: "Nasi Padang Bu Jamilah",
    owner: "Jamilah Ayu",
    status: "Aktif" as const,
    joinedDate: "12 Jan 2024",
    productCount: 12,
    salesCount: 2400,
    rating: 4.8,
    phone: "+62 852-XXXX-XX45",
    email: "jamilah@gmail.com",
    revenue: 1350000,
    topProduct: "Nasi Ayam Rendang",
  },
  {
    id: "SLR-202409",
    name: "Tahu Telur Bu Musdalipah",
    owner: "Musdalipah",
    status: "Libur" as const,
    joinedDate: "05 Feb 2024",
    productCount: 12,
    salesCount: 1900,
    rating: 4.7,
    phone: "+62 853-XXXX-XX21",
    email: "musdalipah@gmail.com",
    revenue: 950000,
    topProduct: "Nasi Tahu Telur",
  },
  {
    id: "SLR-202388",
    name: "Geprek Gepuk Terbakar",
    owner: "Sari Puspita",
    status: "Nonaktif" as const,
    joinedDate: "20 Nov 2023",
    productCount: 9,
    salesCount: 1900,
    rating: 4.7,
    phone: "+62 812-XXXX-XX88",
    email: "saripuspita@gmail.com",
    revenue: 600000,
    topProduct: "Ayam Sambalado",
  },
  {
    id: "SLR-202412",
    name: "Warung Mie Pak Darto",
    owner: "Darto Susilo",
    status: "Aktif" as const,
    joinedDate: "10 Mar 2024",
    productCount: 8,
    salesCount: 1650,
    rating: 4.5,
    phone: "+62 821-XXXX-XX77",
    email: "dartosusilo@gmail.com",
    revenue: 780000,
    topProduct: "Mie Goreng Spesial",
  },
];

// ─── Recent Activities ───────────────────────────────────────────────────────
export const recentActivities = [
  { id: 1, type: "seller_joined",  message: "Penjual baru bergabung: Earthy Elements", time: "Baru saja" },
  { id: 2, type: "transaction",    message: "Transaksi selesai: #ORD-90124",            time: "42 menit lalu" },
  { id: 3, type: "seller_joined",  message: "Penjual baru bergabung: Bu Rahma Catering", time: "2 jam lalu" },
  { id: 4, type: "transaction",    message: "Transaksi selesai: #ORD-90089",            time: "3 jam lalu" },
];

// ─── Transactions ────────────────────────────────────────────────────────────
export const transactions = [
  {
    id: "TRX-001",
    buyer: "Andi Maulana",
    seller: "Nasi Padang Bu Jamilah",
    product: "Nasi Ayam Rendang",
    price: 15000,
  },
  {
    id: "TRX-002",
    buyer: "Siti Pertiwi",
    seller: "Tahu Telur Bu Musdalipah",
    product: "Nasi Tahu Telur",
    price: 14000,
  },
  {
    id: "TRX-003",
    buyer: "Diana Putri",
    seller: "Geprek Gepuk Terbakar",
    product: "Ayam Sambalado",
    price: 15000,
  },
  {
    id: "TRX-004",
    buyer: "Ricky Febrian",
    seller: "Warung Mie Pak Darto",
    product: "Mie Goreng Spesial",
    price: 12000,
  },
  {
    id: "TRX-005",
    buyer: "Budi Kusuma",
    seller: "Nasi Padang Bu Jamilah",
    product: "Nasi Ayam Rendang",
    price: 15000,
  },
];

// ─── Summary ─────────────────────────────────────────────────────────────────
export const summaryData = {
  revenue: 142500000,
  totalBuyers: 1284,
  totalSellers: 10,
  totalProducts: 105,
  totalTransactions: 3242,
  mahasiswaPercentage: 75,
  mahasiswaCount: 942,
};

// ─── Laporan ─────────────────────────────────────────────────────────────────
export type LaporanTab = "Hari Ini" | "Minggu Ini" | "Bulan Ini";

export const laporanData: Record<LaporanTab, {
  transaksi: number; pendapatan: number; produkTerjual: number;
  pembeliAktif: number; penjualAktif: number;
  penjualTerlaris: string; produkTerlaris: string;
}> = {
  "Hari Ini": {
    transaksi: 100, pendapatan: 1325000, produkTerjual: 120,
    pembeliAktif: 58, penjualAktif: 10,
    penjualTerlaris: "Nasi Padang Bu Jamilah", produkTerlaris: "Nasi Ayam Rendang",
  },
  "Minggu Ini": {
    transaksi: 780, pendapatan: 7825000, produkTerjual: 610,
    pembeliAktif: 328, penjualAktif: 10,
    penjualTerlaris: "Nasi Padang Bu Jamilah", produkTerlaris: "Nasi Ayam Rendang",
  },
  "Bulan Ini": {
    transaksi: 19151, pendapatan: 20995000, produkTerjual: 1399,
    pembeliAktif: 1284, penjualAktif: 10,
    penjualTerlaris: "Nasi Padang Bu Jamilah", produkTerlaris: "Nasi Ayam Rendang",
  },
};
