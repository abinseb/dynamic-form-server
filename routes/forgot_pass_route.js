const express = require('express');
const router = express.Router();
const password = require('../controller/ForgotPassword');
const { route } = require('./auth');

// this post api is used to send the otp for the corresponding email for password reset
router.post('/forgot-password',password.forgotPassword);

// verify the otp , for password reset
router.post('/verify-otp',password.verifyOTP);

// this post api is used to update the old password to new 
router.post('/reset-password',password.resetPassword);

module.exports = router;