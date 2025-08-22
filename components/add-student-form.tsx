"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
        // Clear form
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

  return (
    <Card className="backdrop-blur-lg bg-black/40 border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Add New Student</CardTitle>
        <CardDescription className="text-slate-300">
          Add a new student and send them a welcome email with their login credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Student Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/10 text-white" />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding Student..." : "Add Student & Send Welcome Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
