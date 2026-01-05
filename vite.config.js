import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import postcss from './postcss.config.js'
import plugins from './vite.config.plugins.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const targetUrl = env.VITE_API_TARGET_URL || 'http://221.180.19.170:35004'

  return {
    base: './',

    server: {
      port: 1045,
      cors: true,
      proxy: {
        '/socket.io': {
          target: targetUrl,
          changeOrigin: true,
          ws: true,
          rewrite: path => path,
        },
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          rewrite: path => path,
        },
      },
    },

    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@root': path.resolve('./'),
      },
    },

    css: {
      postcss,
    },

    define: {
      'process.env': env,
    },

    plugins: plugins({ env }),
  }
})
