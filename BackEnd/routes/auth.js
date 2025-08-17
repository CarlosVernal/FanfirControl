import express from 'express';
import * as aC from '../controllers/authController.js';
import * as aV from "../validators/authValidations.js";

const router = express.Router();

router.post('/login', aV.loginValidation, aC.loginUser);
router.post('/register', aV.registerValidation, aC.registerUser);
router.post('/verify-email', aV.verifyEmailValidation, aC.verifyEmail);
router.post('/forgot-password', aV.forgotPasswordValidation, aC.forgotPassword);
router.post('/reset-password', aV.resetPasswordValidation, aC.resetPassword);
router.post('/resend-verification-email', aV.resendVerificationEmailValidation, aC.resendVerificationEmail);

export default router;
