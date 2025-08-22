import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client
      .connect()
      .then((client) => {

        return client
      })
      .catch((error) => {

        throw error
      })
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client
    .connect()
    .then((client) => {
      
      return client
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error)
      throw error
    })
}

export default clientPromise