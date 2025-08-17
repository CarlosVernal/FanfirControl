import Budget from '../models/Budget.js';

// Crear un nuevo presupuesto (desactiva el anterior si existe para ese mes/año/usuario)
export async function createBudget(req, res, next) {
  try {
    const { userId, month, year, expectedIncome, expectedExpense } = req.body;
    if (!userId || !month || !year) {
      return res.status(400).json({ error: 'userId, month y year son requeridos' });
    }

    // Desactivar presupuesto activo anterior del mismo mes/año/usuario
    await Budget.updateMany(
      { userId, month, year, isActive: true },
      { $set: { isActive: false } }
    );

    const budget = new Budget({
      userId,
      month,
      year,
      expectedIncome: expectedIncome || 0,
      expectedExpense: expectedExpense || 0,
      isActive: true
    });

    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    next(error);
  }
}

// Obtener todos los presupuestos
export async function getBudgets(req, res, next) {
  try {
    const budgets = await Budget.find({});
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
}

// Obtener presupuesto por ID
export async function getBudgetById(req, res, next) {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
}

// Modificar un presupuesto -> crea uno nuevo y desactiva el anterior
export async function updateBudget(req, res, next) {
  try {
    const oldBudget = await Budget.findById(req.params.id);
    if (!oldBudget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    // Desactivar el presupuesto anterior
    oldBudget.isActive = false;
    await oldBudget.save();

    // Crear uno nuevo con los valores actualizados
    const newBudget = new Budget({
      userId: oldBudget.userId,
      month: oldBudget.month,
      year: oldBudget.year,
      expectedIncome: req.body.expectedIncome ?? oldBudget.expectedIncome,
      expectedExpense: req.body.expectedExpense ?? oldBudget.expectedExpense,
      isActive: true
    });

    const savedNewBudget = await newBudget.save();
    res.status(201).json(savedNewBudget);
  } catch (error) {
    next(error);
  }
}

// Eliminar presupuesto (solo lo borra de la base)
export async function deleteBudget(req, res, next) {
  try {
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
    if (!deletedBudget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// Activar un presupuesto antiguo y desactivar el actual
export async function activateOldBudget(req, res, next) {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    // Desactivar presupuesto activo actual
    await Budget.updateMany(
      { userId: budget.userId, month: budget.month, year: budget.year, isActive: true },
      { $set: { isActive: false } }
    );

    // Activar el presupuesto antiguo
    budget.isActive = true;
    await budget.save();

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
}
