import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'candidate' | 'organizer';
  photoURL?: string;
  quizesCreatedIds: mongoose.Types.ObjectId[];
  quizesAttemptedIds: mongoose.Types.ObjectId[];
  resultIds: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['candidate', 'organizer'],
    required: true,
  },
  photoURL: {
    type: String,
  },
  quizesCreatedIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
  }],
  quizesAttemptedIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
  }],
  resultIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
