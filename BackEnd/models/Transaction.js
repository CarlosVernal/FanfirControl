import mongoose from 'mongoose';
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // ingresos +, gastos -
  date: { type: Date, required: true },
  categories: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  isRecurrent: { type: Boolean, default: false },
  recurrenceFrequency: { type: String, enum: ['monthly', 'yearly', null], default: null },
  installments: { type: Number, default: 1 }, //cuotas
  installmentsPaid: { type: Number, default: 0 }, //cuotas pagadas
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', TransactionSchema);
