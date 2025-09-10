import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bio: {
    type: String,
  },
  expertise: [{
    type: String,
  }],
  profilePicture: {
    type: {
      type: String,
      enum: ['url', 'upload'],
      default: 'url',
    },
    value: {
      type: String,
    }
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
}, { timestamps: true });

const Trainer = mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);

export default Trainer;
