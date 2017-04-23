#!/usr/bin/env node
const config = require('./config/server.config');
const io = require('socket.io')(config.socketPort);
const ChatServer = require('./lib/ChatServer');
const Authenticator = require('./lib/LevelDBAuthenticator');

const DB_PATH = './users.db';
const SALT = '$2a$10$9W33LDfmX4Ow/5PrAj3Zcu';

const authenticator = new Authenticator(DB_PATH, SALT);

const server = new ChatServer({ io, authenticator });
