"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, X } from "lucide-react";
import { useSellerMenus } from '@/hooks/useApi';
import { api } from '@/services/api';
import { ProductSkeleton } from '@/components/Skeletons';

type Category = "Makanan" | "Minuman" | "Snack";

interface MenuItem {
  id: string;
  storeId: string;
  name: string;
  price: number;
  category: Category;
  isAvailable: boolean;  // standardized field
  image: string;
  description?: string;
}

export default function KelolaMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<Category, boolean>>({
    Makanan: true,
    Minuman: false,
    Snack: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Makanan" as Category,
    description: "",
    isAvailable: true,
    image: ""
  });
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('umm_active_user');
    if (!userStr) return;

    const u = JSON.parse(userStr);

    api.getStoreBySeller(u.id)
      .then(async (data) => {
        if (data) {
          // Toko sudah ada — langsung pakai
          setStoreId(data.id);
        } else {
          // Toko belum ada (mungkin gagal dibuat saat registrasi) → buat otomatis
          console.warn('Seller tidak punya toko → membuat toko otomatis...');
          const newStore = await api.createStore({
            sellerId: u.id,
            name: u.storeName || u.name || 'Toko Saya',
          });
          if (newStore?.id) setStoreId(newStore.id);
        }
      })
      .catch(err => console.error('getStoreBySeller error:', err));
  }, []);

  const { menus, isLoading, mutateMenus } = useSellerMenus(storeId);

  const toggleCategory = (cat: Category) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleStock = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    try {
      await api.updateMenu(item.id, { isAvailable: newStatus });
      mutateMenus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setFormData({ name: "", price: "", category: "Makanan", description: "", isAvailable: true, image: "" });
    setEditingMenuId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setFormData({
      name: item.name,
      price: (item.price || 0).toString(),
      category: item.category,
      description: item.description || "",
      isAvailable: item.isAvailable,
      image: item.image || ""
    });
    setEditingMenuId(item.id);
    setIsModalOpen(true);
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;
    try {
      await api.deleteMenu(id);
      mutateMenus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMenu = async () => {
    if (!storeId) {
      alert("Anda belum memiliki toko yang terdaftar!");
      return;
    }
    try {
      const payload = {
        storeId: storeId,
        name: formData.name,
        price: parseInt(formData.price) || 0,
        category: formData.category,
        description: formData.description,
        isAvailable: formData.isAvailable,
        image: formData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"
      };
      
      if (editingMenuId) {
        await api.updateMenu(editingMenuId, payload);
      } else {
        await api.createMenu(payload);
      }
      mutateMenus();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMenu = (menus || []).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories: Category[] = ["Makanan", "Minuman", "Snack"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-2xl shadow-sm border border-sidebar-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Cari Nama Menu"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background rounded-xl border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all text-text-primary"
          />
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl font-bold hover:bg-brand-hover transition-colors shadow-md shadow-brand/20"
        >
          <Plus size={20} className="stroke-[3]" />
          Tambahkan Menu
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const itemsInCategory = filteredMenu.filter(item => item.category === category);
          const isExpanded = expandedCategories[category];

          return (
            <div key={category} className="bg-surface rounded-2xl shadow-sm border border-sidebar-border overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-5 hover:bg-surface-hover transition-colors"
              >
                <h3 className="font-bold text-lg text-text-primary">{category}</h3>
                {isExpanded ? <ChevronUp className="text-brand" /> : <ChevronDown className="text-brand" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <ProductSkeleton />
                      <ProductSkeleton />
                    </div>
                  ) : itemsInCategory.length === 0 ? (
                    <p className="text-text-muted text-center py-4 italic">Tidak ada menu {category}</p>
                  ) : (
                    itemsInCategory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-sidebar-border/50 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-sidebar-border rounded-lg flex items-center justify-center text-text-muted overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={24} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary">{item.name}</h4>
                            <p className="text-brand font-semibold text-sm">Rp {(item.price || 0).toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${item.isAvailable ? "text-success" : "text-text-muted"} hidden sm:inline`}>
                            {item.isAvailable ? "Tersedia" : "Habis"}
                          </span>
                          <button
                            onClick={() => toggleStock(item)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${item.isAvailable ? "bg-success" : "bg-text-muted/30"}`}
                            title="Ubah Stok"
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${item.isAvailable ? "left-7" : "left-1"}`} />
                          </button>
                          
                          <div className="w-px h-6 bg-sidebar-border mx-1"></div>
                          
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-2 text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            title="Edit Menu"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMenu(item.id)}
                            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            title="Hapus Menu"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-brand p-5 flex items-center justify-between text-white">
              <h2 className="font-bold text-xl">{editingMenuId ? "Edit Menu" : "Tambah Menu"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between p-4 bg-background border border-sidebar-border border-dashed rounded-2xl">
                <div>
                  <h4 className="font-bold text-text-primary">Gambar</h4>
                  <p className="text-xs text-text-muted mt-1">Catatan : Rasio Gambar harus 1:1</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex flex-col items-center justify-center w-20 h-20 border border-sidebar-border rounded-xl text-brand hover:bg-brand-light transition-colors overflow-hidden group"
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={20} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus size={24} />
                      <span className="text-[10px] font-bold mt-1">Tambah<br/>Foto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-sidebar-border pb-2">
                  <span className="font-bold text-text-primary">Nama</span>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cth : Nasi Goreng" className="text-right focus:outline-none bg-transparent placeholder-text-muted text-text-primary" />
                </div>
                <div className="flex items-center justify-between border-b border-sidebar-border pb-2">
                  <span className="font-bold text-text-primary">Harga</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">Rp</span>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="15000" className="text-right w-24 focus:outline-none bg-transparent placeholder-text-muted text-text-primary" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-sidebar-border pb-2">
                  <span className="font-bold text-text-primary">Kategori</span>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="text-right focus:outline-none bg-transparent text-text-muted appearance-none cursor-pointer">
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div className="flex justify-between border-b border-sidebar-border pb-2">
                  <span className="font-bold text-text-primary mt-2">Deskripsi</span>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Cth : Nasi Goreng dengan cita rasa seperti dirumah" className="text-right resize-none focus:outline-none bg-transparent placeholder-text-muted text-text-primary w-2/3" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-text-primary">Ketersediaan Stok</span>
                  <div onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner ${formData.isAvailable ? 'bg-success' : 'bg-sidebar-border'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.isAvailable ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-sidebar-border bg-background">
              <button 
                onClick={handleSaveMenu}
                className="w-full py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-md transition-all"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
