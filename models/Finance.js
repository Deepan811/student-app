
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
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
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

transactionSchema.pre('validate', function(next) {
  if (!this.batchId && !this.courseId) {
    next(new Error('Either batchId or courseId must be provided.'));
  } else {
    next();
  }
});

const Finance = mongoose.models.Finance || mongoose.model('Finance', transactionSchema);

export default Finance;
