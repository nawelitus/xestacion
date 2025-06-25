import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // <-- Importar Tailwind
import autoprefixer from 'autoprefixer' // <-- Importar Autoprefixer

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss, // <-- Usar Tailwind como plugin de PostCSS
        autoprefixer,
      ],
    },
  },
})