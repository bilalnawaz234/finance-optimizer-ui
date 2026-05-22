import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- Swapped to the correct official package name

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})