'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const issuedCertificates = [
  { id: 1, student: "John Doe", course: "Web Development Bootcamp", date: "2024-08-15", certId: "CERT-2024-A1B2" },
  { id: 2, student: "Jane Smith", course: "Data Science with Python", date: "2024-08-14", certId: "CERT-2024-C3D4" },
  { id: 3, student: "Peter Jones", course: "UI/UX Design Principles", date: "2024-08-12", certId: "CERT-2024-E5F6" },
]

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Certificate Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Certificate</CardTitle>
              <CardDescription>Select a student and course to issue a new certificate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-search">Student Name</Label>
                <Input id="student-search" placeholder="Search for a student..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-search">Course Name</Label>
                <Input id="course-search" placeholder="Search for a course..." />
              </div>
              <Button className="w-full">Generate & Issue Certificate</Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recently Issued Certificates</CardTitle>
              <CardDescription>A list of the most recently issued certificates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Certificate ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.student}</TableCell>
                      <TableCell>{cert.course}</TableCell>
                      <TableCell>{cert.date}</TableCell>
                      <TableCell>{cert.certId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}