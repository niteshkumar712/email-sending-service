// src/services/providers/provider2.js

class Provider2 {
    constructor() {
        this.name = 'Provider2';
    }

    async send(email) {
        if (Math.random() < 0.7) {
            throw new Error(`Provider ${this.name} failed to send email.`);
        }
        console.log(`Provider ${this.name} sent email to ${email.to}`);
    }
}

module.exports = { Provider2 };
