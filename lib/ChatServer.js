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
        socket.on('message', this.onMessage(socket));
    }

    onLogin(socket) {
        return ({ name, pass }) => {
            this.authenticator.validate(name, pass)
                .then((isSuccess) => {
                    if (isSuccess) {
                        socket.emit('loginResult', { success: true });
                        socket.userData = { name, pass };
                        console.log(`${name} connected`);
                    } else {
                        socket.emit('loginResult', { error: true, errorMsg: 'Wrong login or pass' });
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
            }
            io.sockets.emit('broadcast', msgData);
        }
    }
}

module.exports = ChatServer;
