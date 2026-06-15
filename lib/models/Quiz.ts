import mongoose, { Document, Model } from 'mongoose';

export interface IQuestion {
  questionId: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  organizerId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  totalMarks: number;
  eachMarks: number;
  duration: number;
  negativeMarking: boolean;
  negativeMarks: number;
  createdAt: Date;
}

const QuestionSchema = new mongoose.Schema<IQuestion>({
  questionId: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true,
  },
});

const QuizSchema = new mongoose.Schema<IQuiz>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [QuestionSchema],
  totalMarks: {
    type: Number,
    required: true,
  },
  eachMarks: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  negativeMarking: {
    type: Boolean,
    default: false,
  },
  negativeMarks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz;
