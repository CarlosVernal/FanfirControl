import express from "express";
import * as bC from "../controllers/budgetsController.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import * as bV from "../validators/budgetValidations.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", bV.createBudgetValidation, handleValidationErrors, bC.createBudget);
router.get("/", bV.getAllMyBudgetsValidation, handleValidationErrors, bC.getAllMyBudgets);
router.get("/:id", bV.getBudgetByIdValidation, handleValidationErrors, bC.getBudgetById);
router.put("/:id", bV.updateBudgetValidation, handleValidationErrors, bC.updateBudget);
router.delete("/:id", bV.deleteBudgetValidation, handleValidationErrors, bC.deleteBudget);
router.patch("/:id/activate", bV.activateOldBudgetValidation, handleValidationErrors, bC.activateOldBudget);
router.get("/search", bV.searchBudgetsValidation, handleValidationErrors, bC.searchBudgets);

export default router;
