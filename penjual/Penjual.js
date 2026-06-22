// =============================================================
// penjual/Penjual.js
// =============================================================

class Seller extends User {
    constructor(username, password, name, storeName) {
        super(username, password, name, 'seller');
        this.storeName = storeName;
    }
}
