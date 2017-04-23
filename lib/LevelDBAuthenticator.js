const bcrypt = require('bcrypt');

class LevelDBAuthenticator {
    constructor(dbPath, salt) {
        this.db = require('then-levelup')(require('level')(dbPath));
        this.salt = salt;
    }

    validate(login, pass) {
        return new Promise((resolve) => {
            this.db.get(login)
                .then((result) => {
                    const userData = JSON.parse(result);
                    bcrypt.compare(pass, userData.hash, (err, res) => {
                        if (!err && res) resolve(true);
                        else resolve(false);
                    });
                })
                .catch(() => resolve(false));
        });
    }

    register(login, pass) {
        return new Promise((resolve) => {
            this.db.get(login)
                .then(() => {
                    console.log('user exists');
                    resolve(false);
                }, () => {
                    bcrypt.hash(pass, this.salt, (err, hash) => {
                        const userData = { hash, salt: this.salt };

                        this.db.put(login, JSON.stringify(userData))
                            .then(() => {
                                resolve(true);
                            })
                            .catch(() => {
                                resolve(false);
                            });
                    });
                });
        });
    }
}

module.exports = LevelDBAuthenticator;
