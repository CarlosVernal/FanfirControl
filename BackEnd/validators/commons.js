import { body, param } from "express-validator"

export const emailCheck = body('email')
    .isEmail().withMessage('El email no es válido').normalizeEmail()

export const passwordCheck = body('password')
    .notEmpty().withMessage('La contraseña no puede estar vacía')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .isLength({ max: 128 }).withMessage('La contraseña no puede tener más de 128 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una minúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[\W_]/).withMessage('La contraseña debe contener al menos un carácter especial')

export const nameCheck = body('name')
    .optional()
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
    .isLength({ max: 50 }).withMessage('El nombre no puede tener más de 50 caracteres')
    .custom(value => value.trim().length > 0).withMessage('El nombre no puede ser solo espacios')

export const tokenCheck = body('token')
    .notEmpty().withMessage('El token es requerido')

export const mongoIdCheck = param('id')
    .exists().withMessage('El ID es obligatorio')
    .isMongoId().withMessage('El ID debe ser un ObjectId válido')
