importScripts(
   'https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js'
);

const version = '1.8.19.0';
console.log('Version', version);

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

workbox.precaching.cleanupOutdatedCaches();

