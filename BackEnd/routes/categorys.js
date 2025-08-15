const express = require("express")
const cc = require("../controllers/CategoryController")
const router = express.Router()

//middleware
const tokenExtractor = require("../middleware/tokenExtractor")
router.use(tokenExtractor)

router.post("/", cc.createCategory);
router.get("/", cc.getCategories);
router.get("/:id", cc.getCategoryById);
router.put("/:id", cc.updateCategory);
router.delete("/:id", cc.deleteCategory);
router.get("/user/:userId", cc.getCategoriesByUserId);
router.get("/parent/:parentCategoryId", cc.getCategoriesByParentCategoryId);

module.exports = router
