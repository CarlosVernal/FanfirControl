import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import validateAuthenticatedUser from "../utils/authUtils.js";

export async function createCategory(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);
        
        const { name, parentCategoryId } = req.body;
        if (!name) {
            return res.status(400).json({ error: "name es requerido" });
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

export async function deleteCategory(req, res, next) {
    // Eliminacion de cascada
    // Usar una sesión de MongoDB para operaciones atómicas
    const session = await mongoose.startSession(); //asegura que se realizen todas las peticiones en una sola transacción
    session.startTransaction();

    try {
        // Verifica permisos
        const userId = validateAuthenticatedUser(req, res);

        // Obtener la categoría a eliminar
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        // Verificar que el usuario sea dueño de la categoría
        if (category.userId.toString() !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta categoría" });
        }

        // Obtener todas las categorías hijas
        const childrenCategories = await Category.find({ parentCategoryId: req.params.id , userId });

        // Concatenar las id's de categoría y sus hijos
        const categoryFamily = [category._id, ...childrenCategories.map(cat => cat._id)];

        // Actualizar las transacciones: quitar estas categorías
        const updateResult = await Transaction.updateMany(
            { categories: { $in: categoryFamily } },
            { $set: { categories: null } },
            { session }
        );
        console.log(`${updateResult.modifiedCount} transacciones actualizadas`);

        // Eliminar todas las categorías hijas
        const deleteChildrenResult = await Category.deleteMany(
            { _id: { $in: childrenCategories.map(cat => cat._id) } },
            { session }
        );
        console.log(`${deleteChildrenResult.deletedCount} categorías hijas eliminadas`);

        // Eliminar la categoría principal
        const deleteMainResult = await Category.findByIdAndDelete(category._id, { session });
        console.log(`Categoría principal eliminada: ${deleteMainResult._id}`);

        // Confirmar la transacción
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: "Categoría y subcategorías eliminadas correctamente",
            updatedTransactions: updateResult.modifiedCount,
            deletedCategories: deleteChildrenResult.deletedCount + 1
        });
    } catch (error) {
        // Si hay error, revertir todos los cambios
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export async function updateCategory(req, res, next) {
    // el usuario podra modificar el nombre de la categoria y si cambiara de nivel de categoria
    // al usuario se le mostrara una lista con las categorias padre en caso de quiera ser subcategoria de una de ellas y enviara el id de esa categoria padre (en caso de ser categoria hija podra dejar de serlo enviando un null y si quiere mantener al padre se enviara la id del padre por actual por defecto)
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Verifica permisos
        const userId = validateAuthenticatedUser(req, res);
        
        const { parentCategoryId, name } = req.body;
        // Obtener la categoría a actualizar
        const updateCategory = await Category.findById(req.params.id);
        if (!updateCategory) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        //verifica que el usuario sea el dueño de la categoría
        if (updateCategory.userId.toString() !== userId) {
            return res.status(403).json({ error: "No tienes permiso para modificar esta categoría" });
        }
        // Actualiza el nombre si se proporciona
        if (name) {
            updateCategory.name = name;
        }
        
        // Maneja la actualización del parentCategoryId
        if (parentCategoryId === null) {
            // Se quiere eliminar el padre
            updateCategory.parentCategoryId = null;
        } else if (parentCategoryId !== updateCategory.parentCategoryId?.toString()) {
            // Se quiere asignar un nuevo padre diferente al actual
            // Verificar que no se esté estableciendo como padre a sí mismo
            if (parentCategoryId === req.params.id) {
                return res.status(400).json({ error: "Una categoría no puede ser padre de sí misma" });
            }
            // Verificar que no sea una de sus subcategorías
            const possibleDescendants = await Category.find({ parentCategoryId: req.params.id });
            if (possibleDescendants.some(desc => desc._id.toString() === parentCategoryId)) {
                return res.status(400).json({ error: "No puedes asignar como padre a una subcategoría" });
            }
            // Verificar que la categoría padre exista y no sea un hijo
            const parentCategory = await Category.findById(parentCategoryId);
            if (!parentCategory) {
                return res.status(404).json({ error: "Categoría padre no encontrada" });
            }
            if (parentCategory.parentCategoryId) {
                return res.status(400).json({ error: "Solo se permite un nivel de categorías padre-hijo" });
            }
            updateCategory.parentCategoryId = parentCategoryId;
        }
        // Si parentCategoryId es igual al valor actual, no se cambia el padre
        // Guardar los cambios
        const updatedCategory = await updateCategory.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(200).json(updatedCategory);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export async function getCategories(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);

        const categories = await Category.find({ userId });
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

export async function getCategoryById(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);

        const category = await Category.findOne({ _id: req.params.id, userId });
        if (!category) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

// Esta ruta sera implementada en un futuro cuando exista el rol del administrador
// export async function getCategoriesByUserId(req, res, next) {
//     try {
//         const { userId } = req.params;
//         if (!userId) {
//             return res.status(400).json({ error: "userId es requerido" });
//         }
//         const userExist = await User.findById(userId);
//         if (!userExist) {
//             return res.status(404).json({ error: "Usuario no encontrado" });
//         }
//         const categories = await Category.find({ userId });
//         res.status(200).json(categories);
//     } catch (error) {
//         next(error);
//     }
// };

export async function getCategoriesByParentCategoryId(req, res, next) {
    try {
        const userId = validateAuthenticatedUser(req, res);
        
        const categories = await Category.find({ parentCategoryId: req.params.parentCategoryId, userId });
        // Si no encuentra find devuelve un [] (array vacio de largo 0)
        if (categories.length === 0) {
            return res.status(404).json({ error: "Categorías no encontradas" });
        }
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};
