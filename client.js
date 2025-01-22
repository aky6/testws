const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8080');

// Handle connection open
ws.on('open', function open() {
    console.log('Connected to WebSocket server');

    // Send a test message
    const message = {
        type: 'client-message',
        message: 'Hello from client!'
    };
    ws.send(JSON.stringify(message));

    // Send a message every 3 seconds
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const message = {
                type: 'client-message',
                message: 'Periodic message from client',
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(message));
        }
    }, 3000);
});

// Handle incoming messages
ws.on('message', function incoming(data) {
    try {
        const message = JSON.parse(data);
        console.log('Received:', message);

        // Handle different message types
        switch (message.type) {
            case 'system':
                console.log('System message:', message.message);
                break;
            case 'broadcast':
                console.log('Broadcast message:', message.message);
                break;
            case 'server-broadcast':
                console.log('Server broadcast:', message.message);
                break;
            default:
                console.log('Unknown message type:', message);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Handle connection close
ws.on('close', function close() {
    console.log('Disconnected from server');
});

// Handle errors
ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

// Handle process termination
process.on('SIGINT', function() {
    ws.close();
    process.exit();
});