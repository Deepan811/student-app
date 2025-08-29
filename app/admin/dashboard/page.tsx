"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAllUsers, setLoadingAllUsers] = useState(false)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [viewingAll, setViewingAll] = useState(false)
  const router = useRouter()
  const { logout, isLoading: authLoading } = useAuth()

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data.users)
      } else {
        if (response.status === 401) router.push("/admin") // Re-enable redirect
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
        alert(`User ${action} successfully${status === "approved" ? " and password sent via email" : ""}`)

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

  const handleLogout = () => {
    logout()
    router.push("/admin")
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

  if (loading && !pendingUsers.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6 bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Manage student registrations and approvals</p>
          </div>
          <div className="flex gap-2 flex-wrap md:gap-4">
            <Button asChild variant="outline" className="w-full md:w-auto bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
              <Link href="/">Go to Home</Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full md:w-auto bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Pending Student Registrations</CardTitle>
                  <CardDescription className="text-slate-300">Review and approve new student registrations</CardDescription>
                </div>
                <Button onClick={fetchPendingUsers} size="sm" variant="outline" className="bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-center text-slate-300">Loading pending users...</p>}
                {!loading && pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300">No pending registrations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user._id} className="flex flex-wrap items-center justify-between p-4 bg-black/20 rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 gap-4">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          <p className="text-slate-300 text-sm flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" onClick={() => handleUserAction(user._id, "approved")} disabled={processingUser === user._id} className="bg-green-700 hover:bg-green-800 text-white shadow-sm hover:shadow-md transition-all duration-300">
                            <UserCheck className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">{processingUser === user._id ? "Processing..." : "Approve"}</span>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleUserAction(user._id, "rejected")} disabled={processingUser === user._id} className="bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-300">
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
          </div>

          <div className="lg:col-span-1">
            <AddStudentForm />
            <Card className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 mt-8">
              <CardHeader>
                <CardTitle className="text-white">Batch Management</CardTitle>
                <CardDescription className="text-slate-300">Create and manage student batches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
                  <Link href="/admin/batches">Go to Batch Management</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">All Registered Users</CardTitle>
              <CardDescription className="text-slate-300">View all users and their status. For debugging purposes.</CardDescription>
            </div>
            <Button onClick={fetchAllUsers} size="sm" variant="outline" className="bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
              <RefreshCw className={`h-4 w-4 ${loadingAllUsers ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {!viewingAll && (
              <div className="text-center py-8">
                <Button onClick={handleViewAllUsers} disabled={loadingAllUsers} className="bg-white/20 border-none text-white hover:bg-white/40 transition-all duration-300">
                  <Eye className="h-4 w-4 mr-2" />
                  {loadingAllUsers ? "Loading..." : "View All Users"}
                </Button>
              </div>
            )}
            {viewingAll && loadingAllUsers && <p className="text-slate-300 text-center">Loading users...</p>}
            {viewingAll && !loadingAllUsers && (
              <div className="space-y-4">
                {allUsers.length === 0 ? (
                  <p className="text-slate-300 text-center">No users found in the database.</p>
                ) : (
                  allUsers.map((user) => (
                    <div key={user._id} className="flex flex-wrap items-center justify-between p-4 bg-black/20 rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 gap-4">
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        <p className="text-slate-300 text-sm flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>
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
    </div>
  )
}