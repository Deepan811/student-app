
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendRegistrationConfirmationEmail } from '@/lib/emailService';

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).populate({ path: 'batches', populate: { path: 'courseId' } });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const { name, email } = await request.json();
    if (!name || !email) {
        return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
        return NextResponse.json({ success: false, message: 'A user with this email already exists' }, { status: 409 });
    }

    const newUser = new User({
        name,
        email,
        role: 'student',
        status: 'pending', // Set status to pending
    });

    await newUser.save();

    // Send registration confirmation email
    try {
      await sendRegistrationConfirmationEmail(email, name);
    } catch (emailError) {
      console.error("Failed to send registration confirmation email to manually added user:", emailError);
      // Non-fatal, the user is already created. Log it and continue.
    }

    return NextResponse.json({
      success: true,
      message: 'Student added successfully. They are now pending approval.',
      data: newUser
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
