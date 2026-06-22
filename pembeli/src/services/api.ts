import { supabase } from '../lib/supabase';

export const api = {
  // --- STORES ---
  async getStores() {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) throw new Error("Failed to fetch stores");
    return (data || []).map(s => ({ ...s, isOpen: s.is_open !== undefined ? s.is_open : true }));
  },

  async getStoreById(id: string) {
    const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
    if (error) throw new Error("Store not found");
    return { ...data, isOpen: data.is_open !== undefined ? data.is_open : true };
  },

  // --- MENUS ---
  async getMenusByStore(storeId: string) {
    const { data, error } = await supabase.from('menus').select('*').eq('storeid', storeId);
    if (error) throw new Error("Failed to fetch menus");
    return (data || []).map(m => ({ ...m, storeId: m.storeid, isAvailable: m.isavailable }));
  },

  async getAllMenus() {
    const { data, error } = await supabase.from('menus').select('*');
    if (error) throw new Error("Failed to fetch menus");
    return (data || []).map(m => ({ ...m, storeId: m.storeid, isAvailable: m.isavailable }));
  },

  async getMenuById(menuId: string) {
    const { data, error } = await supabase.from('menus').select('*').eq('id', menuId).single();
    if (error) throw new Error("Menu not found");
    return { ...data, storeId: data.storeid, isAvailable: data.isavailable };
  },

  // --- ORDERS ---
  async createOrder(order: any) {
    const uniqueId = Math.floor(Math.random() * 10000);
    const { data, error } = await supabase.from('orders').insert([{
      id: `ORD-${Date.now()}-${uniqueId}`,
      buyer_id: order.buyerId,
      buyer_name: order.buyerName,
      store_id: order.storeId,
      store_name: order.storeName,
      items: order.items,
      notes: order.notes,
      total_amount: order.totalAmount,
      status: order.status,
      service_method: order.serviceMethod,
      payment_method: order.paymentMethod,
      created_at: new Date().toISOString()
    }]).select();
    
    if (error) throw new Error("Failed to create order");
    return data ? data[0] : null;
  },

  async getOrdersByBuyer(buyerId: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('buyer_id', buyerId);
    if (error) throw new Error("Failed to fetch orders");
    return data || [];
  },

  async getAllOrders() {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw new Error("Failed to fetch orders");
    return data || [];
  },

  async validateCartPrices(cartItems: { menuId: string; qty: number }[]) {
    const validated = await Promise.all(
      cartItems.map(async (item) => {
        const menu = await this.getMenuById(item.menuId);
        return {
          menuId: menu.id,
          name: menu.name,
          qty: item.qty,
          priceAtTime: menu.price,
          isAvailable: menu.isAvailable
        };
      })
    );
    return validated;
  },

  // --- USERS ---
  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
    if (error) throw new Error("Failed to update profile");
    return data ? data[0] : null;
  }
};
