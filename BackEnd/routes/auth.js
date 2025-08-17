const express = require('express');
const aC = require('../controllers/authControllers');
const router = express.Router();
const aV = require("../validations/authValidations")
//To do: use express-validator for input validation

router.post('/login', aV.loginValidation, aC.loginUser);
router.post('/register', aV.registerValidation, aC.registerUser);
router.post('/verify-email', aV.verifyEmailValidation, aC.verifyEmail);
router.post('/forgot-password', aV.forgotPasswordValidation, aC.forgotPassword);
router.post('/reset-password', aV.resetPasswordValidation, aC.resetPassword);
router.post('/resend-verification-email', aV.resendVerificationEmailValidation, aC.resendVerificationEmail);

module.exports = router;
