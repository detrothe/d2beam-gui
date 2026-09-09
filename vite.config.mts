import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import htmlMinifier from 'vite-plugin-html-minifier';

export default defineConfig({
  base: "/",
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    assetsDir: "code",
    target: ["esnext", "edge100", "firefox100", "chrome100", "safari18"],
  },
  plugins: [
    htmlMinifier({ minify: true }),

    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      manifest: {
        name: "D2Beam GUI",
        short_name: "D2Beam",
        start_url: "/",
        display: "standalone",
        background_color: "#f3f3f3",
        theme_color: "#f3f3f3",
        icons: [
          {
            src: "/icons/192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/maskable_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/apple-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html"
      },
      devOptions: {
        enabled: true
      }
    }),

    viteStaticCopy({
      targets: [
        { src: 'd2beam_wasm.*', dest: '.' },
        { src: 'src/info/Kurzdokumentation_deutsch.html', dest: '.' },
        { src: 'src/info/Kurzdokumentation_english.html', dest: '.' },
        { src: 'src/info/Kurzdokumentation_spanish.html', dest: '.' }
      ]
    })
  ]
});
