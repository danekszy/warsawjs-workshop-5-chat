class ChatServer {
    constructor({ io, authenticator }) {
        this.io = io;
        this.authenticator = authenticator;

        this.onConnection = this.onConnection.bind(this);
        this.onLogin = this.onLogin.bind(this);

        this.initServer();
    }

    initServer() {
        const io = this.io;

        io.on('connection', this.onConnection);
    }

    onConnection(socket) {
        socket.emit('message', { body: 'hello world' });
        socket.on('login', this.onLogin(socket));
        socket.on('register', this.onRegister(socket));
        socket.on('message', this.onMessage(socket));
    }

    onLogin(socket) {
        return ({ name, pass }) => {
            this.authenticator.validate(name, pass)
                .then((isSuccess) => {
                    console.log('success?', isSuccess);
                    if (isSuccess) {
                        const io = this.io;
                        socket.emit('loginResult', { success: true });
                        socket.userData = { name, pass };
                        console.log(`${name} connected`);
                        const msgData = {
                            userName: 'Server',
                            message: `User ${name} joined`,
                        };
                        io.sockets.emit('broadcast', msgData);
                    } else {
                        socket.emit('loginResult', { error: true, errorMsg: 'Wrong login or pass' });
                    }
                });
        };
    }

    onRegister(socket) {
        return ({ name, pass }) => {
            this.authenticator.register(name, pass)
                .then((isSuccess) => {
                    if (isSuccess) {
                        socket.emit('registerResult', { success: true });
                        socket.userData = { name, pass };
                        console.log(`${name} registered`);
                    } else {
                        socket.emit('registerResult', { error: true, errorMsg: 'User already exists' });
                    }
                });
        };
    }

    onMessage(socket) {
        return (data) => {
            if (!socket.userData) return;
            const io = this.io;
            console.log(`Client ${socket.userData.name}: ${JSON.stringify(data)}`);
            const msgData = {
                message: data.message,
                userName: socket.userData.name,
            };
            io.sockets.emit('broadcast', msgData);
        };
    }
}

module.exports = ChatServer;
