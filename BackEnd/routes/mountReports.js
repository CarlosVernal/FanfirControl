const express = require("express")
const router = express.Router()
const mrc = require("../controllers/mountReportConroller")

//middleware
const tokenExtractor = require("../middleware/tokenExtractor")

router.use(tokenExtractor)


router.post("/", mrc.createMonthlyReport)
router.get("/:id", mrc.getMountReportById)
router.delete("/:id", mrc.deleteMountReport)
router.get("/user/:userId", mrc.getMountsReportsByUser)
router.get("/date", mrc.getMountsReportsByDate)
router.get("/margin", mrc.getMountsReportsByMargin)
router.get("/positive", mrc.getPositiveMountsReports)
router.get("/negative", mrc.getNegativeMountsReports)

module.exports = router
