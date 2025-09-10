
import Batch from "../models/Batch.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import dbConnect from "../lib/dbConnect.js";

export const createBatch = async (req, res) => {
  try {
    await dbConnect();
    const { students, ...rest } = req.body;
    const studentObjects = students.map(studentId => ({
      student: studentId,
      paymentStatus: 'unpaid'
    }));

    const batch = new Batch({
      ...rest,
      students: studentObjects
    });

    await batch.save();

    // Update the batch field for all students in the new batch
    if (students && students.length > 0) {
      await User.updateMany(
        { _id: { $in: students } },
        { $set: { batch: batch._id } }
      );
    }

    return { status: 201, success: true, data: batch };
  } catch (error) {
    return { status: 400, success: false, data: { message: error.message } };
  }
};

export const getAllBatches = async (req, res) => {
  try {
    await dbConnect();
    const batches = await Batch.find({}).populate('courseId').populate('students.student');
    const batchesWithDetails = batches.map(batch => {
      const batchObj = batch.toObject();
      return {
        ...batchObj,
        courseName: batch.courseId ? batch.courseId.name : "Course not found",
        students: batch.students.map(s => {
            // Handle cases where a student might have been deleted
            if (!s.student) return null;
            return {
                ...s.student.toObject(),
                paymentStatus: s.paymentStatus,
            }
        }).filter(Boolean) // Filter out any null students
      };
    });
    return { status: 200, success: true, data: batchesWithDetails };
  } catch (error) {
    return { status: 400, success: false, message: error.message };
  }
};

export const getBatchById = async (req, res) => {
  try {
    await dbConnect();
    const batch = await Batch.findById(req.query.batchId).populate('courseId').populate('students.student');
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

export const getBatchStudents = async (req, res) => {
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

export const addStudentsToBatch = async (req, res) => {
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

export const updateStudentPaymentStatus = async (req, res) => {
  try {
    await dbConnect();
    const { batchId, studentId } = req.query;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['paid', 'unpaid'].includes(paymentStatus)) {
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
    await batch.save();

    return { status: 200, success: true, data: batch.students[studentIndex] };
  } catch (error) {
    return { status: 500, success: false, data: { message: error.message } };
  }
};

export const removeStudentFromBatch = async (req, res) => {
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
