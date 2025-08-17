const { check } = require("express-validator")

const loginValidation = [
    check('mail')
        .isEmail().withMessage('El email no es válido').normalizeEmail().withMessage('El email no es válido'),

    check('password')
        .notEmpty().withMessage('La contraseña no puede estar vacía')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una minúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[\W_]/).withMessage('La contraseña debe contener al menos un carácter especial')
]

const registerValidation = [
    check('email')
        .isEmail()
        .withMessage('El email no es válido').normalizeEmail().withMessage('El email no es válido'),

    check('password').
        notEmpty().withMessage('La contraseña no puede estar vacía')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .isLength({ max: 128 }).withMessage('La contraseña no puede tener más de 128 caracteres'),

    check('name')
        .optional()
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres')
        .custom(value => value.trim().length > 0).withMessage('El nombre no puede ser solo espacios')
]

const verifyEmailValidation = [
    check('token')
        .notEmpty().withMessage('El token es requerido')
]

const forgotPasswordValidation = [
    check('email')
        .isEmail().withMessage('El email no es válido').normalizeEmail().withMessage('El email no es válido'),
]

const resetPasswordValidation = [
    check('token')
        .notEmpty().withMessage('El token es requerido'),
    check('newPassword')
        .notEmpty().withMessage('La nueva contraseña no puede estar vacía')
        .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .matches(/[A-Z]/).withMessage('La nueva contraseña debe contener al menos una mayúscula')
        .matches(/[a-z]/).withMessage('La nueva contraseña debe contener al menos una minúscula')
        .matches(/[0-9]/).withMessage('La nueva contraseña debe contener al menos un número')
        .matches(/[\W_]/).withMessage('La contraseña debe contener al menos un carácter especial')
]

const resendVerificationEmailValidation = [
    check('email')
        .isEmail().withMessage('El email no es válido').normalizeEmail().withMessage('El email no es válido'),
]

module.exports = {
    loginValidation,
    registerValidation,
    verifyEmailValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
}