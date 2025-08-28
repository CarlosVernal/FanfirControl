import { mongoIdCheck } from "./commons.js";
import { body, param } from "express-validator";

export const createCategoryValidation = [
    body("name")
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
        .trim()
        .custom(value => value.length > 0).withMessage("El nombre no puede estar vacío"),
    body("parentCategoryId")
        .optional()
        .isMongoId().withMessage("parentCategoryId debe ser un ObjectId válido")
];

export const updateCategoryValidation = [
    mongoIdCheck,
    body("name")
        .optional()
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
        .trim()
        .custom(value => value.length > 0).withMessage("El nombre no puede estar vacío"),
    body("parentCategoryId")
        .optional()
        .isMongoId().withMessage("parentCategoryId debe ser un ObjectId válido")
];

export const deleteCategoryValidation = [
    mongoIdCheck
];

export const getCategoryByIdValidation = [
    mongoIdCheck
];

export const getCategoriesByParentValidation = [
    param('parentCategoryId')
        .exists().withMessage('El parentCategoryId es obligatorio')
        .isMongoId().withMessage('El parentCategoryId debe ser un ObjectId válido')
];

// getCategories NO necesita validaciones porque no tiene parámetros
// La autenticación la maneja tokenExtractor
export const getCategoriesValidation = [];