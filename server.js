const WebSocket = require('ws');
const express = require('express');
const app = express();

// Create an HTTP server using Express
const server = app.listen(8080, () => {
    console.log('HTTP Server running on port 8080');
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Handle new WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('New client connected');
    clients.add(ws);

    // Send welcome message to the connected client
    ws.send(JSON.stringify({
        type: 'system',
        message: 'Welcome to the WebSocket server!'
    }));

    // Handle messages from this client
    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);

            // Broadcast the message to all connected clients
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'broadcast',
                        message: data.message,
                        timestamp: new Date().toISOString()
                    }));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', function close() {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
        clients.delete(ws);
    });
});

// Broadcast a message every 5 seconds (for testing)
setInterval(() => {
    const message = {
        type: 'server-broadcast',
        message: 'Server broadcast message',
        timestamp: new Date().toISOString()
    };

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}, 5000);

// Basic HTTP endpoint to check server status
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        connections: clients.size
    });
});