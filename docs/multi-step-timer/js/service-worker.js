self.addEventListener("message", (event) => {
    const promiseChain = self.registration.showNotification(
        "test message"
    );
    event.waitUntil(promiseChain);
    if (event.data) {

    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function () {
        if (clients.openWindow)
            return clients.openWindow('/');
    }));
});
