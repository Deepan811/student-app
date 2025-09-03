'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Mail, Eye, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AddStudentForm } from "@/components/add-student-form"

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
  const [loading, setLoading] = useState(true)
  const [loadingAllUsers, setLoadingAllUsers] = useState(false)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [viewingAll, setViewingAll] = useState(false)
  const router = useRouter()
  const { isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      fetchPendingUsers()
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.users)
      } else {
        alert("Failed to fetch all users.")
      }
    } catch (error) {
      console.error("Error fetching all users:", error)
    } finally {
      setLoadingAllUsers(false)
    }
  }

  const handleViewAllUsers = async () => {
    setViewingAll(true)
    await fetchAllUsers()
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      })

      const result = await response.json();

      if (response.ok) {
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId))
        if (viewingAll) {
          setAllUsers((prev) =>
            prev.map((user) => (user._id === userId ? { ...user, status: action } : user))
          )
        }
        alert(`User ${action} successfully${action === "approved" ? " and password sent via email" : ""}`)

      } else {
        alert(`Error processing user action: ${result.message}`)
      }
    } catch (error) {
      console.error("Error processing user:", error)
      alert("Error processing user action")
    } finally {
      setProcessingUser(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">Pending</Badge>
      case "approved":
        return <Badge variant="secondary" className="bg-green-600 text-white">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
        <h1 className="text-2xl font-bold">Student Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                        <CardTitle>Pending Student Registrations</CardTitle>
                        <CardDescription>Review and approve new student registrations</CardDescription>
                        </div>
                        <Button onClick={fetchPendingUsers} size="sm" variant="outline">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading && <p className="text-center">Loading pending users...</p>}
                        {!loading && pendingUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p>No pending registrations</p>
                        </div>
                        ) : (
                        <div className="space-y-4">
                            {pendingUsers.map((user) => (
                            <div key={user._id} className="flex flex-wrap items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm gap-4">
                                <div className="flex-grow">
                                <h3 className="font-semibold">{user.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                <Button size="sm" onClick={() => handleUserAction(user._id, "approved")} disabled={processingUser === user._id} className="bg-green-600 hover:bg-green-700 text-white">
                                    <UserCheck className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">{processingUser === user._id ? "Processing..." : "Approve"}</span>
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleUserAction(user._id, "rejected")} disabled={processingUser === user._id}>
                                    <UserX className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Reject</span>
                                </Button>
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                        <CardTitle>All Registered Users</CardTitle>
                        <CardDescription>View all users and their status.</CardDescription>
                        </div>
                        <Button onClick={fetchAllUsers} size="sm" variant="outline">
                        <RefreshCw className={`h-4 w-4 ${loadingAllUsers ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {!viewingAll && (
                        <div className="text-center py-8">
                            <Button onClick={handleViewAllUsers} disabled={loadingAllUsers}>
                            <Eye className="h-4 w-4 mr-2" />
                            {loadingAllUsers ? "Loading..." : "View All Users"}
                            </Button>
                        </div>
                        )}
                        {viewingAll && loadingAllUsers && <p className="text-center">Loading users...</p>}
                        {viewingAll && !loadingAllUsers && (
                        <div className="space-y-4">
                            {allUsers.length === 0 ? (
                            <p className="text-center">No users found in the database.</p>
                            ) : (
                            allUsers.map((user) => (
                                <div key={user._id} className="flex flex-wrap items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm gap-4">
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>
                                </div>
                                {getStatusBadge(user.status)}
                                </div>
                            ))
                            )}
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <AddStudentForm />
            </div>
        </div>
    </div>
  )
}