import SavingGoal from "../models/SavingGoal.js";

export async function createSavingGoal(req, res, next) {
    try {
        const { userId, name, targetAmount, currentAmount, dueDate } = req.body;
        if (!userId || !name || !targetAmount || !dueDate) {
            return res.status(400).json({ error: "userId, name, targetAmount y dueDate son requeridos" });
        }
        const savingGoal = new SavingGoal({
            userId,
            name,
            targetAmount,
            currentAmount: currentAmount || 0,
            dueDate,
        });
        const savedSavingGoal = await savingGoal.save();
        res.status(201).json(savedSavingGoal);
    } catch (error) {
        next(error);
    }
}
