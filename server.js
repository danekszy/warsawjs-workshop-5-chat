#!/usr/bin/env node
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  socket.emit('message', { body: 'hello world' });
  socket.on('pushback', (data) => {
    console.log(`Client says: ${JSON.stringify(data)}`);
  });
});
