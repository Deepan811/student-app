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
  fees: {
    type: Number,
    required: true,
    default: 0,
  },
  students: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid',
      },
    },
  ],
}, { timestamps: true });

BatchSchema.statics.getAll = async function() {
  return this.find({}).populate('courseId');
};

BatchSchema.statics.addStudentsToBatch = async function(batchId, studentIds) {
  const batch = await this.findById(batchId);
  if (!batch) {
    throw new Error('Batch not found');
  }

  const existingStudentIds = new Set(batch.students.map(s => s.student.toString()));
  const studentsToAdd = studentIds
    .filter(id => !existingStudentIds.has(id.toString()))
    .map(id => ({ student: id, paymentStatus: 'unpaid' }));

  if (studentsToAdd.length > 0) {
    batch.students.push(...studentsToAdd);
    await batch.save();

    // Update the batch field for all newly added students
    const studentObjectIds = studentsToAdd.map(s => s.student);
    await mongoose.model('User').updateMany(
      { _id: { $in: studentObjectIds } },
      { $set: { batch: batchId } }
    );
  }
  return batch;
};

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);