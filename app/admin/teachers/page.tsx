'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"

const dummyTeachers = [
  { id: 1, name: "Dr. Evelyn Reed", subject: "Quantum Physics", email: "e.reed@university.edu" },
  { id: 2, name: "Mr. Samuel Grant", subject: "Web Development", email: "s.grant@university.edu" },
  { id: 3, name: "Ms. Clara Oswald", subject: "Data Science", email: "c.oswald@university.edu" },
  { id: 4, name: "Prof. Alistair Finch", subject: "Digital Marketing", email: "a.finch@university.edu" },
]

export default function AdminTeachersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Teacher
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Faculty</CardTitle>
          <CardDescription>A list of all teachers and instructors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Primary Subject</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.subject}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}