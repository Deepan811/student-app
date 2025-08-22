// import Course from "../../../models/Course"
// import { verifyToken, isApprovedStudent } from "../../../middleware/auth"

// import Course from "../../../models/Course"
// import { verifyToken, isApprovedStudent } from "../../../middleware/auth"
// import { NextResponse } from "next/server"

// export async function GET(request) {
//   try {
//     const tokenResult = await verifyToken(request)
//     if (tokenResult.status !== 200) {
//       return NextResponse.json(tokenResult.data, { status: tokenResult.status })
//     }

//     const studentResult = await isApprovedStudent(tokenResult.data.user)
//     if (studentResult.status !== 200) {
//       return NextResponse.json(studentResult.data, { status: studentResult.status })
//     }

//     const studentId = tokenResult.data.user.id
//     const enrolledCourses = await Course.getEnrolledCourses(studentId)

//     return NextResponse.json({
//       success: true,
//       data: enrolledCourses,
//       count: enrolledCourses.length,
//     })
//   } catch (error) {
//     console.error("Get enrolled courses error:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Server error while fetching enrolled courses",
//       },
//       { status: 500 },
//     )
//   }
// }
