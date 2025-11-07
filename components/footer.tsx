
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto py-8 px-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-muted-foreground text-sm mb-4 sm:mb-0">
          &copy; {new Date().getFullYear()} TechForge. All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          <Link href="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-primary">
            Terms & Conditions
          </Link>
          <p className="text-sm text-muted-foreground">
            Created by TechForge
          </p>
        </div>
      </div>
    </footer>
  )
}
