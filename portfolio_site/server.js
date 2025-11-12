const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  const cleanUrl = req.url.split('?')[0];
  let filePath = path.join(publicDir, cleanUrl === '/' ? 'index.html' : cleanUrl);

  fs.stat(filePath, (err, stat) => {
    if (err) {
      const fallback = path.join(publicDir, 'index.html');
      fs.readFile(fallback, (e2, content) => {
        if (e2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    const ext = path.extname(filePath).toLowerCase();
    const type = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (e3, content) => {
      if (e3) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': type });
        res.end(content);
      }
    });
  });
});

const port = parseInt(process.env.PORT, 10) || 3000;
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    const next = port + 1;
    server.listen(next, () => {
      console.log(`http://localhost:${next}`);
    });
  } else {
    throw err;
  }
});
server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

