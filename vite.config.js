import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Beim Produktions-Build wird die Seite unter /Lighttravel/ (GitHub Pages)
// ausgeliefert; im Dev-Server bleibt der Root-Pfad.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Lighttravel/' : '/',
  plugins: [react()],
}))
