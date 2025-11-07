
import Batch from "../models/Batch.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Trainer from "../models/Trainer.js";
import mongoose from "mongoose";
import dbConnect from "../lib/dbConnect.js";

const createBatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await dbConnect();
    const { students = [], trainerIds = [], ...rest } = req.body;

    // Validate if any student is already in 3 batches
    const studentsToUpdate = await User.find({ _id: { $in: students } }).select("batches").session(session);

    for (const student of studentsToUpdate) {
      if (student.batches.length >= 3) {
        await session.abortTransaction();
        session.endSession();
        return { status: 400, success: false, data: { message: `Student ${student._id} is already in 3 batches.` } };
      }
    }

    const studentObjects = students.map(studentId => ({
      student: studentId,
      paymentStatus: 'unpaid'
    }));

    const batchData = {
      ...rest,
      students: studentObjects,
      trainers: trainerIds,
    };

    const batch = new Batch(batchData);
    const savedBatch = await batch.save({ session });

    // Update the batches field for all students in the new batch
    if (students.length > 0) {
      await User.updateMany(
        { _id: { $in: students } },
        { $push: { batches: savedBatch._id } },
        { session }
      );
    }

    // Update the batches field for all trainers in the new batch
    if (trainerIds.length > 0) {
      await Trainer.updateMany(
        { _id: { $in: trainerIds } },
        { $push: { batches: savedBatch._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { status: 201, success: true, data: savedBatch };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { status: 400, success: false, data: { message: error.message } };
  }
};

const getAllBatches = async (req, res) => {
  try {
    await dbConnect();
    const batches = await Batch.find({}).populate('courseId').populate('students.student').populate({ path: 'trainers', populate: { path: 'user' } });
    const batchesWithDetails = batches.map(batch => {
      const batchObj = batch.toObject();
      return {
        ...batchObj,
        courseName: batch.courseId ? batch.courseId.name : "Course not found",
        students: (batch.students || []).map(s => {
            if (!s.student) return null;
            return {
                student: s.student.toObject(),
                paymentStatus: s.paymentStatus,
                amountPaid: s.amountPaid,
            }
        }).filter(Boolean), // Filter out any null students
      };
    });
    return { status: 200, success: true, data: batchesWithDetails };
  } catch (error) {
    console.error("Error in getAllBatches:", error);
    return { status: 400, success: false, message: error.message };
  }
};

const getBatchById = async (req, res) => {
  try {
    await dbConnect();
    const batch = await Batch.findById(req.query.batchId).populate('courseId').populate('students.student').populate({ path: 'trainers', populate: { path: 'user' } });
    if (!batch) {
      return { status: 404, data: { message: "Batch not found" } }
    }
     const batchObj = batch.toObject();
     const result = {
        ...batchObj,
        courseName: batch.courseId ? batch.courseId.name : "Course not found",
        students: batch.students.map(s => {
            if (!s.student) return null;
            return {
                ...s.student.toObject(),
                paymentStatus: s.paymentStatus,
            }
        }).filter(Boolean)
     }
    return { status: 200, data: result }
  } catch (error) {
    return { status: 400, data: { message: error.message } }
  }
}

const getBatchStudents = async (req, res) => {
  try {
    await dbConnect();
    const batch = await Batch.findById(req.query.batchId).populate('students.student');
    if (!batch) {
      return { status: 404, success: false, data: { message: "Batch not found" } };
    }
    const students = batch.students.map(s => {
        if (!s.student) return null;
        return {
            ...s.student.toObject(),
            paymentStatus: s.paymentStatus,
            _id: s.student._id
        }
    }).filter(Boolean);

    return { status: 200, success: true, data: students };
  } catch (error) {
    return { status: 400, success: false, data: { message: error.message } }
  }
};

const addStudentsToBatch = async (req, res) => {
  try {
    await dbConnect();
    const { batchId } = req.query;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return { status: 400, data: { message: "studentIds must be an array." } };
    }

    const batch = await Batch.addStudentsToBatch(batchId, studentIds);

    if (!batch) {
        return { status: 404, data: { message: "Batch not found." } };
    }

    return { status: 200, success: true, data: { message: "Students added successfully.", batch } };
  } catch (error) {
    return { status: 500, data: { message: error.message } };
  }
};

const updateStudentPaymentStatus = async (req, res) => {
  try {
    await dbConnect();
    const { batchId, studentId } = req.query;
    const { paymentStatus, amountPaid } = req.body;

    if (!paymentStatus || !['paid', 'unpaid', 'partially-paid'].includes(paymentStatus)) {
      return { status: 400, success: false, data: { message: "Invalid payment status." } };
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return { status: 404, success: false, data: { message: "Batch not found." } };
    }

    const studentIndex = batch.students.findIndex(s => s.student.toString() === studentId);
    if (studentIndex === -1) {
      return { status: 404, success: false, data: { message: "Student not found in this batch." } };
    }

    batch.students[studentIndex].paymentStatus = paymentStatus;
    if (paymentStatus === 'partially-paid' && typeof amountPaid === 'number') {
      batch.students[studentIndex].amountPaid = amountPaid;
      // If partially-paid amount equals total fees, set status to paid
      if (amountPaid >= batch.fees) {
        batch.students[studentIndex].paymentStatus = 'paid';
      }
    } else if (paymentStatus === 'paid') {
      batch.students[studentIndex].amountPaid = batch.fees; // Set amountPaid to full fees if paid
    } else if (paymentStatus === 'unpaid') {
      batch.students[studentIndex].amountPaid = 0; // Set amountPaid to 0 if unpaid
    }

    await batch.save();

    return { status: 200, success: true, data: batch.students[studentIndex] };
  } catch (error) {
    return { status: 500, success: false, data: { message: error.message } };
  }
};

const removeStudentFromBatch = async (req, res) => {
  try {
    await dbConnect();
    const { batchId, studentId } = req.query;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return { status: 404, success: false, data: { message: "Batch not found." } };
    }

    const studentIndex = batch.students.findIndex(s => s.student.toString() === studentId);
    if (studentIndex === -1) {
      return { status: 404, success: false, data: { message: "Student not found in this batch." } };
    }

    batch.students.splice(studentIndex, 1);
    await batch.save();

    // Clear the batch field for the removed student
    await User.findByIdAndUpdate(studentId, { $unset: { batch: "" } });

    return { status: 200, success: true, data: { message: "Student removed successfully." } };
  } catch (error) {
    return { status: 500, success: false, data: { message: error.message } };
  }
};

