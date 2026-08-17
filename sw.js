// Canon — minimal service worker.
// Intentionally does no caching: this app relies on live Gemini API calls
// and local IndexedDB, so there's nothing here worth caching offline.
// It exists purely so Android's install/WebAPK packaging step is satisfied.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if(event.request.method === 'POST' && url.pathname.endsWith('/share-target')){
    event.respondWith(handleShareTarget(event.request));
    return;
  }
  event.respondWith(fetch(event.request));
});

async function handleShareTarget(request){
  try{
    const formData = await request.formData();
    const file = formData.get('file');
    if(file){
      const cache = await caches.open('canon-share-cache');
      await cache.put('/shared-file', new Response(file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-Shared-Filename': file.name || ''
        }
      }));
    }
  }catch(e){
    // no-op — the app will just find nothing waiting and tell the user to try again
  }
  return Response.redirect('./canon.html?shared=file', 303);
}
