import Course from '../models/Course';
import User from '../models/User';
import dbConnect from '../lib/dbConnect';
import Finance from '../models/Finance';

export const enrollCourse = async (req) => {
  try {
    await dbConnect();
    const { courseId, paymentOption, paymentMethod } = req.body;
    const userId = req.user.id; // Assuming verifyToken middleware adds user to req

    const course = await Course.findById(courseId);
    if (!course) {
      return { status: 404, success: false, message: 'Course not found' };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { status: 404, success: false, message: 'User not found' };
    }

    // Check if user is already enrolled in the course via Course.enrolledStudents
    if (course.enrolledStudents.includes(userId)) {
      return { status: 400, success: false, message: 'User is already enrolled in this course' };
    }

    // Ensure enrolledCourses is an array on the User model
    if (!Array.isArray(user.enrolledCourses)) {
      user.enrolledCourses = [];
    }

    // Check if the course is already in the user's enrolledCourses via User.enrolledCourses
    // This checks if there's an enrollment record with this courseId
    if (user.enrolledCourses.some(ec => ec.course.toString() === courseId)) {
      return { status: 400, success: false, message: 'User is already enrolled in this course' };
    }

    course.enrolledStudents.push(userId);

    // Calculate payment details based on paymentOption
    let amountPaid;
    let remainingAmount;
    let paymentStatus;

    if (paymentOption === 'full') {
      amountPaid = course.price;
      remainingAmount = 0;
      paymentStatus = 'Paid';
    } else if (paymentOption === 'partial') {
      amountPaid = course.price / 2;
      remainingAmount = course.price / 2;
      paymentStatus = 'Partial';
    } else {
      // Default to pending if paymentOption is not provided or recognized
      amountPaid = 0;
      remainingAmount = course.price;
      paymentStatus = 'Pending';
    }

    // Create the new enrollment subdocument
    const newEnrollment = {
      course: courseId,
      totalAmount: course.price,
      amountPaid,
      remainingAmount,
      paymentStatus,
      paymentMethod,
    };

    user.enrolledCourses.push(newEnrollment);

    user.markModified('enrolledCourses');

    // Create a new finance record
    if (amountPaid > 0) {
      const transactionId = `TXN-${Date.now()}`;
      const newTransaction = new Finance({
        transactionId,
        studentId: userId,
        courseId,
        amount: amountPaid,
        paymentMethod,
        type: 'Fee Payment',
        status: 'Completed',
      });
      await newTransaction.save();
    }

    await course.save();
    await user.save();

    return { status: 200, success: true, message: 'Enrolled successfully' };
  } catch (error) {
    console.error("Error in enrollCourse:", error);
    return { status: 500, success: false, message: 'Server error', error: error.message };
  }
};
