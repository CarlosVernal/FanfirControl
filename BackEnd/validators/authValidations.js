import { body } from "express-validator"
import { emailCheck, passwordCheck, tokenCheck, nameCheck } from "./commons.js"

export const loginValidation = [
    emailCheck,
    passwordCheck
]
export const registerValidation = [
    emailCheck,
    passwordCheck,
    nameCheck
]

export const verifyEmailValidation = [
    tokenCheck
]

export const forgotPasswordValidation = [
    emailCheck
]

export const resetPasswordValidation = [
    tokenCheck,
    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña no puede estar vacía')
        .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .isLength({ max: 128 }).withMessage('La nueva contraseña no puede tener más de 128 caracteres')
        .matches(/[A-Z]/).withMessage('La nueva contraseña debe contener al menos una mayúscula')
        .matches(/[a-z]/).withMessage('La nueva contraseña debe contener al menos una minúscula')
        .matches(/[0-9]/).withMessage('La nueva contraseña debe contener al menos un número')
        .matches(/[\W_]/).withMessage('La contraseña debe contener al menos un carácter especial')
]

export const resendVerificationEmailValidation = [
    emailCheck
]