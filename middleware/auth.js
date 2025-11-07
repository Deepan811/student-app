import jwt from "jsonwebtoken"
import User from "../models/User"
import Admin from "../models/Admin"

// Verify JWT token
export const verifyToken = async (request) => { // Accept NextRequest object
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") // Get header from NextRequest

    if (!token) {
      return { status: 401, data: { success: false, message: "Access denied. No token provided." } }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // We can't directly modify request.user in Next.js API routes like Express
    // So, we'll return the decoded user data
    return { status: 200, data: { success: true, user: decoded } }
  } catch (error) {
    console.error("Token verification error:", error)
    return { status: 401, data: { success: false, message: "Invalid token" } }
  }
}

// Check if user is admin
export const isAdmin = async (user) => { // Accept user object directly
  
  try {
    if (!user || user.role !== "admin") {
      
      return { status: 403, data: { success: false, message: "Access denied. Admin privileges required." } }
    }

    // Verify admin exists in database
    const admin = await Admin.findById(user.id) // Use user.id
    
    if (!admin) {
      
      return { status: 403, data: { success: false, message: "Admin not found" } }
    }

    // No need to populate req.admin here, just return the admin data
    return { status: 200, data: { success: true, admin: admin } }
  } catch (error) {
    console.error("Admin verification error:", error)
    return { status: 500, data: { success: false, message: "Server error during admin verification" } }
  }
}

// Check if user is approved student
export const isApprovedStudent = async (user) => { // Accept user object directly
  try {
    if (!user || user.role !== "student") {
      return { status: 403, data: { success: false, message: "Access denied. Student privileges required." } }
    }

    // Verify student exists and is approved
    const student = await User.findById(user.id) // Use user.id
    if (!student) {
      return { status: 403, data: { success: false, message: "Student not found" } }
    }

    if (student.status !== "approved") {
      return { status: 403, data: { success: false, message: "Account pending approval. Please wait for admin approval." } }
    }

    // No need to populate req.student here, just return the student data
    return { status: 200, data: { success: true, student: student } }
  } catch (error) {
    console.error("Student verification error:", error)
    return { status: 500, data: { success: false, message: "Server error during student verification" } };
  }
};

// Check if user is trainer
export const isTrainer = async (user) => {
  try {
    if (!user || user.role !== "trainer") {
      return { status: 403, data: { success: false, message: "Access denied. Trainer privileges required." } };
    }

    // Verify trainer exists in database
    const trainer = await User.findById(user.id); // Trainers are also Users
    if (!trainer) {
      return { status: 403, data: { success: false, message: "Trainer not found" } };
    }

    return { status: 200, data: { success: true, trainer: trainer } };
  } catch (error) {
    console.error("Trainer verification error:", error);
    return { status: 500, data: { success: false, message: "Server error during trainer verification" } };
  }
};
