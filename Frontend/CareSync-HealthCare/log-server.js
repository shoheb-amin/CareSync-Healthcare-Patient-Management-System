import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Where frontend files are available:
// 1. Frontend directory: C:\Users\ASUS\Downloads\FrontEnd by anti\frontend
// 2. Workspace root directory: C:\Users\ASUS\Downloads\FrontEnd by anti
const FRONTEND_DIR = path.resolve(__dirname);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORT = 3002;

const server = http.createServer((req, res) => {
  // Enable CORS for all local origins (port 3001, port 5173, etc.)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url || '';

  if (
    (url === '/api/session-logs/save' || url === '/save' || url.startsWith('/api/session-logs')) &&
    req.method === 'POST'
  ) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const { filename, csvContent } = JSON.parse(body || '{}');
        const safeName = filename || `CareSync_Session_Log_${Date.now()}.csv`;
        const content = csvContent || '';

        // 1. Save directly in the frontend directory where frontend files are available
        const frontendPath = path.join(FRONTEND_DIR, safeName);
        fs.writeFileSync(frontendPath, content, 'utf8');

        // 2. Also save to root workspace directory
        const rootPath = path.join(ROOT_DIR, safeName);
        fs.writeFileSync(rootPath, content, 'utf8');

        // 3. Keep an up-to-date latest log file in frontend directory
        const latestFrontendPath = path.join(FRONTEND_DIR, 'CareSync_Latest_Session_Log.csv');
        fs.writeFileSync(latestFrontendPath, content, 'utf8');

        console.log(`[CareSync Logger] Automatically saved session log:`);
        console.log(`  -> ${frontendPath}`);
        console.log(`  -> ${rootPath}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            filename: safeName,
            savedPaths: [frontendPath, rootPath, latestFrontendPath],
          })
        );
      } catch (err) {
        console.error('[CareSync Logger] Save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (url === '/health' || url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'CareSync Host Session Logger', port: PORT }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CareSync Logger] Host session logger running on http://localhost:${PORT}`);
  console.log(`[CareSync Logger] Target frontend directory: ${FRONTEND_DIR}`);
  console.log(`[CareSync Logger] Target workspace directory: ${ROOT_DIR}`);
});
