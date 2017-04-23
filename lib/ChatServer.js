class ChatServer {
    constructor({ io, userData }) {
        this.io = io;
        this.userData = userData;

        this.onConnection = this.onConnection.bind(this);
        // this.onMessage = this.onMessage.bind(this);

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
        return ({ userData }) => {
            if (userData.name.length > 3) {
                socket.emit('loginResult', { success: true });
                console.log(`${userData.name} connected`);
                socket.userData = userData;
            } else {
                socket.emit('loginResult', { error: true, errorMsg: 'Login too short!' });
            }
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
