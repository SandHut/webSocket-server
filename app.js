require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Load PORT and DOMAIN_NAME from environment variables
const port = process.env.PORT || 8080;
const domainName = process.env.DOMAIN_NAME || '0.0.0.0';

// Serve the HTML page
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve the HTML page when the user accesses the root URL
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading HTML page');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

// Create WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });
const clients = [];

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Simulate client data
  const clientId = clients.length + 1;  // Assign unique client ID
  const clientLogo = `https://via.placeholder.com/100?text=Client+${clientId}`;  // Placeholder logo
  const welcomeMessage = `Welcome client ${clientId}!`;  // Example message

  // Send client data when a new client connects
  const clientData = {
    clientId: clientId,
    clientLogo: clientLogo,
    message: welcomeMessage
  };

  ws.send(JSON.stringify(clientData));

  clients.push(ws);

  // Broadcast to all clients
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received:', parsedMessage);

      // Broadcast the message to all clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);  // Send JSON string
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.splice(clients.indexOf(ws), 1);
    console.log(`Connected clients: ${clients.length}`);
  });
});

// Start the server
server.listen(port, domainName, () => {
  console.log(`Server running on http://${domainName}:${port}`);
});
