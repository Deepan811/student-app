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
import { Loader2, FilePenLine, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Zod schema for form validation
const courseFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  duration: z.string().min(1, "Duration is required."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  discountPrice: z.coerce.number().min(0, "Discount price cannot be negative.").optional(),
  instructor: z.string().min(3, "Instructor name must be at least 3 characters."),
  level: z.string().min(3, "Level must be at least 3 characters."),
  category: z.string().min(3, "Category must be at least 3 characters."),
  image: z.string().url({ message: "Please enter a valid URL." }).optional(),
})

interface Course {
  _id: string
  name: string
  description: string
  duration: string
  price: number
  discountPrice?: number
  instructor: string
  level: string
  category: string
}

interface EnrolledCourse {
  course: Course;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Failed';
  paymentMethod?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  enrolledCourses: EnrolledCourse[];
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isEditing, setIsEditing] = useState(false)



  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: 0,
      discountPrice: 0,
      instructor: "",
      level: "Beginner",
      category: "",
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

  async function fetchStudents() {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/student-enrollments", { 
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setStudents(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchStudents()
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

  async function onEditSubmit(values: z.infer<typeof courseFormSchema>) {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/courses/${selectedCourse._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert("Course updated successfully!");
        setSelectedCourse(null); // Close the dialog
        form.reset();
        fetchCourses(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to update course: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCourse() {
    if (!courseToDelete) return;
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/courses/${courseToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert('Course deleted successfully');
        fetchCourses(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Failed to delete course: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('An unexpected error occurred while deleting the course.');
    } finally {
      setCourseToDelete(null);
    }
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"

  return (
    <div className="space-y-8 text-white p-4 md:p-8">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Course Management</h1>
          <p className="text-slate-300">Add, view, and manage all courses.</p>
        </div>
      </div>
      
      <Tabs defaultValue="all-courses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-courses">All Courses</TabsTrigger>
          <TabsTrigger value="add-new">Add New Course</TabsTrigger>
          <TabsTrigger value="student-enrollments">Student Enrollments</TabsTrigger>
        </TabsList>
        <TabsContent value="all-courses">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Existing Courses</CardTitle>
                  <CardDescription className="text-slate-300">A list of all available courses.</CardDescription>
                </div>
                <Input 
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("w-full md:w-1/3", inputStyles)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="text-white">
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-200">Course Name</TableHead>
                      <TableHead className="text-slate-200">Duration</TableHead>
                      <TableHead className="text-slate-200">Price</TableHead>
                      <TableHead className="text-slate-200">Instructor</TableHead>
                      <TableHead className="text-slate-200">Level</TableHead>
                      <TableHead className="text-slate-200">Category</TableHead>
                      <TableHead className="text-slate-200 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-slate-300 py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></TableCell></TableRow>
                    ) : filteredCourses.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-slate-300 py-10">No courses found.</TableCell></TableRow>
                    ) : (
                      filteredCourses.map(course => (
                        <TableRow key={course._id} className="border-slate-800">
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>${course.price}</TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>{course.level}</TableCell>
                          <TableCell>{course.category}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="hover:bg-slate-700" onClick={() => {
                              setSelectedCourse(course);
                              setIsEditing(true);
                              form.reset({
                                name: course.name,
                                description: course.description,
                                duration: course.duration,
                                price: course.price,
                                discountPrice: course.discountPrice || 0,
                                instructor: course.instructor,
                                level: course.level,
                                category: course.category,
                                image: course.image || "",
                              });
                            }}>
                              <FilePenLine className="h-4 w-4 text-blue-400" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-slate-700" onClick={() => setCourseToDelete(course._id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the course.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteCourse}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add-new">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Create New Course</CardTitle>
              <CardDescription className="text-slate-300">Fill out the form to add a new course.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Course Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Advanced Web Development" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="instructor" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Instructor</FormLabel>
                        <FormControl><Input placeholder="e.g., John Doe" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Description</FormLabel>
                      <FormControl><Textarea placeholder="A brief description of the course..." {...field} className={inputStyles} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Duration</FormLabel>
                        <FormControl><Input placeholder="e.g., 12 Weeks" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="level" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Level</FormLabel>
                        <FormControl><Input placeholder="e.g., Beginner" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Category</FormLabel>
                        <FormControl><Input placeholder="e.g., Web Development" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Price ($)</FormLabel>
                        <FormControl><Input type="number" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="discountPrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Discount Price ($)</FormLabel>
                        <FormControl><Input type="number" {...field} className={inputStyles} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Image URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/image.png" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300 py-3">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Course
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Course Dialog */}
        <Dialog open={isEditing} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsEditing(false);
            setSelectedCourse(null);
            form.reset(); // Reset form when dialog is closed
          }
        }}>
          <DialogContent className="bg-slate-900/80 backdrop-blur-lg border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedCourse ? `Edit Course: ${selectedCourse.name}` : "Edit Course"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Course Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Advanced Web Development" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="instructor" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Instructor</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Description</FormLabel>
                    <FormControl><Textarea placeholder="A brief description of the course..." {...field} className={inputStyles} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Duration</FormLabel>
                      <FormControl><Input placeholder="e.g., 12 Weeks" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="level" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Level</FormLabel>
                      <FormControl><Input placeholder="e.g., Beginner" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Category</FormLabel>
                      <FormControl><Input placeholder="e.g., Web Development" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Price ($)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="discountPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Discount Price ($)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputStyles} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/image.png" {...field} className={inputStyles} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold transition-all duration-300 py-3">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Course
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog>
        <TabsContent value="student-enrollments">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Student Enrollments</CardTitle>
              <CardDescription className="text-slate-300">View courses applied by students and their payment status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {students.map(student => (
                  <Card key={student._id} className="bg-slate-800/50 border-slate-700 flex flex-col min-h-[300px]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{student.name}</CardTitle>
                          <p className="text-sm text-slate-400">{student.email}</p>
                          <p className="text-sm text-slate-400">{student.mobile || 'No mobile'}</p>
                        </div>
                        <Badge 
                          className={cn({
                            "bg-green-500 text-white": student.paymentStatus === 'Paid',
                            "bg-yellow-500 text-black": student.paymentStatus === 'Pending',
                            "bg-red-500 text-white": student.paymentStatus === 'Failed',
                          })}
                        >
                          {student.paymentStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <h3 className="text-lg font-semibold text-slate-200 mb-4 border-t border-slate-700 pt-4">Enrolled Courses</h3>
                      {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                        <ul className="space-y-4">
                          {student.enrolledCourses.map(enrolled => (
                            <li key={enrolled.course._id} className="p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <p className="font-semibold text-white">{enrolled.course.name}</p>
                                <Badge 
                                  className={cn({
                                    "bg-green-500 text-white": enrolled.paymentStatus === 'Paid',
                                    "bg-blue-500 text-white": enrolled.paymentStatus === 'Partial',
                                    "bg-yellow-500 text-black": enrolled.paymentStatus === 'Pending',
                                    "bg-red-500 text-white": enrolled.paymentStatus === 'Failed',
                                  })}
                                >
                                  {enrolled.paymentStatus}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-300 mt-2 space-y-1">
                                <p>Total: <span className="font-medium text-white">${enrolled.totalAmount}</span></p>
                                <p>Paid: <span className="font-medium text-green-400">${enrolled.amountPaid}</span></p>
                                <p>Due: <span className="font-medium text-yellow-400">${enrolled.remainingAmount}</span></p>
                              </div>
                              <DialogTrigger asChild>
                                  <Button variant="link" className="p-0 h-auto text-blue-400 hover:text-blue-500 mt-2" onClick={() => setSelectedCourse(enrolled.course)}>
                                    View Course Details
                                  </Button>
                                </DialogTrigger>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400">No courses enrolled.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Dialog>
      </Tabs>

      {/* Moved Dialog component outside the map loop */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={(isOpen) => !isOpen && setSelectedCourse(null)}>
          <DialogContent className="bg-slate-900/80 backdrop-blur-lg border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{selectedCourse.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-200">Description</h4>
                <p className="text-slate-300">{selectedCourse.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-200">Instructor</h4>
                  <p className="text-slate-300">{selectedCourse.instructor}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Duration</h4>
                  <p className="text-slate-300">{selectedCourse.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Level</h4>
                  <p className="text-slate-300">{selectedCourse.level}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Category</h4>
                  <p className="text-slate-300">{selectedCourse.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Price</h4>
                  <p className="text-slate-300">${selectedCourse.price}</p>
                </div>
                {selectedCourse.discountPrice && (
                  <div>
                    <h4 className="font-semibold text-slate-200">Discount Price</h4>
                    <p className="text-slate-300">${selectedCourse.discountPrice}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}