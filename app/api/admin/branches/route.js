import { NextResponse } from 'next/server';
import { verifyToken, isAdmin } from '@/middleware/auth';
import Branch from '@/models/Branch';
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

  try {
    const { name, location, manager } = await request.json();

    const newBranch = new Branch({
      name,
      location,
      manager,
    });

    await newBranch.save();

    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  await dbConnect();

  try {
    const branches = await Branch.find({});
    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
