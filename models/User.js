import { ObjectId } from "mongodb"
import clientPromise from "../lib/mongodb"
import bcrypt from "bcryptjs"

class User {
  constructor(data) {
    this.name = data.name
    this.email = data.email
    this.role = data.role || "student"
    this.status = data.status || "pending" // pending, approved, rejected
    this.generatedPassword = data.generatedPassword || null
    this.mobile = data.mobile || null
    this.collegeName = data.collegeName || null
    this.departmentName = data.departmentName || null
    this.courseName = data.courseName || null
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  // Hash password before saving
  async hashPassword() {
    if (this.generatedPassword) {
      this.generatedPassword = await bcrypt.hash(this.generatedPassword, 12)
    }
  }

  // Save user to database
  async save() {
    const client = await clientPromise
    const db = client.db()

    await this.hashPassword()
    const result = await db.collection("users").insertOne(this)
    return result
  }

  // Find user by email
  static async findByEmail(email) {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ email })
    return user
  }

  // Find user by ID
  static async findById(id) {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ _id: new ObjectId(id) })
    return user
  }

  // Verify password
  static async verifyPassword(plainPassword, user) {
    console.log("User.verifyPassword: plainPassword received:", plainPassword);
    console.log("User.verifyPassword: user.generatedPassword (hashed) from DB:", user.generatedPassword);
    if (user.generatedPassword) {
      const result = await bcrypt.compare(plainPassword, user.generatedPassword);
      console.log("User.verifyPassword: bcrypt.compare result:", result);
      return result;
    }
    console.log("User.verifyPassword: user.generatedPassword is null or undefined.");
    return false;
  }

  // Update user status (for admin approval)
  static async updateStatus(userId, status) {
    console.log(`Model: updateStatus - Started for user ${userId} with status ${status}`);
    const client = await clientPromise;
    const db = client.db();

    const updateData = {
      status: status,
      updatedAt: new Date(),
    };

    // Generate password when approving user
    if (status === "approved") {
      console.log("Model: updateStatus - Generating random password");
      const plainPassword = User.generateRandomPassword();
      console.log("Model: updateStatus - Generated plain password:", plainPassword);
      console.log("Model: updateStatus - Hashing password");
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      console.log("Model: updateStatus - Hashed password:", hashedPassword);
      updateData.generatedPassword = hashedPassword;
      updateData.plainPassword = plainPassword; // Store temporarily for email
      console.log("Model: updateStatus - Password generated and hashed");
    }

    console.log(`Model: updateStatus - Updating database for user ${userId}`);
    const result = await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updateData });
    console.log("Model: updateStatus - Database update result:", result);

    return { ...result, plainPassword: updateData.plainPassword };
  }

  // Update user profile
  static async updateProfile(userId, data) {
    const client = await clientPromise;
    const db = client.db();

    const updateData = { ...data, updatedAt: new Date() };
    delete updateData._id; // Don't update the _id

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return null; // Or throw an error
    }

    const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    return updatedUser;
  }

  // Get all pending users (for admin)
  static async getPendingUsers() {
    console.log("User.getPendingUsers: Attempting to get pending users...");
    const client = await clientPromise
    console.log("User.getPendingUsers: MongoDB client obtained.");
    const db = client.db()
    console.log("User.getPendingUsers: Database object obtained.");

    const users = await db
      .collection("users")
      .find({
        status: "pending",
        role: "student",
      })
      .toArray()
    console.log("User.getPendingUsers: Fetched users from DB:", users);
    return users
  }

  // Get all users for admin debugging
  static async getAllUsersForAdmin() {
    const client = await clientPromise
    const db = client.db()
    const users = await db.collection("users").find({}).toArray()
    return users
  }

  // Get all users with pagination
  static async getAllUsers(page = 1, limit = 10) {
    const client = await clientPromise
    const db = client.db()

    const skip = (page - 1) * limit
    const users = await db.collection("users").find({}).skip(skip).limit(limit).toArray()

    const total = await db.collection("users").countDocuments()

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Generate random password
  static generateRandomPassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}

export default User
