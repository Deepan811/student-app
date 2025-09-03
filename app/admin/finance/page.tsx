'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

const dummyTransactions = [
  { id: 1, student: "Alice Johnson", amount: 500, type: "Fee Payment", date: "2024-09-01" },
  { id: 2, student: "Bob Williams", amount: -75, type: "Refund", date: "2024-08-30" },
  { id: 3, student: "Charlie Brown", amount: 500, type: "Fee Payment", date: "2024-08-29" },
  { id: 4, student: "Diana Miller", amount: -50, type: "Scholarship Dispersal", date: "2024-08-28" },
  { id: 5, student: "Ethan Davis", amount: 500, type: "Fee Payment", date: "2024-08-27" },
]

export default function AdminFinancePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Finance</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-green-500">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <span className="text-red-500">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,350.00</div>
            <p className="text-xs text-muted-foreground">15 students pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of the most recent financial transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.student}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className={`text-right font-mono ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}