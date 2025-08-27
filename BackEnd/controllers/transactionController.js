import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

export async function createTransaction(req, res, next) {
    try {
        const userId = req.user.id;
        const { 
            description, 
            amount, 
            date, 
            categories, //id
            isRecurrent, 
            recurrenceFrequency, 
            installments,
            installmentsPaid 
        } = req.body;

        // Validar que si es recurrente, tenga frecuencia
        if (isRecurrent && !recurrenceFrequency) {
            return res.status(400).json({ 
                error: "Si la transacción es recurrente, debe especificar la frecuencia" 
            });
        }

        // Validar que las cuotas pagadas no excedan las totales
        if (installmentsPaid && installments && installmentsPaid > installments) {
            return res.status(400).json({ 
                error: "Las cuotas pagadas no pueden ser mayores a las cuotas totales" 
            });
        }

        // Validar que la categoría existe y pertenece al usuario
        if (categories) {
            const category = await Category.findOne({ _id: categories, userId });
            if (!category) {
                return res.status(400).json({ 
                    error: "La categoría no existe o no tienes permiso para usarla" 
                });
            }
        }

        const transaction = new Transaction({
            userId,
            description: description.trim(),
            amount,
            date,
            categories: categories || null,
            isRecurrent: isRecurrent || false,
            recurrenceFrequency: recurrenceFrequency || null,
            installments: installments || 1,
            installmentsPaid: installmentsPaid || 0,
        });

        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        next(error);
    }
};

export async function getTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Extraer parámetros de query con valores por defecto
    const { 
      startDate, 
      endDate, 
      startAmount, 
      endAmount, 
      categoryId, 
      type,
      page = 1, 
      limit = 20, 
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;

    // Construir filtro base
    const filter = { userId };

    // Filtro por rango de fechas
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Filtro por rango de montos
    if (startAmount || endAmount) {
      filter.amount = {};
      if (startAmount) filter.amount.$gte = Number(startAmount);
      if (endAmount) filter.amount.$lte = Number(endAmount);
    }

    // Filtro por categoría (incluye categorías hijas si es categoría padre)
    if (categoryId) {
      // Verificar si la categoría existe y pertenece al usuario
      const category = await Category.findOne({ _id: categoryId, userId });
      if (!category) {
        return res.status(400).json({ 
          error: "La categoría no existe o no tienes permiso para usarla" 
        });
      }

      // Si es categoría padre (no tiene parentCategoryId), incluir también sus hijas
      if (!category.parentCategoryId) {
        // Buscar todas las categorías hijas de esta categoría padre
        const childCategories = await Category.find({ 
          parentCategoryId: categoryId, 
          userId 
        });
        
        // Crear array con la categoría padre y todas sus hijas
        const categoryIds = [categoryId, ...childCategories.map(child => child._id)];
        filter.categories = { $in: categoryIds };
      } else {
        // Si es categoría hija, solo buscar por esa categoría específica
        filter.categories = categoryId;
      }
    }

    // Filtro por tipo (ingreso/gasto)
    if (type) {
      if (type === 'income') {
        filter.amount = { ...filter.amount, $gt: 0 };
      } else if (type === 'expense') {
        filter.amount = { ...filter.amount, $lt: 0 };
      }
    }

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Ejecutar consulta con paginación
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate('categories', 'name parentCategoryId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter)
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      transactions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(req, res, next) {
    try {
        const userId = req.user.id;
        
        const transaction = await Transaction.findOne({ _id: req.params.id, userId })
            .populate('categories', 'name parentCategoryId');
            
        if (!transaction) {
            return res.status(404).json({ error: "Transacción no encontrada" });
        }
        
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

export async function updateTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { 
      description, 
      amount, 
      date, 
      categories, 
      isRecurrent, 
      recurrenceFrequency, 
      installments,
      installmentsPaid 
    } = req.body;

    // Validar que la transacción existe y pertenece al usuario
    const existingTransaction = await Transaction.findOne({ _id: req.params.id, userId });
    if (!existingTransaction) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    // Validar que si es recurrente, tenga frecuencia
    if (isRecurrent !== undefined && isRecurrent && !recurrenceFrequency) {
      return res.status(400).json({ 
        error: "Si la transacción es recurrente, debe especificar la frecuencia" 
      });
    }

    // Validar que las cuotas pagadas no excedan las totales
    const finalInstallments = installments !== undefined ? installments : existingTransaction.installments;
    const finalInstallmentsPaid = installmentsPaid !== undefined ? installmentsPaid : existingTransaction.installmentsPaid;
    
    if (finalInstallmentsPaid > finalInstallments) {
      return res.status(400).json({ 
        error: "Las cuotas pagadas no pueden ser mayores a las cuotas totales" 
      });
    }

    // Validar que la categoría existe y pertenece al usuario
    if (categories) {
      const category = await Category.findOne({ _id: categories, userId });
      if (!category) {
        return res.status(400).json({ 
          error: "La categoría no existe o no tienes permiso para usarla" 
        });
      }
    }

    // Construir el objeto de actualización dinámicamente
    const updateFields = {};
    if (description !== undefined) updateFields.description = description.trim();
    if (amount !== undefined) updateFields.amount = amount;
    if (date !== undefined) updateFields.date = date;
    if (categories !== undefined) updateFields.categories = categories;
    if (isRecurrent !== undefined) updateFields.isRecurrent = isRecurrent;
    if (recurrenceFrequency !== undefined) updateFields.recurrenceFrequency = recurrenceFrequency;
    if (installments !== undefined) updateFields.installments = installments;
    if (installmentsPaid !== undefined) updateFields.installmentsPaid = installmentsPaid;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updateFields },
      { new: true }
    ).populate('categories', 'name parentCategoryId');

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
}


export async function deleteTransaction(req, res, next) {
    try {
        const userId = req.user.id;

        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId });
        if (!transaction) {
            return res.status(404).json({ error: "Transacción no encontrada" });
        }
        
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
