import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../lib/emailService.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'trainer', 'branch'],
    default: 'student',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  password: {
    type: String,
  },
  passwordChangeRequired: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: String,
  },
  collegeName: {
    type: String,
  },
  departmentName: {
    type: String,
  },
  courseName: {
    type: String,
  },
  socialLinks: [{
    heading: String,
    link: String,
  }],

  profilePicture: {
    type: String,
  },
  // Branch specific fields
  address: {
    type: String,
  },
  gst_number: {
    type: String,
  },
  alt_mobile_number: {
    type: String,
  },
  // student specific fields
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
  }]
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.statics.getPendingUsers = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

UserSchema.statics.getAllUsersForAdmin = function() {
  return this.find({}).sort({ createdAt: -1 });
};

UserSchema.statics.updateStatus = async function(userId, status) {
  if (status === 'approved') {
    const randomPassword = Math.random().toString(36).slice(-8);
    
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    user.status = 'approved';
    user.password = randomPassword; // The pre-save hook will hash it
    user.passwordChangeRequired = true;
    await user.save();

    // Send approval email with credentials
    try {
      await sendEmail({
        to: user.email,
        subject: "Your Account Has Been Approved!",
        html: `
          <h2>Welcome to the Student Management System!</h2>
          <p>Dear ${user.name},</p>
          <p>Your account has been approved by an administrator. You can now log in using your email and the temporary password below:</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> ${randomPassword}</p>
          <p>You will be prompted to change this password upon your first login.</p>
          <br>
          <p>Best regards,<br>Student Management Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Fatal: Email sending failed after user approval:", emailError);
      // We don't revert the approval, just log the aerror. The admin can resend if needed.
    }

    return { ...user.toObject(), plainPassword: randomPassword };
  } else if (status === 'rejected') {
    const user = await this.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) throw new Error('User not found');

    // Send rejection email
    try {
      await sendEmail({
        to: user.email,
        subject: "Update on Your Application",
        html: `
          <h2>Update on Your Application</h2>
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that after careful consideration, your application to the Student Management System has been rejected.</p>
          <p>If you believe this is a mistake or have any questions, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Student Management Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Fatal: Email sending failed after user rejection:", emailError);
    }
    return user;
  } else {
    // For any other status, just update without sending an email.
    return this.findByIdAndUpdate(userId, { status }, { new: true });
  }
};

UserSchema.statics.getAllUsers = async function(page, limit) {
  const total = await this.countDocuments({ status: 'approved' });
  const users = await this.find({ status: 'approved' })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  return {
    users,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

UserSchema.statics.getApprovedStudentsForBatch = function() {
  return this.find({ status: 'approved', role: 'student' }).populate('batches').select('name email batches');
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export const updateProfile = async (userId, updatedData) => {
  try {
    console.log("updateProfile: userId:", userId);
    console.log("updateProfile: updatedData:", updatedData);

    const update = {
      name: updatedData.name,
      mobile: updatedData.mobile,
      collegeName: updatedData.collegeName,
      departmentName: updatedData.departmentName,
      courseName: updatedData.courseName,
      socialLinks: updatedData.socialLinks.map(link => ({
        heading: link.heading,
        link: link.link,
      })),
    };

    if (updatedData.profilePicture) {
      update.profilePicture = updatedData.profilePicture;
    }

    console.log("updateProfile: update object:", update);

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true });

    if (!updatedUser) {
      return null;
    }

    // Repopulate the batch details after update
    const populatedUser = await User.findById(updatedUser._id).populate({
      path: 'batch',
      populate: {
        path: 'courseId',
        model: 'Course'
      }
    });

    console.log("updateProfile: populatedUser:", populatedUser);
    return populatedUser;
  } catch (error) {
    console.error("Error in User.updateProfile:", error);
    throw error;
  }
};

export default User;