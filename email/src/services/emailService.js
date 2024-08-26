// src/services/emailService.js

const { Provider1 } = require('./providers/Provider1');
const { Provider2 } = require('./providers/provider2');
const { Logger } = require('../utils/logger');

class EmailService {
    constructor(providers) {
        this.providers = providers;
        this.maxRetries = 3;
        this.retryDelay = 1000; // Initial retry delay in ms
        this.rateLimit = 10; // Max emails per minute
        this.sentEmails = new Set(); // Store sent email ids for idempotency
        this.queue = [];
        this.emailAttempts = {};
        this.circuitBreakerThreshold = 5; // Threshold for circuit breaker
        this.circuitBreakerOpened = false;
        this.failedAttempts = 0; // Track consecutive failures
    }

    async sendEmail(email) {
        if (this.sentEmails.has(email.id)) {
            Logger.log(`Email with ID ${email.id} already sent.`);
            return;
        }

        if (this.queue.length >= this.rateLimit) {
            Logger.log('Rate limit exceeded. Email queued.');
            this.queue.push(email);
            return;
        }

        if (this.circuitBreakerOpened) {
            Logger.log('Circuit breaker is open. Aborting email send.');
            return;
        }

        this.queue.push(email);
        await this.processQueue();
    }

    async processQueue() {
        while (this.queue.length > 0) {
            const email = this.queue.shift();
            const status = await this.attemptToSendEmail(email);
            this.emailAttempts[email.id] = status;
            if (status.success) {
                this.sentEmails.add(email.id);
            } else {
                this.queue.push(email);
            }
        }
    }

    async attemptToSendEmail(email) {
        let attempt = 0;
        let lastError;

        for (let provider of this.providers) {
            while (attempt < this.maxRetries) {
                try {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                    await provider.send(email);
                    Logger.log(`Email sent successfully with provider ${provider.name}.`);
                    return { success: true, provider: provider.name, attempt: attempt + 1 };
                } catch (error) {
                    lastError = error;
                    Logger.log(`Attempt ${attempt + 1} failed with provider ${provider.name}: ${error.message}`);
                    attempt++;
                }
            }
            Logger.log(`Switching to next provider after ${attempt} attempts.`);
            attempt = 0; // Reset attempt counter for next provider
        }

        this.failedAttempts++;
        if (this.failedAttempts >= this.circuitBreakerThreshold) {
            this.circuitBreakerOpened = true;
            setTimeout(() => this.circuitBreakerOpened = false, 60000); // Open circuit breaker for 1 minute
            Logger.log('Circuit breaker opened due to consecutive failures.');
        }

        return { success: false, provider: null, attempt: this.maxRetries, error: lastError };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { EmailService };
