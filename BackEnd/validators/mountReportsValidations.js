import { body, param, query } from "express-validator";
import { mongoIdCheck } from "./commons.js";

// SOLO para creación automática del sistema (cron job)
export const createMonthlyReportValidator = [
    body("month")
        .isInt({ min: 1, max: 12 })
        .withMessage("El mes debe ser un número entre 1 y 12"),
    body("year")
        .isInt({ min: 2000, max: 3000 })
        .withMessage("El año debe ser un número entre 2000 y 3000")
    // NO validamos totalIncome/totalExpense porque se calculan automáticamente
];

export const getMountsReportsValidator = [
    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("La fecha de inicio debe ser una fecha válida"),
    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("La fecha de fin debe ser una fecha válida"),
    query("type")
        .optional()
        .isIn(["positive", "negative"])
        .withMessage("El tipo debe ser 'positive' o 'negative'"),
    query("minRange")
        .optional()
        .isFloat({ min: -999999999.99, max: 999999999.99 })
        .withMessage("El rango mínimo debe estar entre -999,999,999.99 y 999,999,999.99"),
    query("maxRange")
        .optional()
        .isFloat({ min: -999999999.99, max: 999999999.99 })
        .withMessage("El rango máximo debe estar entre -999,999,999.99 y 999,999,999.99"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("La página debe ser un número mayor a 0"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("El límite debe estar entre 1 y 100")
];

export const getMonthlyReportByIdValidator = [
    mongoIdCheck
];

export const deleteMonthlyReportValidator = [
    mongoIdCheck
];
