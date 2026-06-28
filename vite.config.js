import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// The /lc-api proxy is what makes optional LeetCode account sync work in dev
// without a backend: browser → /lc-api/... → leetcode.com, with origin/referer
// rewritten so LeetCode accepts it and CORS never applies. The session cookie
// (if provided) arrives as x-lc-session / x-lc-csrf headers and is translated
// into a real Cookie header here — it never leaves your machine.
// `base` must match the GitHub Pages project path in production
// (https://angkoonhian.github.io/study-tracker/) so built asset URLs resolve.
// In dev we keep it at "/" so HMR and the /lc-api proxy work normally.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/study-tracker/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/lc-api': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/lc-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('referer', 'https://leetcode.com/problemset/all/')
            proxyReq.setHeader('origin', 'https://leetcode.com')
            const session = proxyReq.getHeader('x-lc-session')
            const csrf = proxyReq.getHeader('x-lc-csrf')
            if (session) {
              const cookie = csrf
                ? `LEETCODE_SESSION=${session}; csrftoken=${csrf}`
                : `LEETCODE_SESSION=${session}`
              proxyReq.setHeader('cookie', cookie)
              if (csrf) proxyReq.setHeader('x-csrftoken', csrf)
            }
            proxyReq.removeHeader('x-lc-session')
            proxyReq.removeHeader('x-lc-csrf')
          })
        },
      },
    },
  },
}))
