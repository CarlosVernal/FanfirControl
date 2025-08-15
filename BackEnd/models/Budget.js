const mongoose = require('mongoose');
const { Schema } = mongoose;

const BudgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  expectedIncome: { type: Number, default: 0 },
  expectedExpense: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Budget', BudgetSchema);
