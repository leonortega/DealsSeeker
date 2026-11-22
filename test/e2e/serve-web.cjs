// Minimal static server for the Expo web export used by the E2E suite.
const http = require('http');
const fs = require('fs');
const path = require('path');

const builtWeb = path.resolve(__dirname, '.artifacts/web');
const fallbackWeb = path.resolve(__dirname, '../../src/DealsSeeker.ReactNative/dist');
const root = fs.existsSync(path.join(builtWeb, 'index.html')) ? builtWeb : fallbackWeb;
const port = Number(process.env.E2E_WEB_PORT || 8081);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
};

http
  .createServer((request, response) => {
    const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
    let filePath = path.join(root, pathname);

    if (!filePath.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(root, 'index.html');
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, { 'Content-Type': mime[extension] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  })
  .listen(port, () => console.log(`E2E web server listening on http://localhost:${port}`));
