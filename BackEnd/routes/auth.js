const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

//To do: use express-validator for input validation

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
