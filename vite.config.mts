import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import htmlMinifier from 'vite-plugin-html-minifier';
import fs from 'fs';
import path from 'path';
import { minify } from 'html-minifier-terser';

const minifyOnlyPublicHtml = () => ({
  name: 'minify-only-public-html',
  // Fügen Sie hier die optionalen Parameter hinzu, die Rollup/Vite erwartet
  async closeBundle(this: any) {
    const publicDir = path.resolve(__dirname, 'public');
    const distDir = path.resolve(__dirname, 'dist');

    const processDirectory = async (currentDistDir: string): Promise<void> => {
      if (!fs.existsSync(currentDistDir)) return;
      const files = fs.readdirSync(currentDistDir);

      for (const file of files) {
        const distFilePath = path.join(currentDistDir, file);
        const stat = fs.statSync(distFilePath);

        if (stat.isDirectory()) {
          await processDirectory(distFilePath);
        } else if (file.endsWith('.html')) {
          const relativePath = path.relative(distDir, distFilePath);
          const originalPublicPath = path.join(publicDir, relativePath);

          if (fs.existsSync(originalPublicPath)) {
            const html = fs.readFileSync(distFilePath, 'utf-8');
            const minifiedHtml = await minify(html, {
              collapseWhitespace: true,
              removeComments: true,
              minifyJS: true,
              minifyCSS: true
            });
            fs.writeFileSync(distFilePath, minifiedHtml, 'utf-8');
            console.log(`✓ Minified public HTML: ${relativePath}`);
          }
        }
      }
    };

    await processDirectory(distDir);
  }
});

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
    minifyOnlyPublicHtml(),

    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      manifest: {
        name: "D2Beam GUI",
        short_name: "d2beam gui",
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
            src: "/icons/maskable_568.png",
            sizes: "568x568",
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
        ],
        // optional
        screenshots: [
          {
            src: "/assets/screenshots/screen.png",
            sizes: "1570x790",
            type: "image/png"
          }
        ],

        // sinnvoll
        shortcuts: [
          {
            name: "Open About",
            short_name: "About",
            description: "Open the about page",
            url: "/about",
            icons: [
              { src: "/assets/icons/192x192.png", sizes: "192x192" }
            ]
          }
        ],

        // sehr sinnvoll, wenn deine App Dateien öffnet
        file_handlers: [
          {
            action: "/openFile",
            accept: {
              "text/*": [".d2beam"]
            }
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
        enabled: true,
        type: 'module'
      }
    }),

    viteStaticCopy({
      targets: [
        { src: 'd2beam_wasm.*', dest: '.' }

      ]
    })
  ]
});
