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
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Course Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>Fill out the form to add a new course.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Advanced Web Development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A brief description of the course..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12 Weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fees ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Create Course</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Courses</CardTitle>
              <CardDescription>A list of all available courses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Fees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                  ) : courses.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center">No courses found.</TableCell></TableRow>
                  ) : (
                    courses.map(course => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.duration}</TableCell>
                        <TableCell>${course.fees}</TableCell>
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