const deleteBatchById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await dbConnect();
    const { batchId } = req.query;

    const batch = await Batch.findById(batchId).session(session);
    if (!batch) {
      await session.abortTransaction();
      session.endSession();
      return { status: 404, success: false, data: { message: "Batch not found." } };
    }

    // Remove batch reference from associated students
    await User.updateMany(
      { batches: batchId },
      { $pull: { batches: batchId } },
      { session }
    );

    // Remove batch reference from associated trainers
    await Trainer.updateMany(
      { batches: batchId },
      { $pull: { batches: batchId } },
      { session }
    );

    await Batch.findByIdAndDelete(batchId).session(session);

    await session.commitTransaction();
    session.endSession();
    return { status: 200, success: true, data: { message: "Batch deleted successfully." } };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { status: 500, success: false, data: { message: error.message } };
  }
};

const deleteManyBatches = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await dbConnect();
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return { status: 400, success: false, data: { message: "Batch IDs are required." } };
    }

    // For each batch, remove references from students and trainers
    const batchesToDelete = await Batch.find({ _id: { $in: ids } }).session(session);

    for (const batch of batchesToDelete) {
      await User.updateMany(
        { batches: batch._id },
        { $pull: { batches: batch._id } },
        { session }
      );
      await Trainer.updateMany(
        { batches: batch._id },
        { $pull: { batches: batch._id } },
        { session }
      );
    }

    await Batch.deleteMany({ _id: { $in: ids } }).session(session);

    await session.commitTransaction();
    session.endSession();
    return { status: 200, success: true, data: { message: "Batches deleted successfully." } };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { status: 500, success: false, data: { message: error.message } };
  }
};

const deleteAllBatches = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await dbConnect();

    // Clear batch field for all users
    await User.updateMany(
      { batches: { $exists: true } },
      { $set: { batches: [] } },
      { session }
    );

    // Clear all batch references from all trainers
    await Trainer.updateMany(
      { batches: { $exists: true, $ne: [] } },
      { $set: { batches: [] } },
      { session }
    );

    await Batch.deleteMany({}).session(session);

    await session.commitTransaction();
    session.endSession();
    return { status: 200, success: true, data: { message: "All batches deleted successfully." } };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { status: 500, success: false, data: { message: error.message } };
  }
};

export {
  createBatch,
  getAllBatches,
  getBatchById,
  getBatchStudents,
  addStudentsToBatch,
  updateStudentPaymentStatus,
  removeStudentFromBatch,
  deleteBatchById,
  deleteManyBatches,
  deleteAllBatches,
};
