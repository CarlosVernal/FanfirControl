import express from "express";
import * as bg from "../controllers/budgetsController.js";
import tokenExtractor from "../middleware/tokenExtractor.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", bg.createBudget);
router.get("/", bg.getBudgets);
router.get("/:id", bg.getBudgetById);
router.put("/:id", bg.updateBudget);
router.delete("/:id", bg.deleteBudget);

export default router;
