'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  PanelRight,
  LayoutDashboard,
  Users,
  Book,
  Building,
  GraduationCap,
  Briefcase,
  Award,
  Banknote,
  GitMerge,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: Book },
  { href: "/admin/batches", label: "Batches", icon: GraduationCap },
  { href: "/admin/branches", label: "Branches", icon: GitMerge },
  { href: "/admin/companies", label: "Companies", icon: Building },
  { href: "/admin/trainers", label: "Trainers", icon: Briefcase },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/finance", label: "Finance", icon: Banknote },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  const renderNavLinks = (isMobileSheet: boolean) => {
    const logoutButton = (
      <Button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white w-full justify-start mt-4"
        variant="ghost"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    );

    return (
      <nav className="grid items-start gap-2 px-4 text-sm font-medium">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const linkContent = (
            <>
              <Icon className="h-4 w-4" />
              {label}
            </>
          );
          const linkClasses = cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white",
            isActive && "bg-white/10 text-white"
          );

          return isMobileSheet ? (
            <SheetClose asChild key={label}>
              <Link href={href} className={linkClasses}>
                {linkContent}
              </Link>
            </SheetClose>
          ) : (
            <Link key={label} href={href} className={linkClasses}>
              {linkContent}
            </Link>
          );
        })}
        
        {isMobileSheet ? <SheetClose asChild>{logoutButton}</SheetClose> : logoutButton}
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden border-l bg-slate-900/30 backdrop-blur-lg border-white/20 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b border-white/20 px-6">
            <Link className="flex items-center gap-2 font-semibold text-white" href="/">
              <GraduationCap className="h-6 w-6" />
              <span>Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            {renderNavLinks(false)}
          </div>
        </div>
      </div>
      {/* Mobile Sheet Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden fixed top-4 right-4 z-50" size="icon" variant="outline">
            <PanelRight className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[240px] flex flex-col p-0 bg-slate-900/80 backdrop-blur-lg border-l border-white/20 text-white">
          <SheetHeader className="flex h-[60px] items-center border-b border-white/20 px-6">
            <Link className="flex items-center gap-2 font-semibold text-white" href="/">
              <GraduationCap className="h-6 w-6" />
              <span>Admin Panel</span>
            </Link>
            <SheetTitle className="sr-only">Admin Menu</SheetTitle>
            <SheetDescription className="sr-only">A list of administrative links to navigate the application.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-2">
            {renderNavLinks(true)}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}