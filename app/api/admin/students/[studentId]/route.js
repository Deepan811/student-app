
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Batch from '@/models/Batch';
import Finance from '@/models/Finance';
import { verifyToken, isAdmin } from '@/middleware/auth';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }

    const adminVerificationResult = await isAdmin(tokenVerificationResult.data.user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    const { studentId } = params;

    const user = await User.findById(studentId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Remove the student from any batches they are enrolled in
    await Batch.updateMany(
      { 'students.student': studentId },
      { $pull: { students: { student: studentId } } }
    );

    // Delete all finance records for the student
    await Finance.deleteMany({ studentId: studentId });

    // Delete the user
    await User.findByIdAndDelete(studentId);

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ success: false, message: 'Server error while deleting student' }, { status: 500 });
  }
}
