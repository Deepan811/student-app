
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, User, Tag, Edit, Home, LogOut, Phone, Building, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  status?: string
  mobile?: string
  collegeName?: string
  departmentName?: string
  courseName?: string
}

export default function ProfilePage() {
  const { user, token, logout, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth state to load

    if (!user || !token) {
      router.push("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setProfile(data.data)
            setFormData(data.data)
          } else {
            setError(data.message || "Failed to fetch profile")
          }
        } else {
          const errorData = await response.json()
          setError(errorData.message || `Error: ${response.status} ${response.statusText}`)
          if (response.status === 401) {
            logout()
            router.push("/auth")
          }
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, token, router, logout])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.id]: e.target.value })
    }
  }

  const handleSave = async () => {
    if (!formData) return

    const updatePayload = {
      name: formData.name,
      mobile: formData.mobile,
      collegeName: formData.collegeName,
      departmentName: formData.departmentName,
      courseName: formData.courseName,
    };

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
          setIsEditing(false)
        } else {
          setError(data.message || "Failed to update profile")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || `Error: ${response.status} ${response.statusText}`)
      }
    } catch (err: any) {
      setError(err.message || "Network error updating profile")
    }
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-500">
        <p className="text-white">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-500 p-6">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button onClick={() => router.push("/auth")} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-500 p-6">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">Could not load user profile data.</p>
            <Button onClick={() => router.push("/")} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-500 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg text-slate-800 font-bold hover:bg-white/50 transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-24 w-24 mb-4 border-4 border-white/20">
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>{profile.name ? profile.name.charAt(0).toUpperCase() : ''}</AvatarFallback>
            </Avatar>
            <h2 className="text-3xl font-bold mb-1">{profile.name}</h2>
            <p className="text-lg text-slate-600 capitalize">{profile.role}</p>
            {profile.status && (
              <span className="text-sm text-slate-500 capitalize mt-1">({profile.status})</span>
            )}
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData?.name || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData?.email || ""} readOnly className="bg-black/20 border-none text-slate-400 cursor-not-allowed" />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" value={formData?.mobile || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
              </div>
              <div>
                <Label htmlFor="collegeName">College Name</Label>
                <Input id="collegeName" value={formData?.collegeName || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
              </div>
              <div>
                <Label htmlFor="departmentName">Department Name</Label>
                <Input id="departmentName" value={formData?.departmentName || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
              </div>
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input id="courseName" value={formData?.courseName || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">Contact Information</h3>
                <div className="space-y-2 text-slate-600">
                  <p className="flex items-center gap-2 hover:text-slate-800"><Mail className="h-4 w-4 text-slate-500" /> {profile.email}</p>
                  <p className="flex items-center gap-2 hover:text-slate-800"><Phone className="h-4 w-4 text-slate-500" /> {profile.mobile || "Not specified"}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">Academic Information</h3>
                <div className="space-y-2 text-slate-600">
                  <p className="flex items-center gap-2 hover:text-slate-800"><Building className="h-4 w-4 text-slate-500" /> {profile.collegeName || "Not specified"}</p>
                  <p className="flex items-center gap-2 hover:text-slate-800"><GraduationCap className="h-4 w-4 text-slate-500" /> {profile.departmentName || "Not specified"}</p>
                  <p className="flex items-center gap-2 hover:text-slate-800"><Tag className="h-4 w-4 text-slate-500" /> {profile.courseName || "Not specified"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Save</Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300 flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            )}
            <Button onClick={logout} variant="outline" className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300 flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
            <Link href="/" passHref>
              <Button variant="outline" className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300 flex items-center gap-2">
                ← Go to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
