import { body, query } from "express-validator";
import { tokenCheck, mongoIdCheck } from "./commons.js";

export const createBudgetValidation = [
  tokenCheck,
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 5, max: 100 })
    .withMessage("Description must be between 5 and 100 characters")
    .custom((value)=> value.trim() !== "").withMessage("Description must not be empty"),
  body("month")
    .isNumeric()
    .withMessage("Month must be a number")
    .custom((value) => {
      if (value < 1 || value > 12) {
        throw new Error("Month must be between 1 and 12");
      }
      return true;
    }),
  body("year")
    .isNumeric()
    .withMessage("Year must be a number")
    .custom((value) => {
      const currentYear = new Date().getFullYear();
      if (value < currentYear) {
        throw new Error("Year must be the current year or later");
      }
      return true;
    }),
  body("expectedIncome")
    .isNumeric()
    .withMessage("Expected income must be a number")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Expected income must be a positive number");
      }
      return true;
    }),
  body("expectedExpense")
    .isNumeric()
    .withMessage("Expected expense must be a number")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Expected expense must be a positive number");
      }
      return true;
    }),
];

export const getAllMyBudgetsValidation = [tokenCheck];

export const getBudgetByIdValidation = [
  tokenCheck,
  mongoIdCheck,
];

export const updateBudgetValidation = [
  tokenCheck,
  mongoIdCheck,
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 5, max: 100 })
    .withMessage("Description must be between 5 and 100 characters"),
  body("month")
    .isNumeric()
    .withMessage("Month must be a number")
    .custom((value) => {
      if (value < 1 || value > 12) {
        throw new Error("Month must be between 1 and 12");
      }
      return true;
    }),
  body("year")
    .isNumeric()
    .withMessage("Year must be a number")
    .custom((value) => {
      const currentYear = new Date().getFullYear();
      if (value < currentYear) {
        throw new Error("Year must be the current year or later");
      }
      return true;
    }),
  body("expectedIncome")
    .isNumeric()
    .withMessage("Expected income must be a number")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Expected income must be a positive number");
      }
      return true;
    }),
  body("expectedExpense")
    .isNumeric()
    .withMessage("Expected expense must be a number")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Expected expense must be a positive number");
      }
      return true;
    }),
];

export const deleteBudgetValidation = [
  tokenCheck,
  mongoIdCheck,
];

export const activateOldBudgetValidation = [
  tokenCheck,
  mongoIdCheck,
];

export const searchBudgetsValidation = [
  tokenCheck,
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("description").optional().isString(),
  query("minIncome").optional().isNumeric(),
  query("maxIncome").optional().isNumeric(),
  query("minExpense").optional().isNumeric(),
  query("maxExpense").optional().isNumeric(),
];