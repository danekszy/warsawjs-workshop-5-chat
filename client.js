const CLIENT_URL = 'http://localhost:3000';
const readline = require('readline');
const EOL = require('os').EOL;
const util = require('util');
const socketClient = require('socket.io-client');

let connection;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const userData = {
    name: null,
};

const writeLine = (line, ...args) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(util.format(line, ...args) + EOL);
};

const askForAMsg = () => {
    rl.prompt();
};

const initChatLogging = () => {
    connection.on('broadcast', (data) => {
        writeLine(`🗯  ${data.userName}: ${data.message}`);
        askForAMsg();
    });

    rl.on('line', (line) => {
        connection.emit('message', { message: line });

        rl.prompt();
    });
};

const initConnection = () => {
    connection = socketClient(CLIENT_URL);
    connection.emit('login', { userData });

    connection.on('loginResult', (result) => {
        if (result.success) {
            console.log(`👋  Hello ${userData.name}!`);
            rl.setPrompt('> ');
            initChatLogging();
            askForAMsg();
        } else {
            console.log(`Login failed. Error: ${result.errorMsg}`);
            initApp();
        }
    });
};

const initApp = () => {
    rl.question('Whats your name? \n', (name) => {
        userData.name = name;
        initConnection();
    });
};

initApp();
