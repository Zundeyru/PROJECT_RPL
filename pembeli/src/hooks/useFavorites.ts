import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kantin_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading favorites', err);
    }
  }, []);

  const toggleFavorite = (menuId: string) => {
    let nextFavorites: string[] = [];
    
    setFavorites((prev) => {
      if (prev.includes(menuId)) {
        nextFavorites = prev.filter(id => id !== menuId);
      } else {
        nextFavorites = [...prev, menuId];
      }
      return nextFavorites;
    });

    // Jalankan side-effect DI LUAR setState callback (karena setState callback harus pure)
    // Untuk memastikan kita menyimpan state terbaru, gunakan setTimeout agar state selesai diupdate, atau kita bisa simpan berdasarkan `favorites` versi saat ini di click handler.
    // Tetapi lebih aman mengambil nilai dari localStorage terlebih dahulu, memodifikasinya, menyimpannya, lalu men-set state.
    
    // Cara yang benar untuk side-effect synchronous:
    const stored = localStorage.getItem('kantin_favorites');
    let currentFavs: string[] = stored ? JSON.parse(stored) : [];
    
    if (currentFavs.includes(menuId)) {
      currentFavs = currentFavs.filter(id => id !== menuId);
    } else {
      currentFavs = [...currentFavs, menuId];
    }
    
    localStorage.setItem('kantin_favorites', JSON.stringify(currentFavs));
    
    // Dispatch a custom event so other components (like Beranda) can react immediately
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  const isFavorite = (menuId: string) => favorites.includes(menuId);

  // Listen to cross-component changes
  useEffect(() => {
    const handleFavoritesChanged = () => {
      const stored = localStorage.getItem('kantin_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    };

    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChanged);
  }, []);

  return { favorites, toggleFavorite, isFavorite };
}
