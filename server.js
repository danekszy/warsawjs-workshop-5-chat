#!/usr/bin/env node
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
    socket.emit('message', { body: 'hello world' });
    console.log('Somebody connected');
    
    socket.on('message', (data) => {
        console.log(`Client: ${JSON.stringify(data)}`);
        const safeData = {
            name: data.userData.name,
            body: data.body
        }
        io.sockets.emit('broadcast', safeData);
    });
});
