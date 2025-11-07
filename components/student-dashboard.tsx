
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface CourseData {
  batchId: string;
  batchName: string;
  course: {
    _id: string;
    name: string;
    description: string;
  };
  fees: number; // Fees is now directly on the course object
  trainer: {
    _id: string;
    name: string;
  };
  paymentStatus: string;
  amountPaid: number; // Include amount paid here
}

export function StudentDashboard({ courses }) {

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">My Courses</h2>
      {courses.length === 0 ? (
        <p className="text-slate-300">You are not currently enrolled in any courses.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <Card key={course.batchId} className="bg-gray-900/60 border border-gray-700 text-gray-200 hover:border-blue-500 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">{course.course.name}</CardTitle>
                <CardDescription className="text-gray-400">Batch: {course.batchName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><span className="font-semibold text-blue-300">Trainer:</span> {course.trainer.name}</p>
                <p><span className="font-semibold text-blue-300">Course Fee:</span> ${course.fees}</p>
                <p><span className="font-semibold text-blue-300">Payment Status:</span> 
                  <span className={`ml-2 ${course.paymentStatus === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                    {course.paymentStatus === 'partially-paid'
                      ? `Partially Paid ($${course.amountPaid} / $${course.fees})`
                      : course.paymentStatus.charAt(0).toUpperCase() + course.paymentStatus.slice(1)}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
