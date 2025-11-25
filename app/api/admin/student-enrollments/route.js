import { NextResponse } from "next/server";
import Course from "@/models/Course";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { verifyToken, isAdmin } from "@/middleware/auth";

export async function GET(request) {
  try {
    // 1. Authentication and Authorization
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const adminVerificationResult = await isAdmin(user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    // 2. Database Connection
    await dbConnect();

    // 3. Fetch all courses and populate the students enrolled in them
    const courses = await Course.find({}).populate({
      path: 'enrolledStudents',
      model: 'User',
      // We need to access the enrolledCourses of the student to get payment details
      populate: {
        path: 'enrolledCourses.course',
        model: 'Course',
        select: 'name'
      }
    });

    // 4. Transform the data to be student-centric
    const studentEnrollments = {};

    courses.forEach(course => {
      course.enrolledStudents.forEach(student => {
        // If the student is not yet in our map, add them
        if (!studentEnrollments[student._id]) {
          studentEnrollments[student._id] = {
            _id: student._id,
            name: student.name,
            email: student.email,
            mobile: student.mobile,
            paymentStatus: student.paymentStatus, // This is the student's overall payment status
            enrolledCourses: [],
          };
        }

        // Find the specific enrollment details from the student's record
        const enrollmentDetails = student.enrolledCourses.find(
          ec => ec.course && ec.course._id.toString() === course._id.toString()
        );

        // Add the course to the student's list of enrolled courses
        studentEnrollments[student._id].enrolledCourses.push({
          course: {
            _id: course._id,
            name: course.name,
            description: course.description,
            duration: course.duration,
            price: course.price,
            discountPrice: course.discountPrice,
            instructor: course.instructor,
            level: course.level,
            category: course.category,
          },
          // Add payment details if found
          totalAmount: enrollmentDetails ? enrollmentDetails.totalAmount : 0,
          amountPaid: enrollmentDetails ? enrollmentDetails.amountPaid : 0,
          remainingAmount: enrollmentDetails ? enrollmentDetails.remainingAmount : 0,
          paymentStatus: enrollmentDetails ? enrollmentDetails.paymentStatus : 'Pending',
        });
      });
    });

    // 5. Convert the map of students to an array
    const studentsArray = Object.values(studentEnrollments);

    return NextResponse.json({ success: true, data: studentsArray }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/admin/student-enrollments:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch student enrollments", error: error.message }, { status: 500 });
  }
}
