import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sessionLogPlugin() {
  const handler = (req, res, next) => {
    if ((req.url === '/api/session-logs/save' || req.url?.startsWith('/api/session-logs')) && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const { filename, csvContent } = JSON.parse(body || '{}');
          const frontendDir = path.resolve(__dirname);
          const rootDir = path.resolve(__dirname, '..');
          const safeName = filename || `CareSync_Session_Log_${Date.now()}.csv`;
          const content = csvContent || '';

          // 1. Save in frontend directory where frontend files are located
          const frontendPath = path.join(frontendDir, safeName);
          fs.writeFileSync(frontendPath, content, 'utf8');

          // 2. Also save to root workspace directory
          const rootPath = path.join(rootDir, safeName);
          fs.writeFileSync(rootPath, content, 'utf8');

          // 3. Keep latest session log in frontend directory
          const latestPath = path.join(frontendDir, 'CareSync_Latest_Session_Log.csv');
          fs.writeFileSync(latestPath, content, 'utf8');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, savedPaths: [frontendPath, rootPath, latestPath], filename: safeName }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
    next();
  };

  return {
    name: 'session-log-saver',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

const targetBackend = process.env.VITE_API_GATEWAY_URL || 'http://34.131.79.207:4004';

export default defineConfig({
  plugins: [react(), sessionLogPlugin()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/auth': {
        target: targetBackend,
        changeOrigin: true,
      },
      '/api': {
        target: targetBackend,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'charts';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react') || id.includes('axios')) return 'vendor';
          }
        },
      },
    },
  },
});
