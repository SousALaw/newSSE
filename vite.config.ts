import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import dnsPrefetchPlugin from './plugins/vite-plugin-dns-prefetch'
// https://vitejs.dev/config/
const base = process.env.CF_PAGES ? '/' : '/new/'
export default defineConfig({
  base,
  plugins: [
    vue(),
    vueJsxPlugin(),
    UnoCSS(),
    // analyzer({
    //   analyzerMode: 'server', // 默认值，启动本地服务器
    //   openAnalyzer: true, // 自动打开浏览器
    //   analyzerPort: 8888, // 分析服务器端口
    // }),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/new/',
      srcDir: 'src',
      strategies: 'generateSW',
      manifest: {
        name: 'SSE MARKET',
        short_name: 'SSE',
        scope: `${base}`,
        start_url: `${base}`,
        display: 'fullscreen',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: `${base}android-chrome-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${base}android-chrome-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        // 开发环境是否开启 PWA
        enabled: false,
        type: 'module',
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: new RegExp(
              `^https://ssemarket\.cn${base}.*\.js$`,
            ),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: new RegExp(
              `^https://ssemarket\.cn${base}.*\.css$`,
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'css-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
        globPatterns: [],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
    dnsPrefetchPlugin({
      maxLinks: 5,
      exclude: ['localhost', '127.0.0.1', 'vuejs.org'],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }
          id = id.split('node_modules/')[1]

          if (id.includes('vue')) {
            return 'vue'
          }

          if (id.includes('markdown-it') || id.includes('dompurify') || id.includes('katex')) {
            return 'markdown'
          }

          // 不知道以后会不会换高亮包, 单独提出来吧
          if (id.includes('prismjs')) {
            return 'prismjs'
          }

          if (id.includes('crypto-js')) {
            return 'cryptoJs'
          }

          return 'vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
  },
})
