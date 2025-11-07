
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Finance from '@/models/Finance';
import Batch from '@/models/Batch';
import User from '@/models/User';

// GET all transactions
export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const studentId = searchParams.get('studentId');

    let query = {};
    if (studentId) {
      query.studentId = studentId;
    }

    const transactions = await Finance.find(query)
      .populate('studentId', 'name')
      .populate('batchId', 'name')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ transactionDate: -1 });

    const total = await Finance.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST a new transaction
export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { studentId, batchId, amount, paymentMethod, type, status } = body;

    // 1. Create the transaction
    const transactionId = `TXN-${Date.now()}`;
    const newTransaction = await Finance.create({
      transactionId,
      studentId,
      batchId,
      amount,
      paymentMethod,
      type,
      status,
    });

    // 2. If the transaction is a completed fee payment, update the batch
    if (type === 'Fee Payment' && status === 'Completed') {
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

    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
