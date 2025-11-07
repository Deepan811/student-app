"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, User, Tag, Edit, Home, LogOut, Phone, Building, GraduationCap, Link as LinkIcon, Trash2, CreditCard, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Dashboard } from "@/components/student/dashboard";
import { StudentDashboard } from "@/components/student-dashboard"
import { ProfileSettings } from "@/components/profile-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function ProfilePage() {
  const { user, token, login, logout, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar visibility

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Error: ${response.status} ${response.statusText}`);
        if (response.status === 401) {
          logout();
          router.push("/auth");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || !token) {
      router.push("/auth");
      return;
    }
    fetchProfile();
  }, [user, token, router, logout, isAuthLoading]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 p-6 flex">
      {/* Burger icon for mobile */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`w-64 bg-gray-800/70 backdrop-blur-sm rounded-l-2xl p-6 flex flex-col justify-between
        ${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden sm:flex'}`}>
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Dashboard</h2>
          <nav className="space-y-4">
            <Button onClick={() => { setActiveSection('dashboard'); setIsSidebarOpen(false); }} variant={activeSection === 'dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start text-white">Dashboard</Button>
            <Button onClick={() => { setActiveSection('courses'); setIsSidebarOpen(false); }} variant={activeSection === 'courses' ? 'secondary' : 'ghost'} className="w-full justify-start text-white">My Courses</Button>
            <Button onClick={() => { setActiveSection('settings'); setIsSidebarOpen(false); }} variant={activeSection === 'settings' ? 'secondary' : 'ghost'} className="w-full justify-start text-white">Profile Settings</Button>
          </nav>
        </div>
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-white hover:bg-red-500/50">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </aside>
      <main className="flex-1 p-6 sm:ml-0"> {/* Adjusted padding */}
        <div className="w-full max-w-4xl mx-auto p-4"> {/* Adjusted padding */}
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20 border-4 border-blue-400"> {/* Reduced size */}
              <AvatarImage src={profile.profilePicture || "/placeholder-user.jpg"} alt="User Avatar" />
              <AvatarFallback>{profile.name ? profile.name.charAt(0).toUpperCase() : ''}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
              <p className="text-lg text-blue-300 capitalize">{profile.role}</p>
            </div>
          </div>

          {activeSection === 'dashboard' && (
            <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-gray-100">
              <CardContent className="p-6">
                <Dashboard profile={profile} />
              </CardContent>
            </Card>
          )}
          {activeSection === 'courses' && (
            <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle className="text-white">Enrolled Courses</CardTitle>
                <CardDescription className="text-gray-300">Courses you are currently enrolled in.</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentDashboard courses={profile.enrolledCourses} />
              </CardContent>
            </Card>
          )}
          {activeSection === 'settings' && (
            <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
                <CardDescription className="text-gray-300">Update your personal and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettings profile={profile} onProfileUpdate={handleProfileUpdate} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
