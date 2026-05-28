// Network-only service worker (Pamfilico PWA template — default)
const APP_VERSION = '{{APP_VERSION}}';
const CACHE_PREFIX = '{{CACHE_PREFIX}}';

console.log('[SW] Service worker loaded, version:', APP_VERSION);

// Optional push notifications — copy templates/sw-push-notifications.js.stub to public/sw-push-notifications.js
try {
  importScripts('/sw-push-notifications.js');
  console.log('[SW] Push notification module imported');
} catch (e) {
  console.log('[SW] Push notification module not loaded (optional)');
}

self.addEventListener('install', () => {
  console.log('[SW] Installing service worker version:', APP_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', APP_VERSION);
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(`${CACHE_PREFIX}-`) && !name.endsWith(APP_VERSION))
            .map((name) => caches.delete(name)),
        ),
      ),
      clients.claim(),
    ]),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_VERSION' && event.ports?.[0]) {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/version', {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) return false;
    const { version: serverVersion } = await response.json();
    if (serverVersion && serverVersion !== APP_VERSION) {
      console.log('[SW] New version available:', serverVersion);
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: 'AUTO_UPDATE', version: serverVersion });
      });
      self.skipWaiting();
      return true;
    }
  } catch (error) {
    console.error('[SW] Error checking for updates:', error);
  }
  return false;
}

setInterval(checkForUpdates, 30000);
self.addEventListener('activate', () => {
  checkForUpdates();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/version')) return;
  event.respondWith(fetch(event.request));
});
