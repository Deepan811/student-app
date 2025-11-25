
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Finance from '@/models/Finance';
import Batch from '@/models/Batch';
import User from '@/models/User';
import Course from '@/models/Course';

// GET all transactions
export async function GET(request) {
  await dbConnect();
  try {
    const users = await User.find({}).select('_id');
    const userIds = users.map(user => user._id);

    const query = {
      studentId: { $in: userIds }
    };

    const transactions = await Finance.find(query)
      .populate('studentId', 'name')
      .populate('batchId', 'name')
      .lean();

    const courses = await Course.find({}).select('_id name');
    const courseMap = new Map(courses.map(course => [course._id.toString(), course.name]));

    const populatedTransactions = transactions.map(tx => {
      if (tx.courseId && typeof tx.courseId.toString === 'function') {
        return {
          ...tx,
          courseName: courseMap.get(tx.courseId.toString()) || 'Unknown Course'
        };
      }
      return tx;
    });

    return NextResponse.json({
      success: true,
      data: populatedTransactions,
    });
  } catch (error) {
    console.error("--- FINANCE GET ERROR ---", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST a new transaction
export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    console.log('--- FINANCE POST BODY ---', body);
    const { studentId, batchId, courseId, amount, paymentMethod, type, status } = body;

    // 1. Create the transaction
    const transactionId = `TXN-${Date.now()}`;
    const newTransaction = await Finance.create({
      transactionId,
      studentId,
      batchId,
      courseId,
      amount,
      paymentMethod,
      type,
      status,
    });

    // 2. If the transaction is a completed fee payment for a batch, update the batch
    if (batchId && type === 'Fee Payment' && status === 'Completed') {
      const batch = await Batch.findById(batchId);
      if (batch) {
        const studentInBatch = batch.students.find(s => s.student.toString() === studentId);
        if (studentInBatch) {
          studentInBatch.amountPaid += amount;
          if (studentInBatch.amountPaid >= batch.fees) {
            studentInBatch.paymentStatus = 'paid';
          } else {
            studentInBatch.paymentStatus = 'partially-paid';
          }
          await batch.save();
        }
      }
    }

    // 3. If it's a course payment, update the user's enrolledCourses
    if (courseId && type === 'Fee Payment' && status === 'Completed') {
      const user = await User.findById(studentId);
      if (user) {
        const enrolledCourse = user.enrolledCourses.find(ec => ec.course.toString() === courseId);
        if (enrolledCourse) {
          enrolledCourse.amountPaid += amount;
          enrolledCourse.remainingAmount = enrolledCourse.totalAmount - enrolledCourse.amountPaid;
          if (enrolledCourse.remainingAmount <= 0) {
            enrolledCourse.paymentStatus = 'Paid';
          } else {
            enrolledCourse.paymentStatus = 'Partial';
          }
          await user.save();
        }
      }
    }

    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
