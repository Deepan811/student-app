import { ObjectId } from "mongodb"
import clientPromise from "../lib/mongodb"
import bcrypt from "bcryptjs"

class Admin {
  constructor(data) {
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.role = "admin"
    this.permissions = data.permissions || ["manage_users", "manage_courses"]
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12)
    }
  }

  // Save admin to database
  async save() {
    const client = await clientPromise
    const db = client.db()

    await this.hashPassword()
    const result = await db.collection("admins").insertOne(this)
    return result
  }

  // Find admin by email
  static async findByEmail(email) {
    const client = await clientPromise
    const db = client.db()

    const admin = await db.collection("admins").findOne({ email })
    return admin
  }

  // Find admin by ID
  static async findById(id) {
    const client = await clientPromise
    const db = client.db()

    const admin = await db.collection("admins").findOne({ _id: new ObjectId(id) })
    return admin
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Create default admin (for initial setup)
  static async createDefaultAdmin() {
    const client = await clientPromise
    const db = client.db()

    const existingAdmin = await db.collection("admins").findOne({ email: "admin@studentmanagement.com" })

    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        name: "System Administrator",
        email: "admin@studentmanagement.com",
        password: "admin123", // Should be changed after first login
        permissions: ["manage_users", "manage_courses", "manage_admins"],
      })

      return await defaultAdmin.save()
    }

    return existingAdmin
  }
}

export default Admin
