// src/services/providers/provider1.js

class Provider1 {
    constructor() {
        this.name = 'Provider1';
    }

    async send(email) {
        if (Math.random() < 0.3) {
            throw new Error(`Provider ${this.name} failed to send email.`);
        }
        console.log(`Provider ${this.name} sent email to ${email.to}`);
    }
}

module.exports = { Provider1 };
