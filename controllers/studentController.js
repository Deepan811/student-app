import Batch from "../models/Batch.js";
import User from "../models/User.js";
import dbConnect from "../lib/dbConnect.js";

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
