const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Create a WebSocket server
const server = new WebSocket.Server({ port: 8000 });


console.log('WebSocket server started on ws://0.0.0.0:8000');

// Directory to store audio data
const audioDir = path.join(__dirname, 'audio_data');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
}

// Handle new connections
server.on('connection', (socket) => {
    console.log('New client connected.');

    // Create a file stream for saving binary data
    const fileStream = fs.createWriteStream(
        path.join(audioDir, `audio_${Date.now()}.raw`)
    );

    socket.on('message', (message, isBinary) => {
        if (isBinary) {
            console.log(`Received binary data: ${message.length} bytes`);
            // Write binary data to file
            fileStream.write(message);
        } else {
            console.log(`Received text message: ${message}`);
            try {
                const data = JSON.parse(message);
                console.log('Received JSON data:', data);
            } catch (error) {
                console.error('Error processing JSON message:', error);
            }
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected.');
        fileStream.end(); // Close the file stream
    });

    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});