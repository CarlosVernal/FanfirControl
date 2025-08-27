import express from "express";
import * as tc from "../controllers/transactionController.js";
import * as tv from "../validators/transactionValidations.js";
import tokenExtractor from "../middleware/tokenExtractor.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", tv.createTransactionValidation, tc.createTransaction);
router.get("/", tv.getTransactionsValidation, tc.getTransactions);
router.get("/:id", tv.getTransactionByIdValidation, tc.getTransactionById);
router.put("/:id", tv.updateTransactionValidation, tc.updateTransaction);
router.delete("/:id", tv.deleteTransactionValidation, tc.deleteTransaction);

export default router;
