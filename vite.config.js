import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Honor the port assigned by tooling (e.g. preview harness) via PORT env.
    port: Number(process.env.PORT) || 5173,
  },
})
