import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.png', 'logo-finoza-light.png'],
      manifest: {
        name: 'Finoza Personal Finance',
        short_name: 'Finoza',
        description: 'Personal Finance, Simplified',
        theme_color: '#1a2236',
        background_color: '#1a2236',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-finoza-light.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
