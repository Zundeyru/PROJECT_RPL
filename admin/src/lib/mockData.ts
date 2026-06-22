// src/lib/mockData.ts
export type Role = "admin" | "seller" | "buyer";
export type Status = "aktif" | "nonaktif" | "libur";

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  status: Status;
  joinDate: string;
  phone: string;
  email: string;
  // Khusus Pembeli
  nim?: string;
  faculty?: string;
  gender?: "Laki-laki" | "Perempuan";
  birthDate?: string;
  // Khusus Penjual
  storeName?: string;
  totalProducts?: number;
  totalSales?: string;
}

export interface Transaction {
  id: string;
  buyerName: string;
  storeName: string;
  product: string;
  price: number;
  date: string;
}

// Initial Mock Data
export const initialUsers: User[] = [
  // PEMBELI
  {
    id: "BYR-001",
    username: "andi123",
    name: "Andi Maulana",
    role: "buyer",
    status: "aktif",
    joinDate: "12 Jan 2024",
    phone: "081234567890",
    email: "andi@student.umm.ac.id",
    nim: "1202204012",
    faculty: "Fakultas Rekayasa Industri",
    gender: "Laki-laki",
    birthDate: "15-May-2002",
  },
  {
    id: "BYR-002",
    username: "budi_kusuma",
    name: "Budi Kusuma",
    role: "buyer",
    status: "aktif",
    joinDate: "05 Feb 2024",
    phone: "081298765432",
    email: "budi@student.umm.ac.id",
    nim: "1202201100",
    faculty: "Fakultas Informatika",
    gender: "Laki-laki",
    birthDate: "10-Aug-2001",
  },
  {
    id: "BYR-003",
    username: "rizky_f",
    name: "Rizky Febrian",
    role: "buyer",
    status: "nonaktif",
    joinDate: "20 Mar 2024",
    phone: "085612345678",
    email: "rizky@student.umm.ac.id",
    nim: "1202204421",
    faculty: "Fakultas Ekonomi Bisnis",
    gender: "Laki-laki",
    birthDate: "22-Nov-2000",
  },
  {
    id: "BYR-004",
    username: "siti_pertiwi",
    name: "Siti Pertiwi",
    role: "buyer",
    status: "aktif",
    joinDate: "10 Apr 2024",
    phone: "081987654321",
    email: "siti@staff.umm.ac.id",
    nim: "1502010293",
    faculty: "Bagian Administrasi Umum",
    gender: "Perempuan",
    birthDate: "05-Dec-1995",
  },
  // PENJUAL
  {
    id: "SLR-202401",
    username: "jamilah_ayu",
    name: "Jamilah Ayu",
    role: "seller",
    status: "aktif",
    joinDate: "12 Jan 2024",
    phone: "+62 852 1234 5678",
    email: "jamilahayy@gmail.com",
    storeName: "Nasi Padang Bu Jamilah",
    totalProducts: 12,
    totalSales: "2.4k",
  },
  {
    id: "SLR-202409",
    username: "mudalipah",
    name: "Mudalipah",
    role: "seller",
    status: "libur",
    joinDate: "05 Feb 2024",
    phone: "+62 813 9876 5432",
    email: "tahutelor_mud@gmail.com",
    storeName: "Tahu Telur Bu Musdalipah",
    totalProducts: 8,
    totalSales: "1.9k",
  },
  {
    id: "SLR-202388",
    username: "sari_puspita",
    name: "Sari Puspita",
    role: "seller",
    status: "aktif",
    joinDate: "20 Nov 2023",
    phone: "+62 856 5555 1234",
    email: "ayamgepuk_sari@gmail.com",
    storeName: "Geprek Gepuk Terbakar",
    totalProducts: 9,
    totalSales: "1.2k",
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: "TRX-001",
    buyerName: "Andi Maulana",
    storeName: "Nasi Padang Bu Jamilah",
    product: "Nasi Ayam Rendang",
    price: 15000,
    date: "2024-06-21T08:30:00",
  },
  {
    id: "TRX-002",
    buyerName: "Siti Pertiwi",
    storeName: "Tahu Telur Bu Musdalipah",
    product: "Nasi Tahu Telur",
    price: 14000,
    date: "2024-06-21T09:15:00",
  },
  {
    id: "TRX-003",
    buyerName: "Budi Kusuma",
    storeName: "Geprek Gepuk Terbakar",
    product: "Ayam Sambalado",
    price: 15000,
    date: "2024-06-21T10:05:00",
  },
];

// Helper to get from localstorage or use initial
export function getMockUsers(): User[] {
  if (typeof window === "undefined") return initialUsers;
  const stored = localStorage.getItem("umm_mock_users");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("umm_mock_users", JSON.stringify(initialUsers));
  return initialUsers;
}

export function saveMockUsers(users: User[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("umm_mock_users", JSON.stringify(users));
  }
}
