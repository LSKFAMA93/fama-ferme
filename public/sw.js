const CACHE_NAME = 'fama-ferme-shell-v1'
const appRoot = new URL('./', self.location.href)
const indexUrl = new URL('index.html', appRoot)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll([
        appRoot.href,
        new URL('manifest.webmanifest', appRoot).href,
        new URL('favicon.svg', appRoot).href,
      ])

      const indexResponse = await fetch(indexUrl)
      if (!indexResponse.ok) {
        throw new Error(`Impossible de mettre en cache la page d'accueil (${indexResponse.status})`)
      }

      const html = await indexResponse.clone().text()
      await cache.put(indexUrl, indexResponse)

      const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)]
        .map((match) => new URL(match[1], indexUrl).href)
      await cache.addAll(assets)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('fama-ferme-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const requestUrl = new URL(request.url)

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy))
          }
          return response
        })
        .catch(async () => {
          const cachedPage = await caches.match(request)
          return cachedPage || caches.match(indexUrl)
        })
    )
    return
  }

  if (requestUrl.pathname.startsWith(appRoot.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseCopy = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseCopy))
              .catch((error) => console.error('Erreur de mise en cache hors ligne', error))
          }
          return response
        })
      })
    )
  }
})
