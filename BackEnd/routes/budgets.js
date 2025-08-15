const express = require("express");
const bg = require("../controllers/budgetsController");
const router = express.Router();

//middleware
const tokenExtractor = require("../middleware/tokenExtractor");
router.use(tokenExtractor);

router.post("/", bg.createBudget);
router.get("/", bg.getBudgets);
router.get("/:id", bg.getBudgetById);
router.put("/:id", bg.updateBudget);
router.delete("/:id", bg.deleteBudget);

module.exports = router;
