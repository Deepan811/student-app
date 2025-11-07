import Trainer from '../models/Trainer.js';
import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';
import { sendWelcomeEmailWithPassword } from '../lib/emailService.js';

export const getAllTrainers = async () => {
  try {
    await dbConnect();
    const trainers = await Trainer.find({}).populate({
      path: 'user',
      select: 'name email' // Only select the fields we need for the dropdown
    }).populate({
      path: 'batches',
      select: 'name' // Only select the name of the batch
    }).populate({
      path: 'courses',
      select: 'name' // Only select the name of the course
    });

    return { status: 200, success: true, data: trainers };
  } catch (error) {
    return { status: 500, success: false, message: error.message };
  }
};

export const createTrainer = async (req) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await dbConnect();
    const { name, email, bio, expertise, courses, profilePicture } = req.body;

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    const randomPassword = Math.random().toString(36).slice(-8);

    const user = new User({
      name,
      email,
      password: randomPassword,
      role: 'trainer',
      status: 'approved',
      passwordChangeRequired: true,
    });
    const savedUser = await user.save({ session });

    const trainer = new Trainer({
      user: savedUser._id,
      bio,
      expertise,
      courses,
      profilePicture: { value: profilePicture },
    });
    await trainer.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send welcome email with credentials
    try {
      await sendWelcomeEmailWithPassword(email, name, randomPassword);
    } catch (emailError) {
      console.error("Failed to send welcome email to trainer user:", emailError);
      // Non-fatal error, the user is already created. Log it and continue.
    }

    return { status: 201, success: true, message: 'Trainer created successfully.' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { status: 400, success: false, message: error.message };
  }
};

export const getTrainerProfile = async (req) => {
  try {
    await dbConnect();
    const userId = req.user.id; // Assuming userId is available from JWT
    console.log("getTrainerProfile: userId:", userId);

    const trainer = await Trainer.findOne({ user: userId })
      .populate({
        path: 'user',
        select: '-password' // Exclude password from user object
      })
      .populate('batches', 'name')
      .populate('courses', 'name');

    console.log("getTrainerProfile: trainer found:", trainer);

    if (!trainer) {
      return { status: 404, success: false, message: "Trainer profile not found." };
    }

    return { status: 200, success: true, data: trainer };
  } catch (error) {
    console.error("Error in getTrainerProfile:", error);
    return { status: 500, success: false, message: error.message };
  }
};

export const updateTrainerProfile = async (req) => {
  try {
    await dbConnect();
    const { name, email, bio, expertise, courses, profilePicture } = req.body;

    // Update User model fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email }, // Only update fields that are in the User model
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return { status: 404, success: false, message: "User not found." };
    }

    // Update Trainer model fields
    const updatedTrainer = await Trainer.findOneAndUpdate(
      { user: userId },
      { bio, expertise, courses, profilePicture: { value: profilePicture } },
      { new: true, runValidators: true }
    );

    if (!updatedTrainer) {
      return { status: 404, success: false, message: "Trainer profile not found." };
    }

    // Re-fetch the full trainer profile to return consistent data
    const trainer = await Trainer.findOne({ user: userId })
      .populate({
        path: 'user',
        select: '-password'
      })
      .populate('batches', 'name')
      .populate('courses', 'name');

    return { status: 200, success: true, message: "Trainer profile updated successfully.", data: trainer };
  } catch (error) {
    console.error("Error in updateTrainerProfile:", error);
    return { status: 500, success: false, message: error.message };
  }
};