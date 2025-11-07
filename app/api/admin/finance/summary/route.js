
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Finance from '@/models/Finance';
import Batch from '@/models/Batch';
import User from '@/models/User';

export async function GET(request) {
  await dbConnect();
  try {
    const totalRevenue = await Batch.aggregate([
        {
            $unwind: '$students'
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$students.amountPaid' }
            }
        }
    ]);

    const refunds = await Finance.aggregate([
        { $match: { status: 'Completed', type: 'Refund' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

    const outstandingFees = await Batch.aggregate([
        {
            $unwind: '$students'
        },
        {
            $match: {
                'students.paymentStatus': { $in: ['unpaid', 'partially-paid'] }
            }
        },
        {
            $project: {
                _id: 0,
                studentId: '$students.student',
                outstanding: { $subtract: ['$fees', '$students.amountPaid'] }
            }
        },
        {
            $group: {
                _id: null,
                totalOutstanding: { $sum: '$outstanding' },
                studentsPending: { $addToSet: '$studentId' }
            }
        },
        {
            $project: {
                _id: 0,
                totalOutstanding: 1,
                numberOfStudents: { $size: '$studentsPending' }
            }
        }
    ]);

    const monthlyRevenue = await Finance.aggregate([
        {
            $match: {
                status: 'Completed',
                type: 'Fee Payment',
                transactionDate: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const totalStudents = await User.countDocuments({ role: 'student' });

    const paidStudents = await Batch.aggregate([
        {
            $unwind: '$students'
        },
        {
            $match: {
                'students.paymentStatus': 'paid'
            }
        },
        {
            $group: {
                _id: '$students.student'
            }
        },
        {
            $count: 'count'
        }
    ]);

    const summary = {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      outstandingFees: outstandingFees.length > 0 ? outstandingFees[0].totalOutstanding : 0,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      refunds: refunds.length > 0 ? refunds[0].total : 0,
      pendingStudents: outstandingFees.length > 0 ? outstandingFees[0].numberOfStudents : 0,
      totalStudents: totalStudents,
      paidStudents: paidStudents.length > 0 ? paidStudents[0].count : 0
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
