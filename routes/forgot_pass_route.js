const express = require('express');
const router = express.Router();
const password = require('../controller/ForgotPassword');
const { route } = require('./auth');

router.post('/forgot-password',password.forgotPassword);
router.post('/verify-otp',password.verifyOTP);
router.post('/reset-password',password.resetPassword);

module.exports = router;