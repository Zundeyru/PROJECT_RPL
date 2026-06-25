self.addEventListener('push', function (event) {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Notifikasi Baru', body: event.data.text() };
    }

    const title = data.title || 'Pesanan Baru Masuk!';
    const options = {
      body: data.body || 'Anda memiliki pesanan baru, segera cek Dashboard.',
      icon: data.icon || '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      requireInteraction: true // Keeps the notification open until the user interacts with it
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/pesanan') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window to the orders page
      if (clients.openWindow) {
        return clients.openWindow('/pesanan');
      }
    })
  );
});
