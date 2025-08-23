"use client"

import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"

export function Navbar() {
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            SkillChemy
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/courses" className="text-foreground hover:text-primary transition-colors">
              Courses
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    {user.role === "admin" ? (
                      <>
                        <User className="h-4 w-4" />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role} {user.status && `(${user.status})`}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === "student" && (
                    <DropdownMenuItem asChild>
                      <Link href="/auth/profile">Profile</Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <>
                <Button variant="outline" className="hidden sm:inline-flex bg-transparent hover:text-red-500" asChild>
                  <Link href="/auth">Login</Link>
                </Button>
                <Button className="sm:hidden bg-primary hover:bg-primary/90 text-primary-foreground hover:text-black-500" asChild>
                  <Link href="/auth">User</Link>
                </Button>
                 <Button variant="outline" className="hidden sm:inline-flex bg-transparent hover:text-red-500" asChild>
                  <Link href="/auth">Register</Link>
                </Button>
                <Button
                  variant="secondary"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:text-red-500"
                  asChild
                >
                  <Link href="/admin">Admin</Link>
                </Button>
              </>
          )}
        </div>
      </div>
    </nav>
  )
}