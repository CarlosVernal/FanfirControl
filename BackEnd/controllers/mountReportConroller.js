import MountsReport from '../models/MountsReport.js';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { validateAuthenticatedUser } from '../utils/authUtils.js';

// AUTOMATIZADO: Solo para uso interno del sistema (cron job)
export async function createMonthlyReport(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    if (!userId) return;

    const { month, year } = req.body;

    // Verificar si ya existe un reporte para este mes/año
    const existingReport = await MountsReport.findOne({ userId, month, year });
    if (existingReport) {
      return res.status(400).json({ 
        error: 'Ya existe un reporte para este mes/año' 
      });
    }

    // Buscar presupuesto activo del usuario para ese mes/año
    const activeBudget = await Budget.findOne({ 
      userId, 
      month, 
      year, 
      isActive: true 
    });

    if (!activeBudget) {
      return res.status(400).json({ 
        error: 'No hay presupuesto activo para este mes/año' 
      });
    }

    // Calcular totales desde transacciones reales del mes/año
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const margin = totalIncome - totalExpense;

    // Crear reporte con datos calculados
    const report = new MountsReport({
      userId,
      month,
      year,
      totalIncome,
      totalExpense,
      margin,
      budgetId: activeBudget._id
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);

  } catch (error) {
    next(error);
  }
}

export async function getMountsReports(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    if (!userId) return;

    const { 
      startDate, 
      endDate, 
      type, 
      minRange, 
      maxRange,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { userId };

    // Filtro por rango de fechas (createdAt)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Filtro por tipo (positive = ganancia, negative = pérdida)
    if (type === "positive") {
      filter.margin = { $gt: 0 };
    } else if (type === "negative") {
      filter.margin = { $lt: 0 };
    }

    // Filtro por rango de margen
    if (minRange || maxRange) {
      if (!filter.margin) filter.margin = {};
      if (minRange) filter.margin.$gte = Number(minRange);
      if (maxRange) filter.margin.$lte = Number(maxRange);
    }

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [reports, totalCount] = await Promise.all([
      MountsReport.find(filter)
        .populate('budgetId', 'name totalBudget')
        .sort({ year: -1, month: -1 })
        .skip(skip)
        .limit(limitNum),
      MountsReport.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      reports,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });

  } catch (error) {
    next(error);
  }
}

export async function getMountsReportsById(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    if (!userId) return;

    const { id } = req.params;

    const report = await MountsReport.findOne({ _id: id, userId })
      .populate('budgetId', 'name totalBudget categories');

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Obtener transacciones del mes para análisis detallado
    const startDate = new Date(report.year, report.month - 1, 1);
    const endDate = new Date(report.year, report.month, 0, 23, 59, 59);

    const monthTransactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('categories', 'name parentCategoryId');

    // Análisis por categorías
    const categoryAnalysis = {};
    monthTransactions.forEach(transaction => {
      if (transaction.categories) {
        const categoryName = transaction.categories.name;
        if (!categoryAnalysis[categoryName]) {
          categoryAnalysis[categoryName] = {
            totalAmount: 0,
            transactionCount: 0,
            transactions: []
          };
        }
        categoryAnalysis[categoryName].totalAmount += transaction.amount;
        categoryAnalysis[categoryName].transactionCount += 1;
        categoryAnalysis[categoryName].transactions.push({
          id: transaction._id,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date
        });
      }
    });

    res.status(200).json({
      report,
      monthTransactions,
      categoryAnalysis,
      summary: {
        totalTransactions: monthTransactions.length,
        incomeTransactions: monthTransactions.filter(t => t.amount > 0).length,
        expenseTransactions: monthTransactions.filter(t => t.amount < 0).length,
        budgetUsagePercentage: report.budgetId ? 
          ((report.totalExpense / report.budgetId.totalBudget) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    next(error);
  }
}

export async function deleteMountsReport(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    if (!userId) return;

    const { id } = req.params;

    const deletedReport = await MountsReport.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!deletedReport) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.status(204).send();

  } catch (error) {
    next(error);
  }
}