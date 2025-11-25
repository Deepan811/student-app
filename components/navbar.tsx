"use client"

import { Button } from "@/components/ui/button"
import { User, LogOut, Menu, ShoppingCart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { Badge } from "@/components/ui/badge"

const CartIcon = () => {
  const { cartItems } = useCart();
  return (
    <Link href="/cart" className="relative p-2">
      <ShoppingCart className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
      {cartItems.length > 0 && (
        <Badge className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground">
          {cartItems.length}
        </Badge>
      )}
    </Link>
  );
};

export function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const navLinks = (
    <>
      <Link href="/" className="text-foreground hover:text-primary transition-colors text-lg">
        Home
      </Link>
      <Link href="/courses" className="text-foreground hover:text-primary transition-colors text-lg">
        Courses
      </Link>
    </>
  )

  const authButtons = (
    <div className="flex flex-col space-y-2 mt-6">
      <DropdownMenuItem asChild>
        <Link href="/auth">User Login</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/admin">Admin Login</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/auth/branch/login">Branch Login</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/auth/trainer/login">Trainer Login</Link>
      </DropdownMenuItem>
    </div>
  )

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

        <div className="hidden md:flex items-center space-x-4">
          {user?.role === 'student' && <CartIcon />}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Login</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/auth">User Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/branch/login">Branch Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/trainer/login">Trainer Login</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              {user ? (
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt={user.name} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-0">
              <div className="flex flex-col h-full">
                {user ? (
                  <>
                    <div className="bg-muted p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt={user.name} />
                          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col space-y-4">
                      {navLinks}
                      {user.role === 'student' && <CartIcon />}
                    </div>

                    <Separator />

                    <div className="p-4 flex flex-col space-y-4">
                      <h3 className="text-base font-semibold text-muted-foreground">My Account</h3>
                      {user.role === "student" && (
                        <Link href="/auth/profile" className="text-foreground hover:text-primary transition-colors text-lg">Profile</Link>
                      )}
                      {user.role === "admin" && (
                        <Link href="/admin/dashboard" className="text-foreground hover:text-primary transition-colors text-lg">Admin Dashboard</Link>
                      )}
                      {user.role === "branch" && (
                        <Link href="/branch/dashboard" className="text-foreground hover:text-primary transition-colors text-lg">Branch Dashboard</Link>
                      )}
                    </div>

                    <div className="mt-auto p-4">
                      <Button variant="outline" onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 border-b">
                      <h2 className="text-xl font-bold">Menu</h2>
                    </div>

                    <div className="p-4 flex flex-col space-y-4">
                      {navLinks}
                    </div>

                    <Separator />

                    <div className="p-4">
                      {authButtons}
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

function UserMenu({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
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
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt={user.name} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.name}</span>
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
        {user.role === "branch" && (
          <DropdownMenuItem asChild>
            <Link href="/branch/dashboard">Branch Dashboard</Link>
          </DropdownMenuItem>
        )}
        {user.role === "trainer" && (
          <DropdownMenuItem asChild>
            <Link href="/trainer/profile">Profile</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}