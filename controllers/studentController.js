import Batch from "../models/Batch.js";
import User from "../models/User.js";
import dbConnect from "../lib/dbConnect.js";

export const getStudentDashboard = async (req) => {
  try {
    await dbConnect();
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return { status: 404, success: false, message: "User not found" };
    }

    // Find all batches where the student is enrolled
    const batches = await Batch.find({ "students.student": userId })
      .populate({
        path: 'courseId',
        select: 'name description fees' // Select the fields you need from Course
      })
      .populate({
        path: 'trainerId',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name' // Select the trainer's name from the User model
        }
      });

    if (!batches || batches.length === 0) {
      return { status: 200, success: true, data: [] }; // Return empty array if no batches found
    }

    // Restructure the data to be more frontend-friendly
    const dashboardData = batches.map(batch => {
      const studentInBatch = batch.students.find(s => s.student.toString() === userId);
      return {
        batchId: batch._id,
        batchName: batch.name,
        course: batch.courseId,
        trainer: batch.trainerId.user, // Access the populated user object
        paymentStatus: studentInBatch ? studentInBatch.paymentStatus : 'unknown',
      };
    });

    return { status: 200, success: true, data: { user, courses: dashboardData } };

  } catch (error) {
    console.error("Error in getStudentDashboard:", error);
    return { status: 500, success: false, message: "Server error while fetching dashboard data." };
  }
};

export const getMyBatchDetails = async (req, res) => {
  try {
    await dbConnect();
    const userId = req.user.id; // Assuming this is set by auth middleware

    const batch = await Batch.findOne({ "students.student": userId })
      .populate('courseId', 'name description'); // Populate course details

    if (!batch) {
      // It's not an error if a student isn't in a batch yet.
      return { status: 200, success: true, data: null };
    }

    // Find the specific student's details within the batch
    const studentInBatch = batch.students.find(s => s.student.toString() === userId);

    const batchDetails = {
      _id: batch._id,
      name: batch.name,
      startDate: batch.startDate,
      endDate: batch.endDate,
      fees: batch.fees,
      course: batch.courseId,
      paymentStatus: studentInBatch ? studentInBatch.paymentStatus : 'unknown',
    };

    return { status: 200, success: true, data: batchDetails };
  } catch (error) {
    console.error("Error in getMyBatchDetails:", error);
    return { status: 500, success: false, message: "Server error while fetching batch details." };
  }
};
