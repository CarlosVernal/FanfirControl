import express from "express";
import * as sgc from "../controllers/savingGoalController.js";
import * as sgv from "../validators/savingGoalValidations.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

// Middleware de autenticación global
router.use(tokenExtractor);

router.post("/", sgv.createSavingGoalValidation, handleValidationErrors, sgc.createSavingGoal);
router.get("/", sgv.getSavingGoalsValidation, handleValidationErrors, sgc.getSavingGoals);
router.get("/:id", sgv.getSavingGoalByIdValidation, handleValidationErrors, sgc.getSavingGoalById);
router.put("/:id", sgv.updateSavingGoalValidation, handleValidationErrors, sgc.updateSavingGoal);
router.delete("/:id", sgv.deleteSavingGoalValidation, handleValidationErrors, sgc.deleteSavingGoal);

export default router;
