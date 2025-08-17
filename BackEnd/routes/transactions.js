import express from "express";
import * as tc from "../controllers/transactionController.js";
import tokenExtractor from "../middleware/tokenExtractor.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", tc.createTransaction);
router.get("/", tc.getTransactions);
router.get("/:id", tc.getTransactionById);
router.get("/range", tc.getTransactionInRange);
router.put("/:id", tc.updateTransaction);
router.delete("/:id", tc.deleteTransaction);

export default router;
