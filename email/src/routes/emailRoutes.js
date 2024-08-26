// src/routes/emailRoutes.js

const express = require('express');
const { sendEmail } = require('../controllers/emailController');

const router = express.Router();

router.post('/send', sendEmail);

module.exports = router;
