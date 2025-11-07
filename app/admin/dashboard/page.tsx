'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Book, Building, GraduationCap, Briefcase, Award, Banknote, GitMerge } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AdminDashboard() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6 bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Welcome! Select an option to manage your application.</p>
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

        {/* Quick Access Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Link href="/admin/students">
            <Card className="bg-sky-900/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Students</CardTitle>
                <Users className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Approve and view students</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/courses">
            <Card className="bg-green-900/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Courses</CardTitle>
                <Book className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Add or edit courses</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/batches">
            <Card className="bg-amber-800/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Batches</CardTitle>
                <GraduationCap className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Organize students into batches</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/branches">
            <Card className="bg-fuchsia-900/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Branches</CardTitle>
                <GitMerge className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Manage institute branches</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/companies">
            <Card className="bg-rose-900/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Companies</CardTitle>
                <Building className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Partner company records</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/trainers">
            <Card className="bg-indigo-900/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Trainers</CardTitle>
                <Briefcase className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Teacher profiles and assignments</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/certificates">
            <Card className="bg-teal-900/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Certificates</CardTitle>
                <Award className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Issue and track certificates</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/finance">
            <Card className="bg-slate-800/30 backdrop-blur-lg border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Finance</CardTitle>
                <Banknote className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Manage</div>
                <p className="text-xs text-slate-300">Track payments and finances</p>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  )
}