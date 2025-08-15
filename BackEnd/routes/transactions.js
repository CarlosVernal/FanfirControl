const express = require("express");
const tc = require("../controllers/transactionController");
const router = express.Router();

//middleware
const tokenExtractor = require("../middleware/tokenExtractor");
router.use(tokenExtractor);

router.post("/", tc.createTransaction);
router.get("/", tc.getTransactions);
router.get("/:id", tc.getTransactionById);
router.get("/range", tc.getTransactionInRange);
router.put("/:id", tc.updateTransaction);
router.delete("/:id", tc.deleteTransaction);
