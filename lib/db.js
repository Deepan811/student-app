import clientPromise from "./mongodb.js"; // Revert to default import

export async function connectMongoDB() { // Remove uri argument
  try {
    const client = await clientPromise; // Use clientPromise directly
    return client.db(); // Returns the default database instance
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}