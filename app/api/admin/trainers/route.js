import { NextResponse } from 'next/server';
import { verifyToken, isAdmin } from '@/middleware/auth';
import User from '@/models/User';
import Trainer from '@/models/Trainer';
import dbConnect from '@/lib/dbConnect';

export async function POST(request) {
  await dbConnect();

  const tokenVerification = await verifyToken(request);
  if (tokenVerification.status !== 200) {
    return NextResponse.json(tokenVerification.data, { status: tokenVerification.status });
  }

  const adminVerification = await isAdmin(tokenVerification.data.user);
  if (adminVerification.status !== 200) {
    return NextResponse.json(adminVerification.data, { status: adminVerification.status });
  }

  const { name, email, bio, expertise, profilePicture, courses } = await request.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 400 });
  }

  const randomPassword = Math.random().toString(36).slice(-8);

  const newUser = new User({
    name,
    email,
    role: 'trainer',
    status: 'approved',
    generatedPassword: randomPassword,
  });

  try {
    await newUser.save();
  } catch (userError) {
    return NextResponse.json({ message: userError.message }, { status: 500 });
  }

  const newTrainer = new Trainer({
    user: newUser._id,
    bio,
    expertise,
    profilePicture,
    courses,
  });

  try {
    await newTrainer.save();
  } catch (trainerError) {
    await User.findByIdAndDelete(newUser._id);
    return NextResponse.json({ message: trainerError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { user: newUser, trainer: newTrainer } }, { status: 201 });
}

export async function GET(request) {
  await dbConnect();

  try {
    const trainers = await Trainer.find({}).populate('user', 'name email').populate('courses', 'name');
    return NextResponse.json({ success: true, data: trainers });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}