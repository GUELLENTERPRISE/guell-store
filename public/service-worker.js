const CACHE_NAME = 'guell-v1';
const STATIC_CACHE = 'guell-static-v1';
const DYNAMIC_CACHE = 'guell-dynamic-v1';
const RUNTIME_CACHE = 'guell-runtime-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png',
  // Add other static assets
];

const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STATIC_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== RUNTIME_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for our API)
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
      return await handleAPIRequest(request);
    }
    
    // Handle static assets
    if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
      return await handleStaticRequest(request);
    }
    
    // Handle dynamic content
    return await handleDynamicRequest(request);
    
  } catch (error) {
    console.error('Service Worker: Error handling request:', error);
    return await handleOfflineRequest(request);
  }
}

async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseClone = response.clone();
      cache.put(request, responseClone);
      
      return response;
    } else {
      // If network fails, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw new Error('API request failed and no cache available');
    }
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache:', error.message);
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for specific API endpoints
    return getAPIFallback(request);
  }
}

async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE);
      const responseClone = response.clone();
      cache.put(request, responseClone);
      
      return response;
    }
    
    throw new Error('Static asset not found');
  } catch (error) {
    console.log('Service Worker: Static asset request failed:', error.message);
    
    // Return offline fallback
    return new Response('Offline - Asset not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function handleDynamicRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseClone = response.clone();
      cache.put(request, responseClone);
      
      return response;
    }
    
    throw new Error('Dynamic request failed');
  } catch (error) {
    console.log('Service Worker: Dynamic request failed, trying cache:', error.message);
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add offline indicator
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Offline-Cache', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }
    
    // Return offline page
    return caches.match('/') || new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function handleOfflineRequest(request) {
  const url = new URL(request.url);
  
  // Try to serve from cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return appropriate fallback
  if (url.pathname.startsWith('/api/')) {
    return getAPIFallback(request);
  }
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return caches.match('/') || new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
  
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

function getAPIFallback(request) {
  const url = new URL(request.url);
  
  // Return mock data for specific API endpoints
  switch (url.pathname) {
    case '/api/food/menu':
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    case '/api/food/cart':
      return new Response(JSON.stringify({ items: [], total: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    case '/api/food/merchants':
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    default:
      return new Response(JSON.stringify({ 
        error: 'Offline - API not available',
        offline: true 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event:', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
  
  if (event.tag === 'background-sync-ratings') {
    event.waitUntil(syncOfflineRatings());
  }
  
  if (event.tag === 'background-sync-profile') {
    event.waitUntil(syncOfflineProfile());
  }
});

async function syncOfflineOrders() {
  try {
    const db = await openIndexedDB();
    const orders = await getAllFromStore(db, 'offlineOrders');
    
    for (const order of orders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.data)
        });
        
        if (response.ok) {
          await deleteFromStore(db, 'offlineOrders', order.id);
          console.log('Service Worker: Order synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

async function syncOfflineRatings() {
  try {
    const db = await openIndexedDB();
    const ratings = await getAllFromStore(db, 'offlineRatings');
    
    for (const rating of ratings) {
      try {
        const response = await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rating.data)
        });
        
        if (response.ok) {
          await deleteFromStore(db, 'offlineRatings', rating.id);
          console.log('Service Worker: Rating synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync rating:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

async function syncOfflineProfile() {
  try {
    const db = await openIndexedDB();
    const profiles = await getAllFromStore(db, 'offlineProfiles');
    
    for (const profile of profiles) {
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile.data)
        });
        
        if (response.ok) {
          await deleteFromStore(db, 'offlineProfiles', profile.id);
          console.log('Service Worker: Profile synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync profile:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// IndexedDB helper functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('guell-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offlineOrders')) {
        db.createObjectStore('offlineOrders', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('offlineRatings')) {
        db.createObjectStore('offlineRatings', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('offlineProfiles')) {
        db.createObjectStore('offlineProfiles', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received:', event);
  
  const options = {
    body: 'You have a new order update!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Order',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('GÜELL - Order Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/food/orders')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync event:', event.tag);
    
    if (event.tag === 'periodic-sync-data') {
      event.waitUntil(syncPeriodicData());
    }
  });
}

async function syncPeriodicData() {
  try {
    // Sync cached data periodically
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch (error) {
          console.log('Service Worker: Failed to sync periodic data:', error.message);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Periodic sync failed:', error);
  }
}
