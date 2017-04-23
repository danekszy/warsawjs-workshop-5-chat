const CLIENT_URL = 'http://localhost:3000';
const readline = require('readline');
const socketClient = require('socket.io-client');
let socket;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const userData = {
    name: null,
};

const askForAMsg = () => {
    rl.question(`${userData.name}: \n`, (body) => {
        socket.emit('message', { userData, body });

        askForAMsg();
    });
};

const initConnection = () => {
    socket = socketClient(CLIENT_URL);
    socket.on('broadcast', (data) => {
        console.log(`🗯 ${data.name}: ${data.body}`);
    });

    askForAMsg();
};

const initApp = () => {
    rl.question('Whats your name? \n', (name) => {
        userData.name = name;
        console.log(`Hello ${name}! 👋`);
        initConnection();
    });
};

initApp();
//   rl.close();
