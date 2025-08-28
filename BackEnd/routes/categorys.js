import express from "express";
import * as cc from "../controllers/CategoryController.js";
import * as cv from "../validators/categoryValidations.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

// Middleware de autenticación global
router.use(tokenExtractor);

router.post("/", cv.createCategoryValidation, handleValidationErrors, cc.createCategory);
router.get("/", cc.getCategories); 
router.get("/:id", cv.getCategoryByIdValidation, handleValidationErrors, cc.getCategoryById);
router.put("/:id", cv.updateCategoryValidation, handleValidationErrors, cc.updateCategory);
router.delete("/:id", cv.deleteCategoryValidation, handleValidationErrors, cc.deleteCategory);
router.get("/parent/:parentCategoryId", cv.getCategoriesByParentValidation, handleValidationErrors, cc.getCategoriesByParentCategoryId);

export default router;

//TODO: agregar validaciones y middleware de validaciones