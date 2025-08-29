import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true });

BatchSchema.statics.getAll = async function() {
  return this.find({});
};

BatchSchema.statics.addStudentsToBatch = async function(batchId, studentIds) {
  return this.updateOne(
    { _id: batchId },
    { $addToSet: { students: { $each: studentIds } } }
  );
};

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);