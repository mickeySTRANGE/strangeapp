self.addEventListener("message", (event) => {
    const promiseChain = self.registration.showNotification(
        "ステップタイマー",
        {
            body: event.data
        });
    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
});
