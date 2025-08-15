const Category = require("../models/Category");

exports.createCategory = async (req, res, next) => {
    try {
        const { userId, name, parentCategoryId } = req.body;
        if (!userId || !name) {
            return res.status(400).json({ error: "userId y name son requeridos" });
        }
        // Limitacion de un nivel en las categorias
        if (parentCategoryId) {
            const parentCategory = await Category.findById(parentCategoryId);
            if (!parentCategory) {
                return res.status(400).json({ error: "La categoría padre no existe" });
            }
            if (parentCategory.parentCategoryId) {
                return res.status(400).json({ error: "Solo se permite un nivel de categorías padre-hijo" });
            }
        }
        const category = new Category({
            userId,
            name,
            parentCategoryId: parentCategoryId || null,
        });
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};
exports.getCategoriesByUserId = async (req, res, next) => {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ error: "userId es requerido" });
        }
        const userExist = await User.findById(req.params.userId);
        if (!userExist) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        const categories = await Category.find({ userId: req.params.userId });
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getCategoriesByParentCategoryId = async (req, res, next) => {
    try {
        if (!req.params.parentCategoryId) {
            return res.status(400).json({ error: "parentCategoryId es requerido" });
        }
        const categories = await Category.find({ parentCategoryId: req.params.parentCategoryId });
        if (!categories || categories.length === 0) {
            return res.status(404).json({ error: "Categorías no encontradas" });
        }
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};
