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
        userData.name = user;
        userData.pass = pass;
        userData.isLoggedIn = true;
        rl.setPrompt(`✏️  ${userData.name} > `);
        initChatLogging();
        rl.prompt();
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

    rl.on('line', handleUserInput);
};

const authUser = (user, pass) => {
    return new Promise((resolve, reject) => {
        connection.emit('login', { name: user, pass });
        connection.on('loginResult', (result) => {
            if (result.success) resolve();
            else reject(result.errorMsg);
        });
    });
};

const initApp = () => {
    connection = socketClient(CLIENT_URL);

    connection.on('disconnect', () => {
        console.log('\n 🔥  Server disconnected');
    });

    connection.on('connect', () => {
        if (userData.isLoggedIn) {
            authUser(userData.name, userData.pass)
                .then(() => {
                    console.log(' ⚡️  Server reconnected');
                });
        } else {
            rl.question('Whats your name? \n', (name) => {
                rl.question('Password? \n', (pass) => {
                    authUser(name, pass)
                        .then(() => {
                            console.log(`👋  Hello ${name}!`);
                            PROMPT_COMMANDS.login(name, pass);
                        }, (error) => {
                            console.log(`Login failed. Error: ${error}`);
                            initApp();
                        });
                });
            });
        }
    });
};

initApp();
