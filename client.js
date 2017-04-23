const CLIENT_URL = 'http://localhost:3000';

const socket = require('socket.io-client')(CLIENT_URL);

socket.on('message', (data) => {
    console.log(`Server says: ${JSON.stringify(data)}`);
});

socket.emit('pushback', { body: 'hello from client' });
