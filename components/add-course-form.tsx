"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function AddCourseForm() {
  const [courseName, setCourseName] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [coursePrice, setCoursePrice] = useState("")
  const [discountPrice, setDiscountPrice] = useState("")
  const [courseImage, setCourseImage] = useState("")
  const [instructor, setInstructor] = useState("")
  const [duration, setDuration] = useState("")
  const [level, setLevel] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("adminToken")
    if (!token) {
      alert("Admin token not found. Please log in again.")
      return
    }

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: courseName,
          description: courseDescription,
          price: parseFloat(coursePrice),
          discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
          image: courseImage,
          instructor,
          duration,
          level,
          category,
        }),
      })

      if (response.ok) {
        alert("Course added successfully!")
        // Clear form
        setCourseName("")
        setCourseDescription("")
        setCoursePrice("")
        setDiscountPrice("")
        setCourseImage("")
        setInstructor("")
        setDuration("")
        setLevel("")
        setCategory("")
      } else {
        const errorData = await response.json()
        alert(`Failed to add course: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error adding course:", error)
      alert("An error occurred while adding the course.")
    }
  }

  return (
    <Card className="backdrop-blur-lg bg-black/40 border border-white/10 mb-8">
      <CardHeader>
        <CardTitle className="text-white">Add New Course</CardTitle>
        <CardDescription className="text-slate-300">Fill in the details to add a new course.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-white">Course Name</Label>
              <Input id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} required className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coursePrice" className="text-white">Price</Label>
              <Input id="coursePrice" type="number" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} required className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPrice" className="text-white">Discount Price (Optional)</Label>
              <Input id="discountPrice" type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor" className="text-white">Instructor</Label>
              <Input id="instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)} required className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Duration</Label>
              <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level" className="text-white">Level</Label>
              <Input id="level" value={level} onChange={(e) => setLevel(e.target.value)} required className="bg-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseImage" className="text-white">Image URL</Label>
              <Input id="courseImage" value={courseImage} onChange={(e) => setCourseImage(e.target.value)} required className="bg-white/10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseDescription" className="text-white">Description</Label>
            <Textarea id="courseDescription" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} required className="bg-white/10 text-white" />
          </div>
          <Button type="submit" className="w-full">Add Course</Button>
        </form>
      </CardContent>
    </Card>
  )
}
