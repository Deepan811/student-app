import { NextResponse } from 'next/server';
import { verifyToken, isAdmin } from '@/middleware/auth';
import Company from '@/models/Company';
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
    const { name, logo, website, industry, description } = await request.json();

    const newCompany = new Company({
      name,
      logo,
      website,
      industry,
      description,
    });

    await newCompany.save();

    return NextResponse.json({ success: true, data: newCompany }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  await dbConnect();

  try {
    const companies = await Company.find({});
    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
