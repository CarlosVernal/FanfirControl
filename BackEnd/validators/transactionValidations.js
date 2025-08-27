import { body, query, param } from "express-validator";
import { mongoIdCheck } from "./commons.js";

export const createTransactionValidation = [
  body("description")
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ min: 3, max: 255 })
    .withMessage("La descripción debe tener entre 3 y 255 caracteres")
    .trim()
    .custom((value) => value.length > 0)
    .withMessage("La descripción no puede estar vacía"),

  body("amount")
    .isNumeric()
    .withMessage("El monto debe ser un número")
    .custom((value) => value !== 0)
    .withMessage("El monto no puede ser cero"),

  body("date")
    .isISO8601()
    .withMessage("La fecha debe estar en formato ISO8601")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (date > today) {
        throw new Error("La fecha no puede ser futura");
      }
      if (date < oneYearAgo) {
        throw new Error("La fecha no puede ser mayor a un año atrás");
      }
      return true;
    }),

  body("categories")
    .optional()
    .isMongoId()
    .withMessage("La categoría debe ser un ID válido"),

  body("isRecurrent")
    .optional()
    .isBoolean()
    .withMessage("isRecurrent debe ser verdadero o falso"),

  body("recurrenceFrequency")
    .optional()
    .isIn(["monthly", "yearly", null])
    .withMessage("La frecuencia debe ser 'monthly', 'yearly' o null"),

  body("installments")
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage("Las cuotas deben ser entre 1 y 60"),

  body("installmentsPaid")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Las cuotas pagadas deben ser 0 o mayor"),
];

export const updateTransactionValidation = [
  mongoIdCheck,
  body("description")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ min: 3, max: 255 })
    .withMessage("La descripción debe tener entre 3 y 255 caracteres")
    .trim(),

  body("amount")
    .optional()
    .isNumeric()
    .withMessage("El monto debe ser un número")
    .custom((value) => value !== 0)
    .withMessage("El monto no puede ser cero"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe estar en formato ISO8601"),

  body("categories")
    .optional()
    .isMongoId()
    .withMessage("La categoría debe ser un ID válido"),

  body("installments")
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage("Las cuotas deben ser entre 1 y 60"),

  body("installmentsPaid")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Las cuotas pagadas deben ser 0 o mayor"),
];

export const getTransactionByIdValidation = [mongoIdCheck];

export const deleteTransactionValidation = [mongoIdCheck];

export const getTransactionsValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate debe ser una fecha válida"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate debe ser una fecha válida"),

  query("startAmount")
    .optional()
    .isNumeric()
    .withMessage("startAmount debe ser un número"),

  query("endAmount")
    .optional()
    .isNumeric()
    .withMessage("endAmount debe ser un número"),

  query("categoryId")
    .optional()
    .isMongoId()
    .withMessage("categoryId debe ser un ID válido"),

  query("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("type debe ser 'income' o 'expense'"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page debe ser un número mayor a 0"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit debe ser entre 1 y 100"),

  query("sortBy")
    .optional()
    .isIn(["date", "amount", "description"])
    .withMessage("sortBy debe ser 'date', 'amount' o 'description'"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder debe ser 'asc' o 'desc'"),
];
