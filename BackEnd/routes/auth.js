import express from 'express';
import * as aC from '../controllers/authController.js';
import * as aV from "../validators/authValidations.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

router.post('/login', aV.loginValidation, handleValidationErrors, aC.loginUser);
router.post('/register', aV.registerValidation, handleValidationErrors, aC.registerUser);
router.post('/verify-email', aV.verifyEmailValidation, handleValidationErrors, aC.verifyEmail);
router.post('/forgot-password', aV.forgotPasswordValidation, handleValidationErrors, aC.forgotPassword);
router.post('/reset-password', aV.resetPasswordValidation, handleValidationErrors, aC.resetPassword);
router.post('/resend-verification-email', aV.resendVerificationEmailValidation, handleValidationErrors, aC.resendVerificationEmail);

export default router;
