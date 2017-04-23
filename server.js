#!/usr/bin/env node
const config = require('./config/server.config');
const io = require('socket.io')(config.socketPort);
const ChatServer = require('./lib/ChatServer');
const Authenticator = require('./lib/DummyAuthenticator');

const authenticator = new Authenticator({
    danek: 'test',
    ala: 'test2',
});

const server = new ChatServer({ io, authenticator });
