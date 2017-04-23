class DummyAuthenticator {
    constructor(users) {
        this.userPasswords = new Map();

        Object.keys(users).forEach((login) => {
            this.userPasswords.set(login, users[login]);
        }, this);
    }

    validate(login, pass) {
        if (this.userPasswords.has(login) && this.userPasswords.get(login) === pass) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}

module.exports = DummyAuthenticator;
