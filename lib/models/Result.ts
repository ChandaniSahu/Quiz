import mongoose, { Document, Model } from 'mongoose';

export interface IAnswer {
  questionId: number;
  selectedOption?: string;
}

export interface IResult extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  score: number;
  answers: IAnswer[];
  timeTaken: number;
  submittedAt: Date;
}

const AnswerSchema = new mongoose.Schema<IAnswer>({
  questionId: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: String,
  },
});

const ResultSchema = new mongoose.Schema<IResult>({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  answers: [AnswerSchema],
  timeTaken: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Result: Model<IResult> = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export default Result;
