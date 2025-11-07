'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddStudentForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = localStorage.getItem("auth_token")
    if (!token) {
      alert("Admin token not found. Please log in again.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message)
        setName("")
        setEmail("")
      } else {
        alert(`Failed to add student: ${result.message}`)
      }
    } catch (error) {
      console.error("Error adding student:", error)
      alert("An error occurred while adding the student.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"

  return (
    <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Add New Student</CardTitle>
        <CardDescription className="text-slate-300">
          Manually add a student and send them a welcome email with credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">Student Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyles} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} placeholder="student@example.com" />
          </div>
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Adding Student..." : "Add Student & Send Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}