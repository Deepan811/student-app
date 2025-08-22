import User from "../models/User"
import Admin from "../models/Admin"
import { sendEmail } from "../lib/emailService"

// Get all pending users for approval
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.getPendingUsers()
    console.log("Fetched pending users:", pendingUsers);

    return { status: 200, data: { success: true, users: pendingUsers, count: pendingUsers.length } }
  } catch (error) {
    console.error("Get pending users error:", error)
    return { status: 500, data: { success: false, message: "Server error while fetching pending users" } }
  }
}

// Get all users for admin debugging
export const viewAllUsers = async (req, res) => {
  try {
    const allUsers = await User.getAllUsersForAdmin()
    res.status(200).json({
      success: true,
      users: allUsers,
      count: allUsers.length,
    })
  } catch (error) {
    console.error("View all users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching all users",
    })
  }
}

// Approve or reject user registration
export const updateUserStatus = async (req, res) => {
  console.log("Controller: updateUserStatus - Started")
  try {
    const { userId } = req.params
    const { status, reason } = req.body

    if (!["approved", "rejected"].includes(status)) {
      console.log("Controller: updateUserStatus - Invalid status provided")
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      })
    }

    // Get user details before updating
    const user = await User.findById(userId)
    if (!user) {
      console.log("Controller: updateUserStatus - User not found")
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log(`Controller: updateUserStatus - Calling User.updateStatus for user ${userId} with status ${status}`)
    const result = await User.updateStatus(userId, status)
    console.log("Controller: updateUserStatus - User.updateStatus returned", result)

    if (result.modifiedCount === 0) {
      console.log("Controller: updateUserStatus - Failed to update user status in DB")
      return res.status(400).json({
        success: false,
        message: "Failed to update user status",
      })
    }

    console.log("Controller: updateUserStatus - Attempting to send email")
    try {
      let emailSubject, emailContent

      if (status === "approved") {
        emailSubject = "Account Approved - Your Login Credentials"
        emailContent = `
          <h2>Congratulations! Your Account Has Been Approved</h2>
          <p>Dear ${user.name},</p>
          <p>Great news! Your account has been approved by our administrators.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Password:</strong> ${result.plainPassword}</p>
          </div>
          
          <p><strong>Important:</strong> Please save these credentials securely and consider changing your password after first login.</p>
          <p>You can now log in to your account and start exploring our courses.</p>
          <p>Welcome to our learning community!</p>
          <br>
          <p>Best regards,<br>Student Management Team</p>
        `
      } else {
        
        emailSubject = "Account Registration Update"
        emailContent = `
          <h2>Account Registration Update</h2>
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that your account registration has been declined.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>If you believe this is an error, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Student Management Team</p>
        `
      }

      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailContent,
      })
      console.log("Controller: updateUserStatus - Email sent successfully")
    } catch (emailError) {
      console.error("Controller: updateUserStatus - Email sending failed:", emailError)
      // Continue even if email fails
    }

    console.log("Controller: updateUserStatus - Sending final response")
    return { status: 200, data: {
      success: true,
      message: `User ${status} successfully${status === "approved" ? " and password sent via email" : ""}`,
      data: {
        userId,
        status,
        updatedAt: new Date(),
      },
    } }
  } catch (error) {
    console.error("Controller: updateUserStatus - Caught error:", error)
    return { status: 500, data: {
      success: false,
      message: "Server error while updating user status",
    } }
  }
}

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const result = await User.getAllUsers(page, limit)

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalUsers: result.total,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    })
  }
}

// Create new admin (super admin only)
export const createAdmin = async (req) => {
  try {
    const { name, email, password, permissions } = req.body

    // Check if admin already exists
    const existingAdmin = await Admin.findByEmail(email)
    if (existingAdmin) {
      return { status: 400, data: {
        success: false,
        message: "Admin already exists with this email",
      } }
    }

    // Create new admin
    const adminData = {
      name,
      email,
      password,
      permissions: permissions || ["manage_users", "manage_courses"],
    }

    const admin = new Admin(adminData)
    const result = await admin.save()

    return { status: 201, data: {
      success: true,
      message: "Admin created successfully",
      data: {
        id: result.insertedId,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
      },
    } }
  } catch (error) {
    console.error("Create admin error:", error)
    return { status: 500, data: {
      success: false,
      message: "Server error while creating admin",
    } }
  }
}
