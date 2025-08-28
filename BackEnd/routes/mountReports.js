import express from "express";
import * as mrc from "../controllers/mountReportConroller.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import * as mrv from "../validators/mountReportsValidations.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", mrv.createMonthlyReportValidator, handleValidationErrors, mrc.createMonthlyReport);
router.get("/", mrv.getMountsReportsValidator, handleValidationErrors, mrc.getMountsReports);
router.get("/:id", mrv.getMonthlyReportByIdValidator, handleValidationErrors, mrc.getMountsReportsById);
router.delete("/:id", mrv.deleteMonthlyReportValidator, handleValidationErrors, mrc.deleteMountsReport);

export default router;
