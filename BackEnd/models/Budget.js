import mongoose from 'mongoose';
const { Schema } = mongoose;

const BudgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  expectedIncome: { type: Number, default: 0 },
  expectedExpense: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

//doble validacion, solo un presupuesto activo por usuario
BudgetSchema.index(
  { userId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model('Budget', BudgetSchema);
