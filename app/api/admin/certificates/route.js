import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Certificate from '@/models/Certificate';
import User from '@/models/User';
import Course from '@/models/Course';

// GET all certificates
export async function GET(request) {
  await dbConnect();
  try {
    const certificates = await Certificate.find({})
      .populate({ 
        path: 'student', 
        select: 'name collegeName batches', 
        populate: { 
          path: 'batches', 
          select: 'startDate endDate name courseId' 
        } 
      })
      .populate('course', 'name')
      .sort({ createdAt: -1 }); // Sort by creation date descending
    const formattedCertificates = certificates.map(cert => ({
      ...cert.toObject(),
      startDate: cert.startDate,
      endDate: cert.endDate,
    }));
    return NextResponse.json({ success: true, data: formattedCertificates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST a new certificate
export async function POST(request) {
  await dbConnect();
  try {
    const { studentId, courseId, startDate, endDate } = await request.json();

    if (!studentId || !courseId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Student ID, Course ID, Start Date and End Date are required' }, { status: 400 });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Generate a unique certificate ID
    const certificateId = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const newCertificate = new Certificate({
      student: studentId,
      course: courseId,
      certificateId,
      startDate,
      endDate,
    });

    await newCertificate.save();
    
    // Manually construct the response object to ensure it contains everything
    const populatedCertificate = {
      ...newCertificate.toObject(),
      student: {
        _id: student._id,
        name: student.name,
        collegeName: student.collegeName,
      },
      course: {
        _id: course._id,
        name: course.name,
      },
      startDate: newCertificate.startDate,
      endDate: newCertificate.endDate,
    };

    return NextResponse.json({ success: true, data: populatedCertificate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  await dbConnect();
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Certificate IDs are required' }, { status: 400 });
    }

    await Certificate.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
