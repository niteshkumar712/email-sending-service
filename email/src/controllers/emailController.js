// src/controllers/emailController.js

const { EmailService } = require('../services/emailService');
const { Provider1 } = require('../services/providers/Provider1');
const { Provider2 } = require('../services/providers/provider2');

const emailService = new EmailService([new Provider1(), new Provider2()]);

async function sendEmail(req, res) {
    const email = req.body;
    try {
        await emailService.sendEmail(email);
        res.status(200).json({ message: 'Email processing started.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { sendEmail };
