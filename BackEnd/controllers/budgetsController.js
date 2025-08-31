import Budget from '../models/Budget.js';
import validateAuthenticatedUser from "../utils/authUtils.js";

// Crear un nuevo presupuesto (desactiva el anterior si existe para ese mes/año/usuario)
export async function createBudget(req, res, next) {
  try {
    const { month, year, expectedIncome, expectedExpense, description } = req.body;
    const lowDescription = description.toLowerCase();
    const userId = validateAuthenticatedUser(req, res);

    if (!month || !year || !lowDescription) {
      return res.status(400).json({ error: 'mes, año y descripción son requeridos' });
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
      description: lowDescription,
      isActive: true
    });

    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    next(error);
  }
}

// Obtener todos los presupuestos del usuario y los ordena de más reciente a más antiguo
export async function getAllMyBudgets(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    const budgets = await Budget.find({ userId }).sort({ year: -1, month: -1 });
    if (!budgets) {
      return res.status(404).json({ error: 'No se encontraron presupuestos' });
    }
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
}

// Obtener presupuesto por ID, asegurando que el usuario que lo solicita sea el mismo que lo creó
export async function getBudgetById(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    // si lo encuentra verifica que el usuario que lo solicita sea el mismo que lo creó
    if (userId !== budget.userId.toString()) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este presupuesto' });
    }
    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
}

// Modificar un presupuesto -> crea uno nuevo y desactiva el anterior
export async function updateBudget(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    
    //busca el presupuesto a modificar
    const oldBudget = await Budget.findById(req.params.id);
    if (!oldBudget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    // Verifica que el usuario que lo quiere modificar sea el mismo que lo creó
    if (userId !== oldBudget.userId.toString()) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este presupuesto' });
    }

    // Desactivar el presupuesto anterior
    oldBudget.isActive = false;
    await oldBudget.save();
    // Obtener los nuevos valores del cuerpo de la solicitud
    const { expectedExpense, expectedIncome, description, month, year } = req.body;
    // Crear uno nuevo con los valores actualizados
    const newBudget = new Budget({
      userId,
      month: month ?? oldBudget.month,
      year: year ?? oldBudget.year,
      description: description ?? oldBudget.description,
      expectedIncome: expectedIncome ?? oldBudget.expectedIncome,
      expectedExpense: expectedExpense ?? oldBudget.expectedExpense,
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
    const userId = validateAuthenticatedUser(req, res);
    
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    //verifica que el usuario que lo quiere eliminar sea el mismo que lo creó
    if (userId !== budget.userId.toString()) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este presupuesto' });
    }
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
    if (!deletedBudget) {
      return res.status(404).json({ error: 'Hay un problema al intentar eliminar el presupuesto, intentelo mas tarde' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// Activar un presupuesto antiguo y desactivar el actual
export async function activateOldBudget(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);

    const oldBudget = await Budget.findById(req.params.id);
    if (!oldBudget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    // Verifica que el usuario que lo quiere activar sea el mismo que lo creó
    if (userId !== oldBudget.userId.toString()) {
      return res.status(403).json({ error: 'No tienes permiso para activar este presupuesto' });
    }
    // Desactivar presupuesto activo actual
    await Budget.updateMany(
      { userId: userId, isActive: true },// busca el presupuesto activo
      { $set: { isActive: false } } // luego lo desactiva
    );

    // Activar el presupuesto antiguo
    oldBudget.isActive = true;
    await oldBudget.save();

    res.status(200).json(oldBudget);
  } catch (error) {
    next(error);
  }
}

// Obtener todos los presupuestos SOLO EL ADMINISTRADOR PODRA ACCEDER A ESTA RUTA
// export async function getBudgets(req, res, next) {
//   try {
//     const budgets = await Budget.find({});
//     res.status(200).json(budgets);
//   } catch (error) {
//     next(error);
//   }
// }


export async function searchBudgets(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    
    // Extrae los parámetros de búsqueda del query string
    const { startDate, endDate, description, minIncome, maxIncome, minExpense, maxExpense } = req.query;
    // Inicializa el objeto de consulta con el id del usuario autenticado
    const query = { userId };

    // Si se especifican fechas 'startDate' y 'endDate', filtra por rango de fechas de creación
    if (startDate || endDate) {
  query.createdAt = {};
  if (startDate) query.createdAt.$gte = new Date(startDate);
  if (endDate) query.createdAt.$lte = new Date(endDate);
}
    // Si se especifica una descripción, busca coincidencias usando expresión regular
    if (description) {
      query.description = { $regex: description, $options: "i" };
    }
    // Si se especifican límites de ingresos esperados, los agrega al filtro
    if (minIncome || maxIncome) {
      query.expectedIncome = {};
      if (minIncome) query.expectedIncome.$gte = Number(minIncome);
      if (maxIncome) query.expectedIncome.$lte = Number(maxIncome);
    }
    // Si se especifican límites de gastos esperados, los agrega al filtro
    if (minExpense || maxExpense) {
      query.expectedExpense = {};
      if (minExpense) query.expectedExpense.$gte = Number(minExpense);
      if (maxExpense) query.expectedExpense.$lte = Number(maxExpense);
    }

    // Busca los presupuestos que cumplen con los filtros y los ordena por año y mes descendente
    const budgets = await Budget.find(query).sort({ year: -1, month: -1 });
    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ error: 'No se encontraron presupuestos que coincidan con los criterios de búsqueda' });
    }
    // Devuelve los resultados en formato JSON con estado 200
    res.status(200).json(budgets);
  } catch (error) {
    // Si ocurre un error, lo pasa al middleware de manejo de errores
    next(error);
  }
}
