'use client'

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Zod schema for form validation
const batchFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  courseId: z.string({ required_error: "Please select a course." }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  studentIds: z.array(z.string()).min(1, "Please select at least one student."),
})

interface Course {
  _id: string
  name: string
}

interface Student {
  _id: string
  name: string
  email: string
}

interface Batch {
  _id: string
  name: string
  courseName: string
  startDate: string
  endDate: string
  students: Student[]
}

export default function AdminBatchesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof batchFormSchema>>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      studentIds: [],
    },
  })

  async function fetchData() {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const [coursesRes, studentsRes, batchesRes] = await Promise.all([
        fetch("/api/admin/courses", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users/approved-for-batch", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/batches", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const coursesData = await coursesRes.json()
      const studentsData = await studentsRes.json()
      const batchesData = await batchesRes.json()

      if (coursesData.success) setCourses(coursesData.data)
      if (studentsData.success) setAvailableStudents(studentsData.users)
      if (batchesData.success) setBatches(batchesData.data)

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
    try {
        const token = localStorage.getItem("auth_token")
        const response = await fetch("/api/admin/batches", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...values, students: values.studentIds }),
        })

        if (response.ok) {
            alert("Batch created successfully!")
            form.reset()
            fetchData() // Refresh data
        } else {
            const errorData = await response.json()
            alert(`Failed to create batch: ${errorData.data.message}`)
        }
    } catch (error) {
        console.error("Error creating batch:", error)
        alert("An unexpected error occurred.")
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Batch Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Batch</CardTitle>
              <CardDescription>Fill out the form to create a new batch.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fall 2024 Web Dev" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map(course => <SelectItem key={course._id} value={course._id}>{course.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentIds"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Students</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value?.length && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value?.length
                                        ? `${field.value.length} student(s) selected`
                                        : "Select students"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search students..." />
                                    <CommandEmpty>No students found.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
                                    {availableStudents.map((student) => (
                                        <CommandItem
                                        value={student.email}
                                        key={student._id}
                                        onSelect={() => {
                                            const currentIds = field.value || []
                                            const newIds = currentIds.includes(student._id)
                                                ? currentIds.filter(id => id !== student._id)
                                                : [...currentIds, student._id]
                                            field.onChange(newIds)
                                        }}
                                        >
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value?.includes(student._id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {student.name} ({student.email})
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                  <Button type="submit" className="w-full">Create Batch</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Batches</CardTitle>
              <CardDescription>A list of all created batches.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Start Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                  ) : batches.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No batches found.</TableCell></TableRow>
                  ) : (
                    batches.map(batch => (
                      <TableRow key={batch._id}>
                        <TableCell className="font-medium">{batch.name}</TableCell>
                        <TableCell>{batch.courseName}</TableCell>
                        <TableCell>{batch.students.length}</TableCell>
                        <TableCell>{new Date(batch.startDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
