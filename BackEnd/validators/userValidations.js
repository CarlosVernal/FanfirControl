import { nameCheck, passwordCheck } from "./commons.js"

export const updateUserValidation = [
    nameCheck.optional(),
    passwordCheck.optional()
]

export const deleteUserValidation = [
    // No necesita validaciones adicionales, el userId viene del token
]

export const getUserByIdValidation = [
    // No necesita validaciones adicionales, el userId viene del token
]