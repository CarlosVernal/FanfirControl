import mongoose from 'mongoose';
const { Schema } = mongoose;

const CategorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  parentCategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Category', CategorySchema);
