const Transaction = require("../models/Transaction")

exports.createTransaction = async (req, res, next) => {
    try {
        const { userId, description, amount, date, categories, isRecurrent, recurrenceFrequency, installments } = req.body;
        if (!userId || !description || !amount || !date) {
            return res.status(400).json({ error: "userId, description, amount y date son requeridos" });
        }
        const transaction = new Transaction({
            userId,
            description,
            amount,
            date,
            categories,
            isRecurrent: isRecurrent || false,
            recurrenceFrequency: recurrenceFrequency || null,
            installments: installments || 1,
        });
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        next(error);
    }
};

exports.getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

exports.getTransactionById = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
        if (!transaction) {
            return res.status(404).json({ error: "Transacción no encontrada" });
        }
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

exports.getTransactionInRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const transactions = await Transaction.find({
            userId: req.userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

exports.updateTransaction = async (req, res, next) => {
    try {
        const { description, amount, date, categories, isRecurrent, recurrenceFrequency, installments } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { description, amount, date, categories, isRecurrent, recurrenceFrequency, installments },
            { new: true }
        );
        if (!transaction) {
            return res.status(404).json({ error: "Transacción no encontrada" });
        }
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
};

exports.deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!transaction) {
            return res.status(404).json({ error: "Transacción no encontrada" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
