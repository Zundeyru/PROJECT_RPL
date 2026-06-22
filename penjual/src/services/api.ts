import { supabase } from '../lib/supabase';

export const api = {
  // --- STORES ---
  async getStoreBySeller(sellerId: string) {
    const { data, error } = await supabase.from('stores').select('*').eq('ownerid', sellerId).limit(1).maybeSingle();
    if (error) throw new Error("Failed to fetch store");
    return data ? { 
      ...data, 
      isOpen: data.is_open !== undefined ? data.is_open : true,
      coverImage: data.cover_image 
    } : null;
  },

  async createStore({ sellerId, name }: { sellerId: string; name: string }) {
    const { data, error } = await supabase.from('stores').insert([{
      id: `STR-${Date.now()}`,
      ownerid: sellerId,
      name: name,
      is_open: true,
    }]).select().single();
    if (error) {
      console.error('createStore error:', error);
      throw new Error(`Failed to create store: ${error.message}`);
    }
    return data ? { ...data, isOpen: data.is_open !== undefined ? data.is_open : true, coverImage: data.cover_image } : null;
  },

  async updateStore(id: string, updates: any) {
    const toUpdate = { ...updates };
    if ('isOpen' in toUpdate) {
      toUpdate.is_open = toUpdate.isOpen;
      delete toUpdate.isOpen;
    }
    if ('coverImage' in toUpdate) {
      toUpdate.cover_image = toUpdate.coverImage;
      delete toUpdate.coverImage;
    }
    
    // Remove any undefined or invalid fields
    Object.keys(toUpdate).forEach(key => {
      if (toUpdate[key] === undefined) {
        delete toUpdate[key];
      }
    });

    const { data, error } = await supabase.from('stores').update(toUpdate).eq('id', id).select();
    if (error) {
      console.error('updateStore error:', error);
      throw new Error(`Failed to update store: ${error.message || 'Unknown error'}`);
    }
    return data && data.length > 0 ? { ...data[0], isOpen: data[0].is_open !== undefined ? data[0].is_open : true, coverImage: data[0].cover_image } : null;
  },

  async updateStorePushSubscription(id: string, subscription: any) {
    const { data, error } = await supabase.from('stores').update({ push_subscription: subscription }).eq('id', id).select();
    if (error) throw new Error("Failed to update push subscription");
    return data ? data[0] : null;
  },

  // --- USERS ---
  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
    if (error) throw new Error("Failed to update user profile");
    return data ? data[0] : null;
  },

  // --- MENUS ---
  async getMenusByStore(storeId: string) {
    const { data, error } = await supabase.from('menus').select('*').eq('storeid', storeId);
    if (error) throw new Error("Failed to fetch menus");
    return (data || []).map(m => ({ ...m, storeId: m.storeid, isAvailable: m.isavailable }));
  },

  async createMenu(menu: any) {
    const { storeId, isAvailable, description, ...rest } = menu;
    const toInsert = { 
      id: `MNU-${Date.now()}`,
      ...rest, 
      storeid: storeId, 
      isavailable: isAvailable 
    };
    const { data, error } = await supabase.from('menus').insert([toInsert]).select();
    if (error) {
      console.error("Supabase createMenu error:", error);
      throw new Error(`Failed to create menu: ${error.message}`);
    }
    return data ? { ...data[0], storeId: data[0].storeid, isAvailable: data[0].isavailable } : null;
  },

  async updateMenu(id: string, updates: any) {
    const { description, ...toUpdate } = updates;
    if ('storeId' in toUpdate) { toUpdate.storeid = toUpdate.storeId; delete toUpdate.storeId; }
    if ('isAvailable' in toUpdate) { toUpdate.isavailable = toUpdate.isAvailable; delete toUpdate.isAvailable; }

    const { data, error } = await supabase.from('menus').update(toUpdate).eq('id', id).select();
    if (error) {
      console.error("Supabase updateMenu error:", error);
      throw new Error(`Failed to update menu: ${error.message}`);
    }
    return data ? { ...data[0], storeId: data[0].storeid, isAvailable: data[0].isavailable } : null;
  },

  async deleteMenu(id: string) {
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (error) throw new Error("Failed to delete menu");
    return { success: true };
  },

  // --- ORDERS ---
  async getOrdersByStore(storeId: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('store_id', storeId);
    if (error) throw new Error("Failed to fetch orders");
    return data || [];
  },

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
    if (error) throw new Error("Failed to update order status");
    return data ? data[0] : null;
  }
};
