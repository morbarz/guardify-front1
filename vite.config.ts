import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirect API calls to your backend server
      '/users': 'http://localhost:3000',
      '/preferences': 'http://localhost:3000',
      '/schedule': 'http://localhost:3000',
      '/manage': 'http://localhost:3000',
    }
  }
});
