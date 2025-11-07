'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Zod schema for form validation
const courseFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  duration: z.string().min(1, "Duration is required."),
  fees: z.coerce.number().min(0, "Fees cannot be negative."),
  image: z.string().url({ message: "Please enter a valid URL." }).optional(),
})

interface Course {
  _id: string
  name: string
  description: string
  duration: string
  fees: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      fees: 0,
      image: "",
    },
  })

  async function fetchCourses() {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/courses", { 
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setCourses(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  async function onSubmit(values: z.infer<typeof courseFormSchema>) {
    setIsSubmitting(true)
    try {
        const token = localStorage.getItem("auth_token")
        const response = await fetch("/api/admin/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(values),
        })

        if (response.ok) {
            alert("Course created successfully!")
            form.reset()
            fetchCourses() // Refresh data
        } else {
            const errorData = await response.json()
            alert(`Failed to create course: ${errorData.message}`)
        }
    } catch (error) {
        console.error("Error creating course:", error)
        alert("An unexpected error occurred.")
    } finally {
        setIsSubmitting(false)
    }
  }

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Course Management</h1>
          <p className="text-slate-300">Add new courses and view existing ones.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Create New Course</CardTitle>
              <CardDescription className="text-slate-300">Fill out the form to add a new course.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Course Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Advanced Web Development" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Description</FormLabel>
                      <FormControl><Textarea placeholder="A brief description..." {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Duration</FormLabel>
                      <FormControl><Input placeholder="e.g., 12 Weeks" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fees" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Fees ($)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Image URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/image.png" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Course
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Existing Courses</CardTitle>
              <CardDescription className="text-slate-300">A list of all available courses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-200">Course Name</TableHead>
                      <TableHead className="text-slate-200">Duration</TableHead>
                      <TableHead className="text-slate-200">Fees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-slate-300 py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></TableCell></TableRow>
                    ) : courses.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-slate-300 py-10">No courses found.</TableCell></TableRow>
                    ) : (
                      courses.map(course => (
                        <TableRow key={course._id} className="border-slate-800">
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>${course.fees}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}