
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Finance from '@/models/Finance';
import Batch from '@/models/Batch';
import User from '@/models/User';

export async function GET(request) {
  await dbConnect();
  try {
    const totalRevenue = await Finance.aggregate([
        {
            $match: {
                status: { $in: ['Completed', 'Partial'] },
                type: 'Fee Payment'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const refunds = await Finance.aggregate([
        { $match: { status: 'Completed', type: 'Refund' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

    const outstandingFeesFromBatches = await Batch.aggregate([
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
                studentsPending: 1
            }
        }
    ]);

    const outstandingFeesFromCourses = await User.aggregate([
        { $unwind: '$enrolledCourses' },
        { $match: { 'enrolledCourses.paymentStatus': { $in: ['Pending', 'Partial'] } } },
        {
            $group: {
                _id: null,
                totalOutstanding: { $sum: '$enrolledCourses.remainingAmount' },
                studentsPending: { $addToSet: '$_id' }
            }
        }
    ]);

    const batchOutstanding = outstandingFeesFromBatches.length > 0 ? outstandingFeesFromBatches[0].totalOutstanding : 0;
    const courseOutstanding = outstandingFeesFromCourses.length > 0 ? outstandingFeesFromCourses[0].totalOutstanding : 0;
    const totalOutstandingFees = batchOutstanding + courseOutstanding;

    const batchPendingStudents = outstandingFeesFromBatches.length > 0 ? outstandingFeesFromBatches[0].studentsPending : [];
    const coursePendingStudents = outstandingFeesFromCourses.length > 0 ? outstandingFeesFromCourses[0].studentsPending : [];
    const allPendingStudents = new Set([...batchPendingStudents.map(id => id.toString()), ...coursePendingStudents.map(id => id.toString())]);


    const monthlyRevenue = await Finance.aggregate([
        {
            $match: {
                status: { $in: ['Completed', 'Partial'] },
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

    const paidStudents = await Finance.aggregate([
        {
            $match: {
                status: 'Completed',
                type: 'Fee Payment'
            }
        },
        {
            $group: {
                _id: '$studentId'
            }
        },
        {
            $count: 'count'
        }
    ]);

    const summary = {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      outstandingFees: totalOutstandingFees,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      refunds: refunds.length > 0 ? refunds[0].total : 0,
      pendingStudents: allPendingStudents.size,
      totalStudents: totalStudents,
      paidStudents: paidStudents.length > 0 ? paidStudents[0].count : 0
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
