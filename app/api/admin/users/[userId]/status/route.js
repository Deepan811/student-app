
import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import User from '../../../../../../models/User';
import { verifyToken, isAdmin } from '../../../../../../middleware/auth';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { userId } = params;
    const { status } = await req.json();

    // Middleware checks
    const tokenResult = await verifyToken(req);
    if (tokenResult.status !== 200) {
      return NextResponse.json(tokenResult.data, { status: tokenResult.status });
    }

    const adminResult = await isAdmin(tokenResult.data.user);
    if (adminResult.status !== 200) {
      return NextResponse.json(adminResult.data, { status: adminResult.status });
    }
    // End of middleware checks

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const updatedUser = await User.updateStatus(userId, status);

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ message: 'Error updating user status' }, { status: 500 });
  }
}
