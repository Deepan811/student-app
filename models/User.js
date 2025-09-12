import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  generatedPassword: {
    type: String,
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
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
  },
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
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('generatedPassword')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.generatedPassword = await bcrypt.hash(this.generatedPassword, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.generatedPassword);
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
    user.generatedPassword = randomPassword; // The pre-save hook will hash it
    await user.save();

    return { ...user.toObject(), plainPassword: randomPassword };
  } else {
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
  return this.find({ status: 'approved', batch: { $exists: false } }).select('name email');
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