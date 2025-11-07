
'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function AddTransactionForm({ isOpen, onClose, onTransactionAdded }) {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedBatchFee, setSelectedBatchFee] = useState(0);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [type, setType] = useState('Fee Payment');
  const [status, setStatus] = useState('Completed');
  const [amountPaid, setAmountPaid] = useState(0);
  const [outstandingAmount, setOutstandingAmount] = useState(0);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/admin/users?role=student');
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data.data);
      } catch (error) {
        toast.error(error.message);
      }
    }
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  useEffect(() => {
    async function fetchBatches() {
      if (!selectedStudent) {
        setBatches([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/batches?studentId=${selectedStudent}`);
        if (!res.ok) throw new Error('Failed to fetch batches');
        const data = await res.json();
        setBatches(data.data);
      } catch (error) {
        toast.error(error.message);
      }
    }
    fetchBatches();
  }, [selectedStudent]);

  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b._id === selectedBatch);
      if (batch) {
        setSelectedBatchFee(batch.fees);
        const studentInBatch = batch.students.find(s => s.student._id === selectedStudent);
        if (studentInBatch) {
          setAmountPaid(studentInBatch.amountPaid);
          setOutstandingAmount(batch.fees - studentInBatch.amountPaid);
        }
      }
    }
  }, [selectedBatch, batches, selectedStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          batchId: selectedBatch,
          amount: parseFloat(amount),
          paymentMethod,
          type,
          status,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }

      toast.success('Transaction added successfully');
      onTransactionAdded();
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={setSelectedStudent} value={selectedStudent}>
            <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student._id} value={student._id}>{student.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedBatch} value={selectedBatch} disabled={!selectedStudent}>
            <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
            <SelectContent>
              {batches.map(batch => (
                <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBatch && (
            <div className="text-sm text-slate-400">
              <p>Batch Fee: ${selectedBatchFee.toFixed(2)}</p>
              <p>Amount Paid: ${amountPaid.toFixed(2)}</p>
              <p>Outstanding: ${outstandingAmount.toFixed(2)}</p>
            </div>
          )}

          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />

          <Select onValueChange={setPaymentMethod} value={paymentMethod}>
            <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setType} value={type}>
            <SelectTrigger><SelectValue placeholder="Transaction Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Fee Payment">Fee Payment</SelectItem>
              <SelectItem value="Refund">Refund</SelectItem>
              <SelectItem value="Scholarship">Scholarship</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
