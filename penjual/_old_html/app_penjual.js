// =============================================================
// penjual/app_penjual.js — Seller Logic
// =============================================================

// UTILITIES
const CATEGORY_EMOJI = { 'Makanan': '🍛', 'Minuman': '🥤', 'Snack': '🍟', 'Lainnya': '📦' };
const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
const showToast = (message, type = 'success') => {
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = '0.4s'; setTimeout(() => toast.remove(), 400); }, 3200);
};
const openModal = (id) => { document.getElementById(id).style.display = 'flex'; };
const closeModal = (id) => { document.getElementById(id).style.display = 'none'; };
window.closeModal = closeModal;

const getOrderStatusClass = (status) => {
    const map = { 'Menunggu Konfirmasi': 'waiting', 'Diproses': 'process', 'Selesai': 'done', 'Dibatalkan': 'cancel' };
    return map[status] || 'waiting';
};

// CHECK AUTHENTICATION
const checkAuth = () => {
    const userStr = localStorage.getItem('umm_active_user');
    if (!userStr) { window.location.href = '../index.html'; return null; }
    const user = JSON.parse(userStr);
    if (user.role !== 'seller') { window.location.href = '../index.html'; return null; }
    
    document.getElementById('nav-user-name').textContent = user.name;
    document.getElementById('nav-user-role').textContent = 'Penjual';
    document.getElementById('nav-avatar').textContent = user.name.charAt(0).toUpperCase();
    return user;
};

const currentUser = checkAuth();

document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('umm_active_user');
    window.location.href = '../index.html';
});

// SELLER DASHBOARD
const renderSellerDashboard = () => {
    if (!currentUser) return;
    document.getElementById('seller-store-name').textContent = `🏪 ${currentUser.storeName || 'Toko Anda'}`;

    const menus  = Database.get('menus').filter(m => m.storeName === currentUser.storeName);
    const orders = Database.get('orders');
    const myOrders = orders.filter(o => o.storeName === currentUser.storeName);
    const newOrders = myOrders.filter(o => o.status === 'Menunggu Konfirmasi');

    // Badge
    const badge = document.getElementById('badge-orders');
    badge.textContent = newOrders.length;
    badge.style.display = newOrders.length > 0 ? 'inline-flex' : 'none';

    // Render Menu Grid
    const menuGrid = document.getElementById('seller-menu-grid');
    if (menus.length === 0) {
        menuGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-utensils"></i><p>Belum ada menu. Tambah menu pertama Anda!</p></div>`;
    } else {
        menuGrid.innerHTML = menus.map(m => `
            <div class="seller-menu-card">
                <div class="availability-toggle">
                    <label class="toggle-switch">
                        <input type="checkbox" ${m.isAvailable ? 'checked' : ''} onchange="toggleMenuAvailability(${m.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="seller-menu-category">${CATEGORY_EMOJI[m.category] || '📦'} ${m.category}</div>
                <div class="seller-menu-name">${m.name}</div>
                <div class="seller-menu-desc">${m.description || 'Tidak ada deskripsi'}</div>
                <div class="seller-menu-price">${formatRupiah(m.price)}</div>
                <div class="seller-menu-actions">
                    <button class="btn-sm-edit" onclick="openEditMenu(${m.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-sm-delete" onclick="deleteMenu(${m.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
    }

    // Pesanan Masuk
    const incomingEl = document.getElementById('seller-incoming-orders');
    if (newOrders.length === 0) {
        incomingEl.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>Tidak ada pesanan baru masuk</p></div>`;
    } else {
        incomingEl.innerHTML = newOrders.slice().reverse().map(o => `
            <div class="order-card">
                <div class="order-card-icon"><i class="fas fa-bell"></i></div>
                <div class="order-card-info">
                    <div class="order-card-id">${o.id}</div>
                    <div class="order-card-meta">Dari: <strong>${o.buyerUsername}</strong> &nbsp;|&nbsp; ${o.date}</div>
                </div>
                <div class="order-card-right">
                    <div class="order-card-total">${formatRupiah(o.totalAmount)}</div>
                    <span class="order-status waiting">${o.status}</span>
                    <div class="order-card-actions">
                        <button class="btn-detail" onclick="showOrderDetail('${o.id}')"><i class="fas fa-eye"></i> Detail</button>
                        <button class="btn-confirm" onclick="confirmOrder('${o.id}')"><i class="fas fa-check"></i> Konfirmasi</button>
                    </div>
                </div>
            </div>`).join('');
    }

    // Riwayat
    const historyEl = document.getElementById('seller-history-list');
    const doneOrders = myOrders.filter(o => o.status !== 'Menunggu Konfirmasi');
    if (doneOrders.length === 0) {
        historyEl.innerHTML = `<div class="empty-state"><i class="fas fa-history"></i><p>Belum ada riwayat transaksi</p></div>`;
    } else {
        historyEl.innerHTML = doneOrders.slice().reverse().map(o => `
            <div class="order-card">
                <div class="order-card-icon"><i class="fas fa-receipt"></i></div>
                <div class="order-card-info">
                    <div class="order-card-id">${o.id}</div>
                    <div class="order-card-meta">${o.buyerUsername} &nbsp;|&nbsp; ${o.date}</div>
                </div>
                <div class="order-card-right">
                    <div class="order-card-total">${formatRupiah(o.totalAmount)}</div>
                    <span class="order-status ${getOrderStatusClass(o.status)}">${o.status}</span>
                    <div class="order-card-actions">
                        <button class="btn-detail" onclick="showOrderDetail('${o.id}')"><i class="fas fa-eye"></i> Detail</button>
                        ${o.status === 'Diproses' ? `<button class="btn-confirm" onclick="markOrderDone('${o.id}')"><i class="fas fa-check-double"></i> Selesai</button>` : ''}
                    </div>
                </div>
            </div>`).join('');
    }
};

window.toggleMenuAvailability = (menuId, isAvailable) => {
    const menus = Database.get('menus');
    const idx = menus.findIndex(m => m.id === menuId);
    if (idx !== -1) {
        menus[idx].isAvailable = isAvailable;
        Database.set('menus', menus);
        showToast(isAvailable ? 'Menu diaktifkan.' : 'Menu dinonaktifkan.', isAvailable ? 'success' : 'warning');
    }
};

window.deleteMenu = (menuId) => {
    if (!confirm('Hapus menu ini?')) return;
    const menus = Database.get('menus').filter(m => m.id !== menuId);
    Database.set('menus', menus);
    showToast('Menu dihapus.', 'warning');
    renderSellerDashboard();
};

window.openEditMenu = (menuId) => {
    const menus = Database.get('menus');
    const m = menus.find(x => x.id === menuId);
    if (!m) return;
    document.getElementById('modal-menu-title').textContent = 'Edit Menu';
    document.getElementById('menu-edit-id').value = m.id;
    document.getElementById('input-menu-name').value = m.name;
    document.getElementById('input-menu-price').value = m.price;
    document.getElementById('input-menu-desc').value = m.description;
    document.getElementById('input-menu-category').value = m.category;
    openModal('modal-add-menu');
};

document.getElementById('btn-add-menu')?.addEventListener('click', () => {
    document.getElementById('modal-menu-title').textContent = 'Tambah Menu';
    document.getElementById('form-add-menu').reset();
    document.getElementById('menu-edit-id').value = '';
    openModal('modal-add-menu');
});

document.getElementById('form-add-menu')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('menu-edit-id').value;
    const name = document.getElementById('input-menu-name').value;
    const price = parseInt(document.getElementById('input-menu-price').value);
    const desc = document.getElementById('input-menu-desc').value;
    const cat = document.getElementById('input-menu-category').value;

    const menus = Database.get('menus');
    if (id) {
        const idx = menus.findIndex(m => m.id == id);
        if (idx !== -1) {
            menus[idx].name = name;
            menus[idx].price = price;
            menus[idx].description = desc;
            menus[idx].category = cat;
            showToast('Menu berhasil diperbarui!');
        }
    } else {
        const newMenu = new Menu(Date.now(), name, price, desc, currentUser.storeName, cat);
        menus.push(newMenu);
        showToast('Menu baru ditambahkan!');
    }
    
    Database.set('menus', menus);
    closeModal('modal-add-menu');
    renderSellerDashboard();
});

