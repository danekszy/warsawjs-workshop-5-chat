#!/usr/bin/env node
const config = require('./config/server.config');
const io = require('socket.io')(config.socketPort);
const ChatServer = require('./lib/ChatServer');

const server = new ChatServer({ io });
