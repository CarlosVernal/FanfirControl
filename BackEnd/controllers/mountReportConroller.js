import MountsReport from '../models/MountsReport.js';
import Budget from '../models/Budget.js';

export async function createMonthlyReport(req, res, next) {
  try {
    const { userId, month, year, totalIncome, totalExpense } = req.body;

    // Buscar presupuesto activo del usuario para ese mes/año
    const activeBudget = await Budget.findOne({ 
      userId, 
      month, 
      year, 
      isActive: true 
    });

    if (!activeBudget) {
      return res.status(400).json({ 
        error: 'No hay presupuesto activo para este mes/año.' 
      });
    }

    // Crear reporte y asociar el presupuesto activo
    const report = new MountsReport({
      userId,
      month,
      year,
      totalIncome: totalIncome || 0,
      totalExpense: totalExpense || 0,
      budgetId: activeBudget._id // asociar presupuesto usado
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);

  } catch (error) {
    next(error);
  }
};

export async function getMountsReportsByUser(req, res, next) {
  try {
    const { userId } = req.params;

    const reports = await MountsReport.find({ userId });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: 'No se encontraron reportes para este usuario.' });
    }

    res.status(200).json(reports);

  } catch (error) {
    next(error);
  }
};

export async function getMountsReportsByDate(req, res, next) {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const reports = await MountsReport.find({
      userId,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: 'No se encontraron reportes para este usuario en el rango de fechas.' });
    }

    res.status(200).json(reports);

  } catch (error) {
    next(error);
  }
};

export async function getMountsReportsByMargin(req, res, next) {
  try {
    const { userId } = req.params;
    const { minMargin, maxMargin } = req.query;

    const reports = await MountsReport.find({
      userId,
      margin: { $gte: minMargin, $lte: maxMargin }
    });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: 'No se encontraron reportes para este usuario en el rango de margen.' });
    }

    res.status(200).json(reports);

  } catch (error) {
    next(error);
  }
};

export async function deleteMountsReport(req, res, next) {
  try {
    const { id } = req.params;

    const deletedReport = await MountsReport.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }

    res.status(200).json({ message: 'Reporte eliminado exitosamente.' });

  } catch (error) {
    next(error);
  }
};

export async function getPositiveMountsReports(req, res, next) {
  try {
    const { userId } = req.params;

    const reports = await MountsReport.find({
      userId,
      margin: { $gt: 0 }
    });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: 'No se encontraron reportes positivos para este usuario.' });
    }

    res.status(200).json(reports);

  } catch (error) {
    next(error);
  }
};

export async function getNegativeMountsReports(req, res, next) {
  try {
    const { userId } = req.params;

    const reports = await MountsReport.find({
      userId,
      margin: { $lt: 0 }
    });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: 'No se encontraron reportes negativos para este usuario.' });
    }

    res.status(200).json(reports);

  } catch (error) {
    next(error);
  }
};
