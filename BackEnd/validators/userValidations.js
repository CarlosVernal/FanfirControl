import { nameCheck, passwordCheck, mongoIdCheck } from "./commons.js"

export const updateUserValidation = [
    nameCheck,
    passwordCheck,
    mongoIdCheck
]

export const deleteUserValidation = [
    mongoIdCheck
]

export const getUserByIdValidation = [
    mongoIdCheck
]