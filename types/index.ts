export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'organizer';
  photoURL?: string;
  quizesCreatedIds: string[];
  quizesAttemptedIds: string[];
  resultIds: string[];
  createdAt: Date;
}

export interface Question {
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

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  organizerId: string | User;
  questions: Question[];
  totalMarks: number;
  eachMarks: number;
  duration: number;
  negativeMarking: boolean;
  negativeMarks: number;
  createdAt: Date;
}

export interface QuizFormData {
  title: string;
  description: string;
  duration: number;
  eachMarks: number;
  negativeMarking: boolean;
  negativeMarks: number;
  totalMarks: number;
}

export interface Answer {
  questionId: number;
  selectedOption?: string;
}

export interface Result {
  _id: string;
  quizId: string | Quiz;
  studentId: string | User;
  score: number;
  answers: Answer[];
  timeTaken: number;
  submittedAt: Date;
}

export interface QuizAttempt {
  quizId: string;
  answers: Record<number, string>;
}

export interface GroqResponse {
  questions: Question[];
}
