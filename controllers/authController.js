import User, { updateProfile as updateUserProfileModel } from "../models/User"
import Admin from "../models/Admin"
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

    // Send confirmation email BEFORE saving the user
    try {
      await sendRegistrationConfirmationEmail(email, name)
    } catch (emailError) {
      console.error("Fatal: Email sending failed during registration:", emailError)
      return res.status(500).json({
        success: false,
        message: `Failed to send confirmation email. Please try again later. Error: ${emailError.message}`,
      })
    }

    // Create new user since email was sent successfully
    const userData = {
      name,
      email,
      role: "student",
      status: "pending",
    }

    const user = new User(userData)
    const result = await user.save()

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
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            profilePicture: user.profilePicture,
          },
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
      user = await User.findById(userId).populate({
        path: 'batch',
        populate: {
          path: 'courseId',
          model: 'Course'
        }
      });
    }

    if (!user) {
      return { status: 404, data: { success: false, message: "User not found" } };
    }

    let userObject = user.toObject();

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
