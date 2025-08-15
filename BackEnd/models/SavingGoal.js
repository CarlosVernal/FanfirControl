const mongoose = require('mongoose');
const { Schema } = mongoose;

const SavingGoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  monthlySavingGoal: { type: Number, required: true },
  currentSavedAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  targetDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SavingGoal', SavingGoalSchema);