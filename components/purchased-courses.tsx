'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

interface Course {
  _id: string;
  name: string;
  description: string;
}

interface EnrolledCourse {
  course: Course;
  paymentStatus: string;
  amountPaid: number;
  totalAmount: number;
}

export function PurchasedCourses({ courses }: { courses: EnrolledCourse[] }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">My Courses</h2>
      {courses.length === 0 ? (
        <p className="text-slate-300">You have not purchased any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(({ course, paymentStatus, amountPaid, totalAmount }) => (
            <Card key={course._id} className="bg-gray-900/60 border border-gray-700 text-gray-200 hover:border-blue-500 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">{course.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400">{course.description}</p>
                <p><span className="font-semibold text-blue-300">Payment Status:</span>
                  <span className={`ml-2 ${paymentStatus === 'Paid' ? 'text-green-400' : 'text-amber-400'}`}>
                    {paymentStatus}
                  </span>
                </p>
                <p><span className="font-semibold text-blue-300">Amount Paid:</span> ${amountPaid} / ${totalAmount}</p>
                <Link href={`/courses/${course._id}`} className="text-blue-400 hover:underline">
                  Go to Course
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}