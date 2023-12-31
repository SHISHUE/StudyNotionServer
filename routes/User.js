const express = require('express');
const router = express.Router();

// Importing controller functions
const { login, signUp, sendOtp, changePassword } = require('../controller/Auth');

// Importing middleware functions
const { resetPasswordToken, resetPassword } = require('../controller/ResetPassword');
const {auth} = require('../middleware/auth');

// Routes for Login, Signup, and Authentication

// Public routes
router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOtp);

// Authenticated route for changing password
router.post('/changepassword', auth, changePassword);

// Routes for password reset
router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetPassword);

module.exports = router;
