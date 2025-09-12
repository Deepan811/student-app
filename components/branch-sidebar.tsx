'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  PanelRight,
  LayoutDashboard,
  Users,
  User,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/branch/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/branch/profile", label: "Profile", icon: User },
  { href: "/branch/students", label: "Students", icon: Users },
]

export function BranchSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/auth/branch/login")
  }

  const renderNavLinks = (isMobileSheet: boolean) => (
    <nav className="grid items-start gap-2 px-4 text-sm font-medium">
      {navItems.map(({ href, label, icon: Icon }) => (
        isMobileSheet ? (
          <SheetClose asChild key={label}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                pathname === href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </SheetClose>
        ) : (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname === href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      ))}
      {isMobileSheet ? (
        <SheetClose asChild>
          <Button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 w-full justify-start"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </SheetClose>
      ) : (
        <Button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 w-full justify-start"
          variant="ghost"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      )}
    </nav>
  )

  return (
    <div className="flex h-full flex-col">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <LayoutDashboard className="h-6 w-6" />
              <span>Branch Panel</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            {renderNavLinks(false)}
          </div>
        </div>
      </div>
      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden fixed top-4 right-4 z-50" size="icon" variant="outline">
            <PanelRight className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[240px] flex flex-col p-0">
          <SheetHeader className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <LayoutDashboard className="h-6 w-6" />
              <span>Branch Panel</span>
            </Link>
            <SheetTitle className="sr-only">Branch Menu</SheetTitle>
            <SheetDescription className="sr-only">A list of links to navigate the branch section.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-2">
            {renderNavLinks(true)}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
