import express from "express";
import * as cc from "../controllers/CategoryController.js";
import tokenExtractor from "../middleware/tokenExtractor.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

router.post("/", cc.createCategory);
router.get("/", cc.getCategories);
router.get("/:id", cc.getCategoryById);
router.put("/:id", cc.updateCategory);
router.delete("/:id", cc.deleteCategory);
router.get("/user/:userId", cc.getCategoriesByUserId);
router.get("/parent/:parentCategoryId", cc.getCategoriesByParentCategoryId);

export default router;
