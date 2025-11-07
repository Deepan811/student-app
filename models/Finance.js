
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Bank Transfer', 'Cash'],
    required: true,
  },
  type: {
    type: String,
    enum: ['Fee Payment', 'Refund', 'Scholarship'],
    default: 'Fee Payment',
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Pending',
  },
}, { timestamps: true });

const Finance = mongoose.models.Finance || mongoose.model('Finance', transactionSchema);

export default Finance;
