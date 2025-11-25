import User, { updateProfile as updateUserProfileModel } from "../models/User"
import Admin from "../models/Admin"
import Trainer from '../models/Trainer.js';
import Batch from "../models/Batch.js";
import Course from "../models/Course.js";
import jwt from "jsonwebtoken"
import { sendRegistrationConfirmationEmail, sendEmail } from "../lib/emailService"
import dbConnect from "../lib/dbConnect"

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// Student Registration Controller
export const registerStudent = async (req, res) => {
  try {
    await dbConnect()
    const { name, email } = req.body

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and email",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Create new user with pending status
    const userData = {
      name,
      email,
      role: "student",
      status: "pending",
    }

    const user = new User(userData)
    const result = await user.save()

    // Send registration submission confirmation email
    try {
      await sendEmail({
        to: email,
        subject: "Application Submitted - Student Management System",
        html: `
          <h2>Application Received!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for registering. Your application has been submitted and is currently waiting for administrator approval.</p>
          <p>You will receive another email with your login credentials once your account has been approved.</p>
          <br>
          <p>Best regards,<br>Student Management Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Fatal: Email sending failed after user save:", emailError);
      // Decide whether to revert user save or just log the error
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for confirmation. Your account is pending approval.",
      data: {
        id: result.insertedId,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
}

// Student Login Controller
export const loginStudent = async (req, res) => {
  try {
    await dbConnect()
    const { email, password } = req.body;
    console.log("loginStudent: Attempting login for email:", email);
    console.log("loginStudent: Received password (plain text):", password);

    // Validation
    if (!email || !password) {
      return { status: 400, data: { success: false, message: "Please provide email and password" } };
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return { status: 401, data: { success: false, message: "Invalid credentials" } };
    }

    // Check if user is approved
    if (user.status !== "approved") {
      return { status: 403, data: { success: false, message: "Your account is pending approval. Please wait for admin approval." } };
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log("loginStudent: isPasswordValid:", isPasswordValid);
    if (!isPasswordValid) {
      return { status: 401, data: { success: false, message: "Invalid credentials" } };
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    return {
      status: 200,
      data: {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture,
          passwordChangeRequired: user.passwordChangeRequired,
        },
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { status: 500, data: { success: false, message: "Server error during login" } };
  }
};

// Admin Login Controller
export const loginAdmin = async (req, res) => {
  try {
    await dbConnect()
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Find admin
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      })
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      })
    }

    // Generate token
    const token = generateToken(admin._id, admin.role)

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
        },
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during admin login",
    })
  }
}

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    await dbConnect()
    const { email, userType } = req.body

    if (!email || !userType) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and user type",
      })
    }

    let user
    if (userType === "admin") {
      user = await Admin.findOne({ email })
    } else {
      user = await User.findOne({ email })
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      })
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15)
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // In a real app, you'd save this token to the database
    // For now, we'll just send an email with instructions

    try {
      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset Request</h2>
          <p>Dear ${user.name},</p>
          <p>You have requested to reset your password. Please use the following temporary code:</p>
          <h3 style="background: #f4f4f4; padding: 10px; text-align: center;">${resetToken}</h3>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Student Management Team</p>
        `,
      })

      res.status(200).json({
        success: true,
        message: "Password reset instructions sent to your email",
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      })
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    })
  }
}

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    await dbConnect()
    const userId = req.user.id;
    const userRole = req.user.role;

    let user;
    if (userRole === "admin") {
      user = await Admin.findById(userId);
    } else {
      user = await User.findById(userId).populate('enrolledCourses.course');
    }

    if (!user) {
      return { status: 404, data: { success: false, message: "User not found" } };
    }

    let userObject = user.toObject();

    if (user.role === 'student') {
      userObject.enrolledBatches = []; // Initialize as empty array
      const batches = await Batch.find({ "students.student": userId })
        .populate({
          path: 'courseId',
          select: 'name description price'
        })
        .populate({
          path: 'trainers',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name'
          }
        });

      if (batches && batches.length > 0) {
        const enrolledBatches = batches.map(batch => {
          const studentInBatch = batch.students.find(s => s.student.toString() === userId);
          const trainerName = batch.trainers && batch.trainers.length > 0 && batch.trainers[0].user ? batch.trainers[0].user.name : 'N/A';
          return {
            batchId: batch._id,
            batchName: batch.name,
            course: batch.courseId,
            trainer: { name: trainerName },
            paymentStatus: studentInBatch ? studentInBatch.paymentStatus : 'unknown',
            amountPaid: studentInBatch ? studentInBatch.amountPaid : 0, // Include amount paid here
            fees: batch.fees, // Include batch fees here
          };
        });
        userObject.enrolledBatches = enrolledBatches;
      }
    }

    // If the user is a student and has a batch, find their payment status
    if (userObject.role === 'student' && userObject.batch && userObject.batch.students) {
      const studentInBatch = userObject.batch.students.find(
        (s) => s.student && s.student.toString() === userObject._id.toString()
      );
      
      if (studentInBatch) {
        userObject.paymentStatus = studentInBatch.paymentStatus;
      }
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = userObject;

    return { status: 200, data: { success: true, data: userWithoutPassword } };
  } catch (error) {
    console.error("Get profile error:", error);
    return { status: 500, data: { success: false, message: "Server error while fetching profile" } };
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    await dbConnect()
    const userId = req.user.id;
    const updatedData = req.body;

    const updatedUser = await updateUserProfileModel(userId, updatedData);

    if (!updatedUser) {
      return { status: 404, data: { success: false, message: "User not found" } };
    }

    let userObject = updatedUser.toObject();

    // If the user is a student and has a batch, find their payment status
    if (userObject.role === 'student' && userObject.batch && userObject.batch.students) {
      const studentInBatch = userObject.batch.students.find(
        (s) => s.student && s.student.toString() === userObject._id.toString()
      );
      
      if (studentInBatch) {
        userObject.paymentStatus = studentInBatch.paymentStatus;
      }
    }

    return { status: 200, data: { success: true, data: userObject } };
  } catch (error) {
    console.error("Update profile error:", error);
    return { status: 500, data: { success: false, message: "Server error while updating profile" } };
  }
};

// Force Password Change Controller
export const forceChangePassword = async (req, res) => {
  try {
    await dbConnect();
    const userId = req.user.id;
    const { temporaryPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return { status: 404, data: { success: false, message: "User not found" } };
    }

    // Check if password change is required
    if (!user.passwordChangeRequired) {
      return { status: 400, data: { success: false, message: "Password has already been changed." } };
    }

    // Verify temporary password
    const isPasswordValid = await user.comparePassword(temporaryPassword);
    if (!isPasswordValid) {
      return { status: 401, data: { success: false, message: "Invalid temporary password" } };
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return { status: 400, data: { success: false, message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." } };
    }

    // Update password
    user.password = newPassword;
    user.passwordChangeRequired = false;
    await user.save();

    return { status: 200, data: { success: true, message: "Password changed successfully" } };
  } catch (error) {
    console.error("Force password change error:", error);
    return { status: 500, data: { success: false, message: "Server error during password change" } };
  }
};

