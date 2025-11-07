
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const EnrolledCourses = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return <p className="text-gray-400">You are not enrolled in any courses.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <Card key={course.batchId} className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>{course.course.name}</CardTitle>
            <CardDescription className="text-gray-400">Batch: {course.batchName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><span className="font-semibold">Trainer:</span> {course.trainer.name}</p>
            <p><span className="font-semibold">Course Fee:</span> ${course.course.fees}</p>
            <p>
              <span className="font-semibold">Payment Status:</span>
              <span className={`ml-2 ${course.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                {course.paymentStatus}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
