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
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [itemType, setItemType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedItemFee, setSelectedItemFee] = useState(0);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [type, setType] = useState('Fee Payment');
  const [status, setStatus] = useState('Completed');
  const [amountPaid, setAmountPaid] = useState(0);
  const [outstandingAmount, setOutstandingAmount] = useState(0);
  const [isFullyPaid, setIsFullyPaid] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch('/api/admin/users?role=student', {
          headers: { Authorization: `Bearer ${token}` }
        });
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
    if (selectedStudent) {
      const student = students.find(s => s._id === selectedStudent);
      if (student) {
        setBatches(student.batches || []);
        
        // Deduplicate enrolledCourses
        const uniqueEnrolledCourses = [];
        const courseIds = new Set();
        for (const enrolled of (student.enrolledCourses || [])) {
          if (enrolled.course && !courseIds.has(enrolled.course._id)) {
            uniqueEnrolledCourses.push(enrolled);
            courseIds.add(enrolled.course._id);
          }
        }
        setEnrolledCourses(uniqueEnrolledCourses);
      }
    } else {
      setBatches([]);
      setEnrolledCourses([]);
    }
  }, [selectedStudent, students]);

  useEffect(() => {
    setIsFullyPaid(false); // Reset on item change
    if (selectedItem && itemType === 'Batch') {
      const batch = batches.find(b => b._id === selectedItem);
      if (batch) {
        setSelectedItemFee(batch.fees);
        const studentInBatch = batch.students.find(s => s.student._id === selectedStudent);
        if (studentInBatch) {
          const outstanding = batch.fees - studentInBatch.amountPaid;
          setAmountPaid(studentInBatch.amountPaid);
          setOutstandingAmount(outstanding);
          if (outstanding <= 0) {
            setIsFullyPaid(true);
          }
        }
      }
    } else if (selectedItem && itemType === 'Course') {
      const enrolledCourse = enrolledCourses.find(c => c.course && c.course._id === selectedItem);
      if (enrolledCourse) {
        setSelectedItemFee(enrolledCourse.totalAmount);
        setAmountPaid(enrolledCourse.amountPaid);
        setOutstandingAmount(enrolledCourse.remainingAmount);
        if (enrolledCourse.remainingAmount <= 0) {
          setIsFullyPaid(true);
        }
      }
    }
  }, [selectedItem, itemType, batches, enrolledCourses, selectedStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFullyPaid) {
      toast.error("This item is already fully paid.");
      return;
    }

    const payload = {
      studentId: selectedStudent,
      amount: parseFloat(amount),
      paymentMethod,
      type,
      status,
    };

    if (itemType === 'Batch') {
      payload.batchId = selectedItem;
    } else if (itemType === 'Course') {
      payload.courseId = selectedItem;
    }

    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

          <Select onValueChange={setItemType} value={itemType}>
            <SelectTrigger><SelectValue placeholder="Select Item Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Batch">Batch</SelectItem>
              <SelectItem value="Course">Course</SelectItem>
            </SelectContent>
          </Select>

          {itemType === 'Batch' && (
            <Select onValueChange={setSelectedItem} value={selectedItem} disabled={!selectedStudent}>
              <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
              <SelectContent>
                {batches.length > 0 ? batches.map(batch => (
                  <SelectItem key={batch._id} value={batch._id}>{batch.name}</SelectItem>
                )) : <SelectItem value="" disabled>No batches for this student</SelectItem>}
              </SelectContent>
            </Select>
          )}

          {itemType === 'Course' && (
            <Select onValueChange={setSelectedItem} value={selectedItem} disabled={!selectedStudent}>
              <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                {enrolledCourses.length > 0 ? enrolledCourses.map(enrolled => (
                  enrolled.course && <SelectItem key={enrolled.course._id} value={enrolled.course._id}>{enrolled.course.name}</SelectItem>
                )) : <SelectItem value="" disabled>No courses enrolled for this student</SelectItem>}
              </SelectContent>
            </Select>
          )}

          {selectedItem && (
            <div className="text-sm text-slate-400">
              <p>Fee: ${selectedItemFee.toFixed(2)}</p>
              <p>Amount Paid: ${amountPaid.toFixed(2)}</p>
              <p>Outstanding: ${outstandingAmount.toFixed(2)}</p>
              {isFullyPaid && <p className="text-green-400 font-bold">This item is fully paid.</p>}
            </div>
          )}

          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required disabled={isFullyPaid} />

          <Select onValueChange={setPaymentMethod} value={paymentMethod} disabled={isFullyPaid}>
            <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setType} value={type} disabled={isFullyPaid}>
            <SelectTrigger><SelectValue placeholder="Transaction Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Fee Payment">Fee Payment</SelectItem>
              <SelectItem value="Refund">Refund</SelectItem>
              <SelectItem value="Scholarship">Scholarship</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setStatus} value={status} disabled={isFullyPaid}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isFullyPaid}>Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}