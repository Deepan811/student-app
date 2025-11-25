
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface BatchData {
  batchId: string;
  batchName: string;
  course: {
    _id: string;
    name: string;
    description: string;
  };
  fees: number;
  trainer: {
    _id: string;
    name: string;
  };
  paymentStatus: string;
  amountPaid: number;
}

export function EnrolledBatches({ batches }) {

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">My Batches</h2>
      {batches.length === 0 ? (
        <p className="text-slate-300">You are not currently enrolled in any batches.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.map(batch => (
            <Card key={batch.batchId} className="bg-gray-900/60 border border-gray-700 text-gray-200 hover:border-blue-500 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">{batch.course.name}</CardTitle>
                <CardDescription className="text-gray-400">Batch: {batch.batchName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><span className="font-semibold text-blue-300">Trainer:</span> {batch.trainer.name}</p>
                <p><span className="font-semibold text-blue-300">Course Fee:</span> ${batch.fees}</p>
                <p><span className="font-semibold text-blue-300">Payment Status:</span> 
                  <span className={`ml-2 ${batch.paymentStatus === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                    {batch.paymentStatus === 'partially-paid'
                      ? `Partially Paid ($${batch.amountPaid} / ${batch.fees})`
                      : batch.paymentStatus.charAt(0).toUpperCase() + batch.paymentStatus.slice(1)}
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
