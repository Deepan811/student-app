'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"

const dummyCompanies = [
  { id: 1, name: "Innovate Inc.", industry: "Technology", status: "Active" },
  { id: 2, name: "HealthFirst Corp.", industry: "Healthcare", status: "Active" },
  { id: 3, name: "EduGreat", industry: "Education", status: "Inactive" },
  { id: 4, name: "BuildRight Co.", industry: "Construction", status: "Active" },
]

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Partner Companies</CardTitle>
          <CardDescription>A list of all partner companies.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>{company.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}