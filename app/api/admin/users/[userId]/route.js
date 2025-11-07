
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function PUT(request, { params }) {
  await dbConnect();
  try {
    const { userId } = params;
    const { collegeName } = await request.json();

    if (!collegeName) {
      return NextResponse.json({ success: false, error: 'College name is required' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { collegeName }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
