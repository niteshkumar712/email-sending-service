// src/tests/emailService.test.js

const { EmailService } = require('../services/emailService');
const { Provider1 } = require('../services/providers/Provider1');
const { Provider2 } = require('../services/providers/provider2');

describe('EmailService', () => {
    let emailService;
    let provider1;
    let provider2;

    beforeEach(() => {
        provider1 = new Provider1();
        provider2 = new Provider2();
        emailService = new EmailService([provider1, provider2]);
    });

    it('should send an email using the first provider', async () => {
        const email = { id: 'email1', to: 'user@example.com', subject: 'Test Email', body: 'This is a test email.' };
        await emailService.sendEmail(email);
        expect(emailService.sentEmails.has(email.id)).toBe(true);
    });

    it('should retry on failure and use the fallback provider', async () => {
        const email = { id: 'email2', to: 'user@example.com', subject: 'Test Email', body: 'This is a test email.' };
        await emailService.sendEmail(email);
        expect(emailService.emailAttempts[email.id].success).toBe(true);
    });

    it('should enforce idempotency and prevent duplicate sends', async () => {
        const email = { id: 'email3', to: 'user@example.com', subject: 'Test Email', body: 'This is a test email.' };
        await emailService.sendEmail(email);
        await emailService.sendEmail(email);
        expect(emailService.sentEmails.size).toBe(1);
    });
});
