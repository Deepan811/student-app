import { ObjectId } from "mongodb"
import clientPromise from "../lib/mongodb.js"

class Course {
  constructor(data) {
    this.name = data.name
    this.description = data.description
    this.price = data.price
    this.discountPrice = data.discountPrice
    this.image = data.image
    this.instructor = data.instructor
    this.duration = data.duration
    this.level = data.level || "Beginner"
    this.category = data.category
    this.isActive = data.isActive !== undefined ? data.isActive : true
    this.enrolledStudents = []
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  // Save course to database
  async save() {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("courses").insertOne(this)
    return result
  }

  // Get all active courses
  static async getActiveCourses() {
    const client = await clientPromise
    const db = client.db()

    const courses = await db.collection("courses").find({ isActive: true }).toArray()
    return courses
  }

  // Find course by ID
  static async findById(id) {
    const client = await clientPromise
    const db = client.db()

    const course = await db.collection("courses").findOne({ _id: new ObjectId(id) })
    return course
  }

  // Enroll student in course
  static async enrollStudent(courseId, studentId) {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("courses").updateOne(
      { _id: new ObjectId(courseId) },
      {
        $addToSet: { enrolledStudents: new ObjectId(studentId) },
        $set: { updatedAt: new Date() },
      },
    )
    return result
  }

  // Get enrolled courses for a student
  static async getEnrolledCourses(studentId) {
    const client = await clientPromise
    const db = client.db()

    const courses = await db
      .collection("courses")
      .find({
        enrolledStudents: new ObjectId(studentId),
      })
      .toArray()

    return courses
  }
}

export default Course
