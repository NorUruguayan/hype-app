// A super-light service worker just to enable installability.
// It doesn’t do aggressive caching yet; safe for dev.

self.addEventListener('install', () => {
  // Skip waiting so a fresh SW takes control immediately during dev.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Optional: very light network-first passthrough.
self.addEventListener('fetch', () => {
  // Intentionally no caching logic yet.
});