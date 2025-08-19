import express from "express";
import * as bC from "../controllers/budgetsController.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import * as bV from "../validators/budgetValidations.js";
const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", bV.createBudgetValidation, bC.createBudget);
router.get("/", bV.getAllMyBudgetsValidation, bC.getAllMyBudgets);
router.get("/:id", bV.getBudgetByIdValidation, bC.getBudgetById);
router.put("/:id", bV.updateBudgetValidation, bC.updateBudget);
router.delete("/:id", bV.deleteBudgetValidation, bC.deleteBudget);
router.patch("/:id/activate", bV.activateOldBudgetValidation, bC.activateOldBudget);
router.get("/search", bV.searchBudgetsValidation, bC.searchBudgets);

export default router;
