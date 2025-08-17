import mongoose from "mongoose";
const { Schema } = mongoose;

const MountsReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  margin: { type: Number, default: 0 }, // Calculated as totalIncome - totalExpense
  budgetId: { type: Schema.Types.ObjectId, ref: 'Budget', required: true }, // Presupuesto usado
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MountsReport', MountsReportSchema);
