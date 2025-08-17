const { check, param } = require("express-validator")

const updateUserValidation = [
    check("name")
        .optional()
        .custom((value) => {
            if (typeof value === "string" && value.trim().length === 0) {
                throw new Error("El nombre no puede ser una cadena de espacios");
            }
            return true;
        }),
    check("password")
        .optional()
        .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
        .matches(/[0-9]/).withMessage("La contraseña debe contener al menos un número")
        .matches(/[a-z]/).withMessage("La contraseña debe contener al menos una letra minúscula")
        .matches(/[A-Z]/).withMessage("La contraseña debe contener al menos una letra mayúscula")
        .matches(/[@$!%*?&]/).withMessage("La contraseña debe contener al menos un carácter especial"),
    param("id")
        .exists().withMessage("El ID es obligatorio")
        .isMongoId().withMessage("El ID debe ser un ObjectId válido")
]

const deleteUserValidation = [
    param("id")
        .exists().withMessage("El ID es obligatorio")
        .isMongoId().withMessage("El ID debe ser un ObjectId válido")
]

const getUserByIdValidation = [
    param("id")
        .exists().withMessage("El ID es obligatorio")
        .isMongoId().withMessage("El ID debe ser un ObjectId válido")
]

module.exports = {
    updateUserValidation,
    deleteUserValidation,
    getUserByIdValidation
}