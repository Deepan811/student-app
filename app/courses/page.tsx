"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
        <p className="text-xl text-slate-300 mb-8">Our courses are under construction. Please check back later!</p>
        <Link href="/">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
