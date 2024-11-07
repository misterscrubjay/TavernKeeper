const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 8001;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save_config') {
    // Handle the saving of the configuration
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const configData = JSON.parse(body);
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(configData, null, 2), (err) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Failed to save configuration');
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Configuration saved successfully');
          }
        });
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Invalid JSON data');
      }
    });
  } else {
    // Set up file path based on request
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
    // Determine content type based on file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';
  
    // Read the requested file from the file system
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File not found
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('404 Not Found');
        } else {
          // Server error
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Internal Server Error');
        }
      } else {
        // Successfully found the file, serve it
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(data);
      }
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});