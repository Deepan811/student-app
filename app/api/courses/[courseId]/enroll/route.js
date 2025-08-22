// import Course from "../../../../models/Course"
// import { verifyToken, isApprovedStudent } from "../../../../middleware/auth"
// import { NextResponse } from "next/server"

// export async function POST(request, { params }) {
//   try {
//     const tokenResult = await verifyToken(request)
//     if (tokenResult.status !== 200) {
//       return NextResponse.json(tokenResult.data, { status: tokenResult.status })
//     }

//     const studentResult = await isApprovedStudent(tokenResult.data.user)
//     if (studentResult.status !== 200) {
//       return NextResponse.json(studentResult.data, { status: studentResult.status })
//     }

//     const { courseId } = params
//     const studentId = tokenResult.data.user.id

//     // Check if course exists
//     const course = await Course.findById(courseId)
//     if (!course) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Course not found",
//         },
//         { status: 404 },
//       )
//     }

//     // Check if already enrolled
//     if (course.enrolledStudents.some((id) => id.toString() === studentId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Already enrolled in this course",
//         },
//         { status: 400 },
//       )
//     }

//     // Enroll student
//     const result = await Course.enrollStudent(courseId, studentId)

//     if (result.modifiedCount === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Failed to enroll in course",
//         },
//         { status: 400 },
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Successfully enrolled in course",
//       data: {
//         courseId,
//         studentId,
//         enrolledAt: new Date(),
//       },
//     })
//   } catch (error) {
//     console.error("Course enrollment error:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Server error during enrollment",
//       },
//       { status: 500 },
//     )
//   }
// }
