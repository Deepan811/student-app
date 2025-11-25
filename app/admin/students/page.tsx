'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Mail, Eye, RefreshCw, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { AddStudentForm } from "@/components/add-student-form"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface User {
  _id: string
  name: string
  email: string
  createdAt: string
  status: string
}

export default function AdminStudentsPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingAllUsers, setLoadingAllUsers] = useState(false)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const router = useRouter()
  const { isLoading: authLoading } = useAuth()
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null)

  useEffect(() => {
    if (!authLoading) {
      fetchPendingUsers()
      fetchAllUsers()
    }
  }, [authLoading])

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/admin")
        return
      }

      const response = await fetch("/api/admin/users/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data.users)
      } else {
        if (response.status === 401) router.push("/admin")
        console.error("Failed to fetch pending users")
      }
    } catch (error) {
      console.error("Error fetching pending users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    setLoadingAllUsers(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.users)
      } else {
        toast.error("Failed to fetch all users.")
      }
    } catch (error) {
      console.error("Error fetching all users:", error)
    } finally {
      setLoadingAllUsers(false)
    }
  }


  const handleUserAction = async (userId: string, action: "approved" | "rejected") => {
    setProcessingUser(userId)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/admin")
        return
      }

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: action }),
      })

      if (response.ok) {
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId))
        setAllUsers((prev) =>
          prev.map((user) => (user._id === userId ? { ...user, status: action } : user))
        )
        toast.success(`User ${action} successfully${action === "approved" ? " and password sent via email" : ""}`)

      } else {
        try {
          const result = await response.json();
          toast.error(`Error processing user action: ${result.message}`)
        } catch (error) {
          toast.error(`Error processing user action: ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error("Error processing user:", error)
      toast.error("Error processing user action")
    } finally {
      setProcessingUser(null)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/admin")
        return
      }

      const response = await fetch(`/api/admin/students/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setAllUsers((prev) => prev.filter((user) => user._id !== userId))
        toast.success("Student deleted successfully")
      } else {
        const result = await response.json()
        toast.error(`Error deleting student: ${result.message}`)
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Error deleting student")
    } finally {
      setStudentToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">Pending</Badge>
      case "approved":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">Rejected</Badge>
      default:
        return <Badge variant="outline" className="border-slate-600">{status}</Badge>
    }
  }

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Student Management</h1>
          <p className="text-slate-300">Approve new students and manage existing ones.</p>
        </div>
      </div>
        
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="add">Add Student</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Pending Student Registrations</CardTitle>
                <CardDescription className="text-slate-300">Review and approve new student registrations</CardDescription>
              </div>
              <Button onClick={fetchPendingUsers} size="icon" variant="outline" className="bg-white/10 border-none text-white hover:bg-white/20 transition-all duration-300 shrink-0">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {loading && <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-slate-300"/></div>}
              {!loading && pendingUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-300">
                  <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p>No pending registrations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user._id} className="flex flex-wrap items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700 shadow-sm gap-4">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" onClick={() => handleUserAction(user._id, "approved")} disabled={processingUser === user._id} className="bg-green-600 hover:bg-green-700 text-white">
                          {processingUser === user._id ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserCheck className="h-4 w-4 md:mr-2" />}
                          <span className="hidden md:inline">{processingUser === user._id ? "Processing..." : "Approve"}</span>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUserAction(user._id, "rejected")} disabled={processingUser === user._id}>
                          <UserX className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all">
        <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">All Registered Users</CardTitle>
                <CardDescription className="text-slate-300">View all users and their status.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-slate-800 border-slate-700 text-white"
                />
                <Button onClick={fetchAllUsers} size="icon" variant="outline" className="bg-white/10 border-none text-white hover:bg-white/20 transition-all duration-300 shrink-0">
                  <RefreshCw className={`h-4 w-4 ${loadingAllUsers ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAllUsers && <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-slate-300"/></div>}
              {!loadingAllUsers && (
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-slate-300 py-10">No users found in the database.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user) => (
                          <Card key={user._id} className="bg-slate-800/40 border-slate-700 shadow-sm flex flex-col">
                            <CardHeader>
                              <CardTitle className="text-white">{user.name}</CardTitle>
                              <CardDescription className="text-slate-400 flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                              {getStatusBadge(user.status)}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" onClick={() => setStudentToDelete(user)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                              </AlertDialog>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                          </PaginationItem>
                          {[...Array(Math.ceil(filteredUsers.length / usersPerPage)).keys()].map(number => (
                            <PaginationItem key={number + 1}>
                              <Button
                                variant={currentPage === number + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(number + 1)}
                              >
                                {number + 1}
                              </Button>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                            >
                              Next
                            </Button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <AddStudentForm />
        </TabsContent>
      </Tabs>
      {studentToDelete && (
        <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student '{studentToDelete.name}' and all their associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(studentToDelete._id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
