import express from "express";
import * as mrc from "../controllers/mountReportConroller.js";
import tokenExtractor from "../middleware/tokenExtractor.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", mrc.createMonthlyReport);
router.get("/:id", mrc.getMountReportById);
router.delete("/:id", mrc.deleteMountReport);
router.get("/user/:userId", mrc.getMountsReportsByUser);
router.get("/date", mrc.getMountsReportsByDate);
router.get("/margin", mrc.getMountsReportsByMargin);
router.get("/positive", mrc.getPositiveMountsReports);
router.get("/negative", mrc.getNegativeMountsReports);

export default router;

//TODO: Revisar rutas
//TODO: agregar middleware de validacion de datos