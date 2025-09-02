'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddBatchForm } from "@/components/add-batch-form"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

const BatchesPage = () => {
  interface Batch {
    _id: string;
    name: string;
    courseName: string;
    startDate: string;
    endDate: string;
    fees: number;
  }
  
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [students, setStudents] = useState<Array<{ _id: string; name: string; email: string; paymentStatus: string }>>([])
  const { user, isLoading, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const fetchBatches = async () => {
        const response = await api.get("/admin/batches")
        if (response.success && Array.isArray(response.data)) {
          setBatches(response.data)
        } else {
          setBatches([]); // Ensure it's an empty array on error
          toast({ title: "Error", description: "Failed to fetch batches.", variant: "destructive" });
        }
      }

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchBatches()
    }
  }, [user])

  const handleViewStudents = async (batch: Batch) => {
    setSelectedBatch(batch)
    const response = await api.get(`/admin/batches/${batch._id}/students`)
    if (response.success && Array.isArray(response.data)) {
      setStudents(response.data)
    } else {
      setStudents([]);
      toast({ title: "Error", description: "Failed to fetch students for this batch.", variant: "destructive" });
    }
  }

  const handleUpdatePaymentStatus = async (studentId: string, currentStatus: string) => {
    if (!selectedBatch) return;

    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      const response = await api.put(
        `/admin/batches/${selectedBatch._id}/students/${studentId}`,
        { paymentStatus: newStatus }
      );

      if (response.success) {
        setStudents(prevStudents =>
            prevStudents.map(s =>
                s._id === studentId ? { ...s, paymentStatus: newStatus } : s
            )
        );
        toast({
            title: "Success",
            description: "Payment status updated.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-4 md:p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0">
          <h1 className="text-3xl font-bold text-white">Batch Management</h1>
          <div className="flex gap-2 flex-wrap justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">Create New Batch</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Batch</DialogTitle>
                  <DialogDescription>
                    Fill out the form to add a new batch.
                  </DialogDescription>
                </DialogHeader>
                <AddBatchForm onBatchCreated={fetchBatches} />
              </DialogContent>
            </Dialog>
            <Button asChild variant="outline" className="w-full md:w-auto bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
              <Link href="/admin/dashboard">Back to Admin</Link>
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Existing Batches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card key={batch._id} className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg text-white">
                <CardHeader>
                  <CardTitle>{batch.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Course:</strong> {batch.courseName}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(batch.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(batch.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Fees:</strong> {batch.fees}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => handleViewStudents(batch)}
                        className="mt-4 bg-white/40 hover:bg-white/60 text-white"
                      >
                        View Students
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Students in {selectedBatch?.name}
                        </DialogTitle>
                        <DialogDescription>
                          A list of students in this batch and their payment status.
                        </DialogDescription>
                      </DialogHeader>
                      <ul className="space-y-2">
                        {students.map(student => (
                          <li key={student._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 hover:bg-white/10 rounded-md gap-2">
                            <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-sm text-gray-200">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${student.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {student.paymentStatus}
                                </span>
                                <Button
                                    size="sm"
                                    variant={student.paymentStatus === 'paid' ? 'destructive' : 'default'}
                                    onClick={() => handleUpdatePaymentStatus(student._id, student.paymentStatus)}
                                    className="bg-white/20 hover:bg-white/40"
                                >
                                    {student.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default BatchesPage