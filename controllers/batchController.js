
import Batch from "../models/Batch.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

export const createBatch = async (req, res) => {
  try {
    const batch = new Batch(req.body)
    await batch.save()
    return { status: 201, success: true, data: batch }
  } catch (error) {
    return { status: 400, success: false, data: { message: error.message } }
  }
}

export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find({}).populate('courseId');
    const batchesWithCourses = batches.map(batch => {
      const batchObj = batch.toObject();
      return {
        ...batchObj,
        courseName: batch.courseId ? batch.courseId.name : "Course not found"
      };
    });
    return { status: 200, success: true, data: batchesWithCourses };
  } catch (error) {
    return { status: 400, success: false, message: error.message };
  }
};

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.query.batchId)
    if (!batch) {
      return { status: 404, data: { message: "Batch not found" } }
    }
    return { status: 200, data: batch }
  } catch (error) {
    return { status: 400, data: { message: error.message } }
  }
}

export const getBatchStudents = async (req, res) => {
  try {
    const batch = await Batch.findById(req.query.batchId)
    if (!batch) {
      return { status: 404, success: false, data: { message: "Batch not found" } }
    }
    const students = await Promise.all(
      batch.students.map(async (studentId) => {
        const user = await User.findById(studentId)
        return user
      })
    )
    return { status: 200, success: true, data: students }
  } catch (error) {
    return { status: 400, success: false, data: { message: error.message } }
  }
}

export const addStudentsToBatch = async (req, res) => {
  try {
    const { batchId } = req.query;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return { status: 400, data: { message: "studentIds must be an array." } };
    }

    const result = await Batch.addStudentsToBatch(batchId, studentIds);

    if (result.matchedCount === 0) {
      return { status: 404, data: { message: "Batch not found." } };
    }

    return { status: 200, data: { message: "Students added successfully." } };
  } catch (error) {
    return { status: 500, data: { message: error.message } };
  }
};
