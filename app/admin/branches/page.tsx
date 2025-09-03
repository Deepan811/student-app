'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"

const dummyBranches = [
  { id: 1, name: "Main Campus", location: "New York, NY", manager: "Dr. Alice Grey" },
  { id: 2, name: "West Coast Hub", location: "San Francisco, CA", manager: "Mr. Bob Vance" },
  { id: 3, name: "Midwest Center", location: "Chicago, IL", manager: "Ms. Carol Danvers" },
]

export default function AdminBranchesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branch Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Branch
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Institute Branches</CardTitle>
          <CardDescription>A list of all institute branches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>{branch.manager}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}