'use client'

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"



interface Course {
  _id: string
  name: string
}

interface Student {
  _id: string
  name: string
  email: string
  paymentStatus: 'paid' | 'unpaid' | 'partially-paid'
  amountPaid?: number
  batchId?: string
  batchCount?: number // New field to store the number of batches the student is in
}

interface Trainer {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  }

interface Batch {
  _id: string
  name: string
  courseName: string
  startDate: string
  endDate: string
  fees: number
  students: Student[]
}

export default function AdminBatchesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
   const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<'paid' | 'unpaid' | 'partially-paid'>('unpaid');
  const [currentAmountPaid, setCurrentAmountPaid] = useState<number>(0);
  const [currentBatchFees, setCurrentBatchFees] = useState<number>(0);

  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isConfirmDeleteSelectedOpen, setIsConfirmDeleteSelectedOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const batchFormSchema = useMemo(() => z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    courseId: z.string({ required_error: "Please select a course." }),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    fees: z.coerce.number().min(0, "Fees must be a positive number."),
    studentIds: z.array(z.string()).min(1, "Please select at least one student.").refine((studentIds) => {
      // Custom validation to check if any selected student is already in 3 batches
      const selectedStudents = availableStudents.filter(s => studentIds.includes(s._id));
      const studentsOverLimit = selectedStudents.filter(s => (s.batchCount || 0) >= 3);
      if (studentsOverLimit.length > 0) {
        return false; // Validation fails
      }
      return true; // Validation passes
    }, { message: "Some selected students are already in 3 batches." }),
    trainerIds: z.array(z.string()).min(1, "Please select at least one trainer."),
  }), [availableStudents]); // Dependency array for useMemo

  const form = useForm<z.infer<typeof batchFormSchema>>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      studentIds: [],
      trainerIds: [],
      courseId: "",
      startDate: "",
      endDate: "",
      fees: 0,
    },
  })

  async function fetchData() {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const [coursesRes, studentsRes, batchesRes, trainersRes] = await Promise.all([
        fetch("/api/admin/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users/approved-for-batch", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/batches", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/trainers", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const coursesData = await coursesRes.json()
      const studentsData = await studentsRes.json()
      const batchesData = await batchesRes.json()
      const trainersData = await trainersRes.json()

      if (coursesData.success) setCourses(coursesData.data)
      if (studentsData.success) setAvailableStudents(studentsData.users)
      if (batchesData.success) setBatches(batchesData.data)
      if (trainersData.success) setAvailableTrainers(trainersData.data)

    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function onSubmit(values: z.infer<typeof batchFormSchema>) {
    setIsSubmitting(true)
    try {
        const token = localStorage.getItem("auth_token")
        const response = await fetch("/api/admin/batches", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...values, students: values.studentIds, trainerIds: values.trainerIds }),
        })

        if (response.ok) {
            alert("Batch created successfully!")
            form.reset()
            fetchData() // Refresh data
        } else {
            const errorData = await response.json()
            alert(`Failed to create batch: ${errorData.message}`)
        }
    } catch (error) {
        console.error("Error creating batch:", error)
        alert("An unexpected error occurred.")
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleOpenPaymentDialog = (student: Student, batchFees: number) => {
    setSelectedStudentForPayment(student);
    setCurrentPaymentStatus(student.paymentStatus);
    setCurrentAmountPaid(student.amountPaid || 0);
    setCurrentBatchFees(batchFees);
    setIsPaymentDialogOpen(true);
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedStudentForPayment) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/batches/${selectedStudentForPayment.batchId}/students/${selectedStudentForPayment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus: currentPaymentStatus, amountPaid: typeof currentAmountPaid === 'string' && currentAmountPaid === '' ? 0 : currentAmountPaid }),
      });

      if (response.ok) {
        alert("Payment status updated successfully!");
        fetchData(); // Refresh data to reflect the change
        setIsPaymentDialogOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to update payment status: ${errorData.data.message}`);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("An unexpected error occurred while updating payment status.");
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/batches/${batchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Batch deleted successfully!");
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to delete batch: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("An unexpected error occurred while deleting the batch.");
    } finally {
      setIsDeleting(false);
      setBatchToDelete(null);
    }
  };

  const handleDeleteManyBatches = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/batches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedBatches }),
      });

      if (response.ok) {
        alert("Selected batches deleted successfully!");
        fetchData(); // Refresh data
        setSelectedBatches([]);
        setIsConfirmDeleteSelectedOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete selected batches: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting selected batches:", error);
      alert("An unexpected error occurred while deleting selected batches.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllBatches = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/batches", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: [] }), // Send empty array to signal delete all
      });

      if (response.ok) {
        alert("All batches deleted successfully!");
        fetchData(); // Refresh data
        setSelectedBatches([]);
        setIsConfirmDeleteAllOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete all batches: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting all batches:", error);
      alert("An unexpected error occurred while deleting all batches.");
    } finally {
      setIsDeleting(false);
    }
  };

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500" 

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Batch Management</h1>
            <p className="text-slate-300">Create new batches and manage existing ones.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Create New Batch</CardTitle>
                <CardDescription className="text-slate-300">Fill out the form to create a new batch.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Batch Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Fall 2024 Web Dev" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="courseId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Course</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={inputStyles}><SelectValue placeholder="Select a course" /></SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 text-white border-slate-700">
                            {courses.map(course => <SelectItem key={course._id} value={course._id} className="focus:bg-slate-700">{course.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Start Date</FormLabel>
                          <FormControl><Input type="date" {...field} className={cn(inputStyles, "dark")} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">End Date</FormLabel>
                          <FormControl><Input type="date" {...field} className={cn(inputStyles, "dark")} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="fees" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Fees</FormLabel>
                        <FormControl><Input type="number" placeholder="Enter fee amount" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="studentIds" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-slate-200">Students</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-slate-300", inputStyles)}>
                                {field.value?.length ? `${field.value.length} student(s) selected` : "Select students"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-700 text-white">
                            <Command>
                              <CommandInput placeholder="Search students..." className="text-white" />
                              <CommandGroup className="max-h-64 overflow-auto">
                                {availableStudents.map((student) => {
                                  const isStudentFull = (student.batchCount || 0) >= 3;
                                  return (
                                    <CommandItem
                                      value={student.email}
                                      key={student._id}
                                      onSelect={() => {
                                        if (isStudentFull) return; // Prevent selection if full
                                        const currentIds = field.value || []
                                        const newIds = currentIds.includes(student._id) ? currentIds.filter(id => id !== student._id) : [...currentIds, student._id]
                                        field.onChange(newIds)
                                      }}
                                      className={cn(
                                        "hover:bg-slate-700 focus:bg-slate-700",
                                        isStudentFull && "text-slate-500 cursor-not-allowed opacity-70"
                                      )}
                                      disabled={isStudentFull} // Disable selection
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", field.value?.includes(student._id) ? "opacity-100" : "opacity-0")} />
                                      {student.name} ({student.email})
                                      {isStudentFull && <span className="ml-2 text-red-400">(Max Batches)</span>}
                                      {(student.batchCount || 0) > 0 && (
                                        <span className="ml-2 text-yellow-400">
                                          {'⭐'.repeat(student.batchCount || 0)}
                                        </span>
                                      )}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="trainerIds" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-slate-200">Trainers</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-slate-300", inputStyles)}>
                                {field.value?.length ? `${field.value.length} trainer(s) selected` : "Select trainers"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-700 text-white">
                            <Command>
                              <CommandInput placeholder="Search trainers..." className="text-white" />
                              <CommandEmpty>No trainers found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {availableTrainers.map((trainer) => (
                                  <CommandItem value={trainer.user.email} key={trainer._id} onSelect={() => {
                                    const currentIds = field.value || []
                                    const newIds = currentIds.includes(trainer._id) ? currentIds.filter(id => id !== trainer._id) : [...currentIds, trainer._id]
                                    field.onChange(newIds)
                                  }} className="hover:bg-slate-700 focus:bg-slate-700">
                                    <Check className={cn("mr-2 h-4 w-4", field.value?.includes(trainer._id) ? "opacity-100" : "opacity-0")} />
                                    {trainer.user.name} ({trainer.user.email})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Batch
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Existing Batches</CardTitle>
                    <CardDescription className="text-slate-300">A list of all created batches.</CardDescription>
                  </div>
                  <div className="flex gap-2">
            {selectedBatches.length > 0 && (
              <AlertDialog open={isConfirmDeleteSelectedOpen} onOpenChange={setIsConfirmDeleteSelectedOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete Selected ({selectedBatches.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 text-white border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                      Are you sure you want to delete {selectedBatches.length} selected batch(es)? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteManyBatches} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog open={isConfirmDeleteAllOpen} onOpenChange={setIsConfirmDeleteAllOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete All Batches
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 text-white border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    Are you sure you want to delete ALL batches? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllBatches} className="bg-red-500 hover:bg-red-600 text-white">Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-slate-300"/></div>
                ) : batches.length === 0 ? (
                  <p className="text-center text-slate-300 py-10">No batches found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {batches.map(batch => (
                      <Card key={batch._id} className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl text-white">{batch.name}</CardTitle>
                              <CardDescription className="text-slate-400">{batch.courseName}</CardDescription>
                            </div>
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                              checked={selectedBatches.includes(batch._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBatches([...selectedBatches, batch._id]);
                                } else {
                                  setSelectedBatches(selectedBatches.filter(id => id !== batch._id));
                                }
                              }}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="text-slate-300 space-y-3">
                          <div className="flex justify-between">
                            <span className="font-semibold">Start Date:</span>
                            <span>{new Date(batch.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">End Date:</span>
                            <span>{new Date(batch.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Fees:</span>
                            <span>${batch.fees}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 pt-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full bg-white/10 border-none text-white hover:bg-white/20 transition-all duration-300">View Students ({batch.students.length})</Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Students in {batch.name}</DialogTitle>
                                  <DialogDescription>A list of students in this batch.</DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="border-slate-700 hover:bg-slate-800">
                                        <TableHead className="text-white">Name</TableHead>
                                        <TableHead className="text-white">Email</TableHead>
                                        <TableHead className="text-white">Payment Status</TableHead>
                                        <TableHead className="text-white">Action</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {batch.students.map((student, index) => (
                                        <TableRow key={index} className="border-slate-800">
                                          <TableCell>{student.student.name}</TableCell>
                                          <TableCell>{student.student.email}</TableCell>
                                          <TableCell className={cn(
                                            student.paymentStatus === 'paid' && 'text-green-400',
                                            student.paymentStatus === 'unpaid' && 'text-red-400',
                                            student.paymentStatus === 'partially-paid' && 'text-yellow-400'
                                          )}>
                                            {student.paymentStatus === 'partially-paid'
                                              ? `Partially Paid ($${student.amountPaid || 0} / $${batch.fees})`
                                              : student.paymentStatus}
                                          </TableCell>
                                          <TableCell>
                                            <Button size="sm" onClick={() => handleOpenPaymentDialog({ ...student.student, paymentStatus: student.paymentStatus, amountPaid: student.amountPaid, batchId: batch._id }, batch.fees)} className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/40">Manage Payment</Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog open={batchToDelete === batch._id} onOpenChange={(open) => !open && setBatchToDelete(null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/40" onClick={() => setBatchToDelete(batch._id)}>
                                  {isDeleting && batchToDelete === batch._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-900 text-white border-slate-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-300">
                                    Are you sure you want to delete batch <span className="font-bold">{batch.name}</span>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteBatch(batch._id)} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      {/* Payment Management Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Update Payment Status for {selectedStudentForPayment?.name}</DialogTitle>
            <DialogDescription>Current Batch Fees: ${currentBatchFees}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentStatus" className="text-right">Status</Label>
              <Select value={currentPaymentStatus} onValueChange={(value: 'paid' | 'unpaid' | 'partially-paid') => setCurrentPaymentStatus(value)}>
                <SelectTrigger className={cn("col-span-3", inputStyles)}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700">
                  <SelectItem value="paid" className="focus:bg-slate-700">Paid</SelectItem>
                  {currentBatchFees > 0 && (
                    <>
                      <SelectItem value="unpaid" className="focus:bg-slate-700">Unpaid</SelectItem>
                      <SelectItem value="partially-paid" className="focus:bg-slate-700">Partially Paid</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            {currentPaymentStatus === 'partially-paid' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amountPaid" className="text-right">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={currentAmountPaid === 0 ? "" : currentAmountPaid}
                  onChange={(e) => {
                    const value = e.target.value;
                    let parsedValue = parseFloat(value);
                    if (isNaN(parsedValue)) parsedValue = 0;

                    if (parsedValue > currentBatchFees) {
                      setCurrentAmountPaid(currentBatchFees);
                    } else {
                      setCurrentAmountPaid(value === "" ? 0 : parsedValue);
                    }
                  }}
                  max={currentBatchFees} // Set max attribute
                  className={cn("col-span-3", inputStyles)}
                />
              </div>
            )}
            {currentPaymentStatus === 'partially-paid' && currentBatchFees > 0 && (
              <p className="text-sm text-yellow-400 text-center">Partial amount must be less than or equal to the total fee ($${currentBatchFees}).</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdatePaymentStatus} className="bg-blue-500 hover:bg-blue-600 text-white">Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
     
  )
}