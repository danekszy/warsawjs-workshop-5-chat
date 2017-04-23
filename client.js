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
    isLoggedIn: false,
};

const PROMPT_COMMANDS = {
    login: (user, pass) => {
        authUser(user, pass)
            .then(() => {
                userData.name = user;
                userData.pass = pass;
                userData.isLoggedIn = true;
                console.log(`👋  Hello ${user}!`);
                rl.setPrompt(`✏️  ${user} > `);
                initChatLogging();
                rl.prompt();
            }, (error) => {
                console.log(`❌  Login failed. Error: ${error}`);
                rl.prompt();
            });
    },
    register: (user, pass) => {
        connection.emit('register', { name: user, pass });
        connection.on('registerResult', (result) => {
            if (result.success) {
                console.log(`✅  User registered - 👋  Hello ${user}!`);
                userData.name = user;
                userData.pass = pass;
                userData.isLoggedIn = true;
                rl.setPrompt(`✏️  ${user} > `);
                initChatLogging();
                rl.prompt();
            } else {
                console.log(result.errorMsg);
            }
        });
    },
};

const writeLine = (line, ...args) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(util.format(line, ...args) + EOL);
};

const handleUserCommand = (line) => {
    const commandParts = line
        .slice(1)
        .split(' ')
        .filter((arg) => arg.length > 0);
    const commandName = commandParts[0];
    const commandArgs = commandParts.slice(1);
    const commandFn = PROMPT_COMMANDS[commandName];

    if (commandFn) {
        commandFn(...commandArgs);
    } else {
        console.log(`Invalid command ${commandName}`);
    }
};

const handleUserInput = (line) => {
    if (line.trim().length < 1) return rl.prompt();

    if (line.startsWith('/')) {
        handleUserCommand(line);
    } else {
        connection.emit('message', { message: line });
    }
    rl.prompt();
};

const initChatLogging = () => {
    connection.on('broadcast', (data) => {
        writeLine(`🗯  ${data.userName}: ${data.message}`);
        rl.prompt();
    });
};

const authUser = (user, pass) => (
    new Promise((resolve, reject) => {
        connection.emit('login', { name: user, pass });
        connection.on('loginResult', (result) => {
            if (result.success) resolve();
            else reject(result.errorMsg);
        });
    })
);

const initApp = () => {
    connection = socketClient(CLIENT_URL);

    connection.on('disconnect', () => {
        console.log('\n 🔥  Server disconnected');
    });

    connection.on('connect', () => {
        if (userData.isLoggedIn) {
            authUser(userData.name, userData.pass)
                .then(() => {
                    console.log('\n ⚡️  Server reconnected');
                });
        } else {
            console.log('Connected to server. What do you want to do?');

            return rl.on('line', handleUserInput);
            // rl.question('❔  Whats your name? \n', (name) => {
            //     rl.question('🔐  Password? \n', (pass) => {
            //         PROMPT_COMMANDS.login(name, pass);
            //     });
            // });
        }
    });
};

initApp();