window.confirmOrder = (orderId) => {
    const orders = Database.get('orders');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = 'Diproses';
        Database.set('orders', orders);
        showToast('✅ Pesanan dikonfirmasi dan sedang diproses!');
        renderSellerDashboard();
    }
};

window.markOrderDone = (orderId) => {
    const orders = Database.get('orders');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = 'Selesai';
        Database.set('orders', orders);
        showToast('🎉 Pesanan ditandai selesai!');
        renderSellerDashboard();
    }
};

window.showOrderDetail = (orderId) => {
    const o = Database.get('orders').find(x => x.id === orderId);
    if (!o) return;
    const itemsHtml = o.items.map(i =>
        `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <span>${i.menu?.name || i.menu} x${i.quantity}</span>
            <strong>${formatRupiah(i.menu?.price * i.quantity || 0)}</strong>
        </div>`).join('');
    document.getElementById('modal-order-content').innerHTML = `
        <div style="margin-bottom:16px;">
            <p style="font-size:0.8rem;color:var(--text-muted);">ID Pesanan</p>
            <strong>${o.id}</strong>
        </div>
        <div style="margin-bottom:16px;">
            <p style="font-size:0.8rem;color:var(--text-muted);">Pembeli</p>
            <strong>${o.buyerUsername}</strong>
        </div>
        <div style="margin-bottom:16px;">
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Item Pesanan</p>
            ${itemsHtml}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:2px dashed var(--border);">
            <span>Total</span>
            <strong style="color:var(--primary);font-size:1.2rem;">${formatRupiah(o.totalAmount)}</strong>
        </div>`;
    openModal('modal-order-detail');
};

// Seller tabs
document.querySelectorAll('[data-seller-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-seller-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel[id^="seller-tab-"]').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.sellerTab).classList.add('active');
    });
});

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) renderSellerDashboard();
});
