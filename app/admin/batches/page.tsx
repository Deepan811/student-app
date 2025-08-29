
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddBatchForm } from "@/components/add-batch-form"
import { api } from "@/lib/api"

import {
  Dialog,
  DialogContent,
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
  }
  
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [students, setStudents] = useState<Array<{ _id: string; name: string; email: string }>>([])
  const { user, isLoading, token } = useAuth()
  const router = useRouter()

  const fetchBatches = async () => {
        const response = await api.get("/admin/batches")
        if (response.success && Array.isArray(response.data)) {
          setBatches(response.data)
        } else {
          setBatches([]); // Ensure it's an empty array on error
          // Optionally, add a toast or error message here
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
      setStudents([]); // Ensure it's an empty array on error
      // Optionally, add a toast or error message here
    }
  }

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
                      </DialogHeader>
                      <ul>
                        {students.map(student => (
                          <li key={student._id}>
                            {student.name} ({student.email})
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
