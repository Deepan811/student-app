import mongoose from 'mongoose';
import User from '../models/User.js'; // Adjust the path to your User model if necessary
import dbConnect from '../lib/dbConnect.js';

const migrateData = async () => {
  try {
    await dbConnect();

    const usersToMigrate = await User.find({ batch: { $exists: true, $ne: null } });

    if (usersToMigrate.length === 0) {
      console.log("No users to migrate.");
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    for (const user of usersToMigrate) {
      if (!user.batches.includes(user.batch)) {
        user.batches.push(user.batch);
        await user.save();
        migratedCount++;
      }
    }

    console.log(`Migrated ${migratedCount} out of ${usersToMigrate.length} users.`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Migration failed:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

migrateData();
