const {check} = require("express-validator")
//Todo: migrate all verifications here.
const registerValidation = [
    check('email')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail()
    .withMessage('El email no es válido'),

    check('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[@$!%*?&]/).withMessage('La contraseña debe contener al menos un carácter especial')
]

module.exports = {
    registerValidation
}