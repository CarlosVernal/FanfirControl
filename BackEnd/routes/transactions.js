import express from "express";
import * as tc from "../controllers/transactionController.js";
import * as tv from "../validators/transactionValidations.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", tv.createTransactionValidation, handleValidationErrors, tc.createTransaction);
router.get("/", tv.getTransactionsValidation, handleValidationErrors, tc.getTransactions);
router.get("/:id", tv.getTransactionByIdValidation, handleValidationErrors, tc.getTransactionById);
router.put("/:id", tv.updateTransactionValidation, handleValidationErrors, tc.updateTransaction);
router.delete("/:id", tv.deleteTransactionValidation, handleValidationErrors, tc.deleteTransaction);

export default router;
