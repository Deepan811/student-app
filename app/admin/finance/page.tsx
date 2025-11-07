'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, PlusCircle, Users } from "lucide-react"
import { AddTransactionForm } from "@/components/add-transaction-form"
import { toast } from "sonner"

export default function AdminFinancePage() {
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        fetch('/api/admin/finance/summary'),
        fetch(`/api/admin/finance?page=${page}&limit=10`)
      ]);

      if (!summaryRes.ok || !transactionsRes.ok) {
        throw new Error('Failed to fetch finance data');
      }

      const summaryData = await summaryRes.json();
      const transactionsData = await transactionsRes.json();

      setSummary(summaryData.data);
      setTransactions(transactionsData.data);
      setTotalPages(transactionsData.totalPages);
    } catch (error) {
      toast.error(error.message);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTransactionAdded = () => {
    fetchData(); // Refetch data after a new transaction is added
  };

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Finance Overview</h1>
          <p className="text-slate-300">Track revenue, outstanding fees, and recent transactions.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <AddTransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-slate-400">{summary?.paidStudents || 0} students paid</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Students</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary?.totalStudents || 0}</div>
            <p className="text-xs text-slate-400">All enrolled students</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Outstanding Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">${summary?.outstandingFees?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-slate-400">{summary?.pendingStudents || 0} students pending</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">This Month's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${summary?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-slate-400">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Refunds Processed</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">${summary?.refunds?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-slate-400">2 refunds this month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription className="text-slate-300">A list of the most recent financial transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-200">Student</TableHead>
                  <TableHead className="text-slate-200">Batch</TableHead>
                  <TableHead className="text-slate-200">Type</TableHead>
                  <TableHead className="text-slate-200">Date</TableHead>
                  <TableHead className="text-right text-slate-200">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx._id} className="border-slate-800">
                    <TableCell className="font-medium">{tx.studentId.name}</TableCell>
                    <TableCell className="text-slate-300">{tx.batchId.name}</TableCell>
                    <TableCell className="text-slate-300">{tx.type}</TableCell>
                    <TableCell className="text-slate-300">{new Date(tx.transactionDate).toLocaleDateString()}</TableCell>
                    <TableCell className={`text-right font-mono ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
