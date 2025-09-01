
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

const formSchema = z.object({
  batchName: z.string().min(1, { message: "Batch Name is required." }),
  courseId: z.string().min(1, { message: "Course is required." }),
  startDate: z.string().min(1, { message: "Start Date is required." }),
  endDate: z.string().min(1, { message: "End Date is required." }),
  fees: z.coerce.number().min(0, { message: "Fees must be a positive number." }),
});

export function AddBatchForm({ onClose, onBatchCreated }: { onClose?: () => void, onBatchCreated?: () => void }) {
  interface Course {
    _id: string;
    name: string;
  }

  interface Student {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    batchName?: string;
  }
  
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [studentSelectionError, setStudentSelectionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast()
  const { token } = useAuth()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchName: "",
      courseId: "",
      startDate: "",
      endDate: "",
      fees: 0,
    },
  });

  const filteredStudents = students.filter((student) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      (student.mobile && student.mobile.includes(lowerCaseSearchTerm))
    );
  });

  useEffect(() => {
    const fetchCoursesAndStudents = async () => {
      try {
        const coursesResponse = await api.get("/courses");
        if (coursesResponse.success) {
          setCourses(coursesResponse.data as Course[]);
        } else {
          toast({
            title: "Error fetching courses",
            description: coursesResponse.message,
            variant: "destructive",
          });
        }

        const studentsResponse = await api.get("/admin/users/approved-for-batch", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (studentsResponse.success) {
                    setStudents(studentsResponse.students || []);
        } else {
          toast({
            title: "Error fetching students",
            description: studentsResponse.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };
    fetchCoursesAndStudents();
  }, [token]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedStudents.length < 1) {
      setStudentSelectionError("Please select at least 1 student to create a batch.");
      toast({
        title: "Validation Error",
        description: "Please select at least 1 student to create a batch.",
        variant: "destructive",
      });
      return;
    }
    setStudentSelectionError(null); // Clear error if validation passes
    try {
      const response = await api.post("/admin/batches", {
        name: values.batchName,
        courseId: values.courseId,
        startDate: values.startDate,
        endDate: values.endDate,
        fees: values.fees,
        students: selectedStudents,
      })
      if (onBatchCreated) {
        onBatchCreated();
      }
      // Clear the form
      form.reset();
      setSelectedStudents([]);
      setShowSuccessDialog(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error creating batch",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative">
          <FormField
            control={form.control}
            name="batchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Batch Name" {...field} />
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
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name}
                      </SelectItem>
                    ))}
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
            name="fees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fees</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter fee amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-2">
            <FormLabel>Students</FormLabel>
            <Input
              placeholder="Search students by name, email, or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-40 overflow-y-auto rounded-md border p-2">
              {filteredStudents.length === 0 && searchTerm !== "" ? (
    <p className="text-center text-gray-500 py-4">No students match your search.</p>
  ) : (
    filteredStudents.map((student) => (
                <div key={student._id} className="flex items-center gap-2 py-1">
                  <Checkbox
                    id={student._id}
                    checked={selectedStudents.includes(student._id)}
                    onCheckedChange={() => {
                      setSelectedStudents((prev) =>
                        prev.includes(student._id)
                          ? prev.filter((id) => id !== student._id)
                          : [...prev, student._id]
                      );
                    }}
                  />
                  <FormLabel htmlFor={student._id} className="font-normal">
                    {student.name} ({student.email}) {student.batchName && "(Batch: " + student.batchName + ")"}
                  </FormLabel>
                </div>
              ))
  )}</div>
              {studentSelectionError && (<p className="text-destructive text-sm mt-1">{studentSelectionError}</p>
              )}
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create Batch</Button>
            <Button type="button" variant="outline" onClick={() => onClose ? onClose() : router.push("/admin/dashboard")}>Cancel</Button>
          </div>
        </form>
      </Form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Created Successfully!</DialogTitle>
            <DialogDescription>
              The new batch has been added to the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
