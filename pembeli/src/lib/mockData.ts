export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  category: 'Makanan' | 'Minuman' | 'Snack';
  image: string;
  likes: number;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  isOpen: boolean;
}

export const stores: Store[] = [
  { id: 'S1', name: 'Nasi Padang Bu Jamilah', location: 'Kantin Bawah GKB 2 Lt.1', isOpen: true },
  { id: 'S2', name: 'Tahu Telur Bu Musdalipah', location: 'Kantin Tengah, Stand 4', isOpen: true },
  { id: 'S3', name: 'Geprek Gepuk Terbakar', location: 'Kantin Atas GKB 1', isOpen: true }
];

export const products: Product[] = [
  {
    id: 'P1', storeId: 'S1', name: 'Nasi Ayam Rendang', description: 'Nasi Ayam Rendang Yang Enak Sekali dari Padang',
    price: 15000, category: 'Makanan', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80', likes: 19
  },
  {
    id: 'P2', storeId: 'S1', name: 'Nasi Padang Ayam Goreng', description: 'Ayam goreng renyah bumbu padang',
    price: 15000, category: 'Makanan', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80', likes: 12
  },
  {
    id: 'P3', storeId: 'S1', name: 'Es Teh Manis', description: 'Es teh manis segar',
    price: 3000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', likes: 50
  },
  {
    id: 'P4', storeId: 'S2', name: 'Nasi Tahu Telur', description: 'Tahu telur bumbu kacang khas jawa timur',
    price: 14000, category: 'Makanan', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80', likes: 8
  },
  {
    id: 'P5', storeId: 'S3', name: 'Geprek Barbeque', description: 'Ayam geprek saus barbeque level 3',
    price: 15000, category: 'Makanan', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&q=80', likes: 25
  }
];

export const searchSuggestions = [
  "Ayam Geprek",
  "Lontong Balap",
  "Nasi Goreng",
  "Es Jeruk",
  "Soto Ayam"
];
