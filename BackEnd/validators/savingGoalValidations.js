import { body, query } from "express-validator";
import { mongoIdCheck } from "./commons.js";

export const createSavingGoalValidation = [
    body("name")
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres")
        .trim()
        .custom(value => value.length > 0).withMessage("El nombre no puede estar vacío"),
    
    body("targetAmount")
        .isFloat({ min: 0.01 }).withMessage("El monto objetivo debe ser un número positivo mayor a 0"),
    
    body("monthlySavingGoal")
        .isFloat({ min: 0.01 }).withMessage("La meta de ahorro mensual debe ser un número positivo mayor a 0"),
    
    body("currentSavedAmount")
        .optional()
        .isFloat({ min: 0 }).withMessage("El monto ahorrado actual debe ser un número positivo o cero"),
    
    body("startDate")
        .isISO8601().withMessage("La fecha de inicio debe ser una fecha válida")
        .custom((value) => {
            const startDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate < today) {
                throw new Error("La fecha de inicio no puede ser anterior a hoy");
            }
            return true;
        }),
    
    body("targetDate")
        .isISO8601().withMessage("La fecha objetivo debe ser una fecha válida")
        .custom((value, { req }) => {
            const targetDate = new Date(value);
            const startDate = new Date(req.body.startDate);
            if (targetDate <= startDate) {
                throw new Error("La fecha objetivo debe ser posterior a la fecha de inicio");
            }
            return true;
        })
];

export const updateSavingGoalValidation = [
    mongoIdCheck,
    body("name")
        .optional()
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres")
        .trim(),
    
    body("targetAmount")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("El monto objetivo debe ser un número positivo mayor a 0"),
    
    body("monthlySavingGoal")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("La meta de ahorro mensual debe ser un número positivo mayor a 0"),
    
    body("currentSavedAmount")
        .optional()
        .isFloat({ min: 0 }).withMessage("El monto ahorrado actual debe ser un número positivo o cero"),
    
    body("targetDate")
        .optional()
        .isISO8601().withMessage("La fecha objetivo debe ser una fecha válida")
];

export const getSavingGoalByIdValidation = [
    mongoIdCheck
];

export const deleteSavingGoalValidation = [
    mongoIdCheck
];

export const getSavingGoalsValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("La página debe ser un número mayor a 0"),
    
    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage("El límite debe estar entre 1 y 50"),
    
    query("status")
        .optional()
        .isIn(["active", "completed", "all"]).withMessage("El estado debe ser 'active', 'completed' o 'all'")
];
