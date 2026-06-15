import fs from 'fs';
import path from 'path';

// Base directory - current directory (quiz)
const BASE_DIR = process.cwd();

// File structure with their content
const files = {
  // Type definitions
  'types/index.ts': `export interface User {
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
}`,

  // Root files
  '.env.local': `MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000`,

  'middleware.ts': `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protected organizer routes
  if (pathname.startsWith('/organizer') && (!token || token.role !== 'organizer')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protected candidate routes
  if (pathname.startsWith('/candidate') && (!token || token.role !== 'candidate')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Protected quiz attempt route
  if (pathname.includes('/attempt') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/organizer/:path*', '/candidate/:path*', '/quiz/:path*/attempt'],
};`,

  // App layout
  'app/layout.tsx': `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quiz App',
  description: 'AI-powered quiz application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}`,

  'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors;
  }
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors;
  }
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}`,

  'app/page.tsx': `import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-5xl font-bold text-center mb-6">
        AI-Powered Quiz Platform
      </h1>
      <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl">
        Create quizzes instantly with AI or test your knowledge with our smart quiz system.
      </p>
      <div className="flex gap-4">
        <Link href="/organizer/dashboard" className="btn-primary">
          Create Quiz
        </Link>
        <Link href="/candidate/dashboard" className="btn-secondary">
          Take Quiz
        </Link>
      </div>
    </div>
  );
}`,

  // Auth pages
  'app/auth/login/page.tsx': `'use client';
import { useState } from 'react';
import GoogleLoginBtn from '@/components/auth/GoogleLoginBtn';
import RoleSelector from '@/components/auth/RoleSelector';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'organizer' | null>(null);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Select Your Role</h3>
          <RoleSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole} 
          />
        </div>

        {selectedRole && (
          <div className="space-y-4">
            <GoogleLoginBtn role={selectedRole} />
          </div>
        )}

        {!selectedRole && (
          <p className="text-gray-500 text-center">Please select a role to continue</p>
        )}
      </div>
    </div>
  );
}`,

  // Organizer pages
  'app/organizer/layout.tsx': `import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute role="organizer">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </ProtectedRoute>
  );
}`,

  'app/organizer/dashboard/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import QuizCard from '@/components/organizer/QuizCard';
import Link from 'next/link';
import type { Quiz } from '@/types';

export default function OrganizerDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link href="/organizer/create-quiz" className="btn-primary">
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No quizzes created yet. Create your first quiz!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}`,

  'app/organizer/create-quiz/page.tsx': `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuizGenerator from '@/components/organizer/QuizGenerator';
import MCQEditor from '@/components/organizer/MCQEditor';
import QuizForm from '@/components/organizer/QuizForm';
import toast from 'react-hot-toast';
import type { Question, QuizFormData } from '@/types';

interface QuizState {
  title: string;
  description: string;
  questions: Question[];
  totalMarks: number;
  eachMarks: number;
  duration: number;
  negativeMarking: boolean;
  negativeMarks: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizState>({
    title: '',
    description: '',
    questions: [],
    totalMarks: 0,
    eachMarks: 0,
    duration: 30,
    negativeMarking: false,
    negativeMarks: 0,
  });

  const handleQuestionsGenerated = (questions: Question[]) => {
    setQuizData(prev => ({ ...prev, questions }));
    setStep(2);
  };

  const handleQuestionsEdited = (questions: Question[]) => {
    setQuizData(prev => ({ ...prev, questions }));
    setStep(3);
  };

  const handleSaveQuiz = async (formData: QuizFormData) => {
    try {
      const finalQuizData = { ...quizData, ...formData };
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalQuizData),
      });

      if (response.ok) {
        toast.success('Quiz created successfully!');
        router.push('/organizer/dashboard');
      } else {
        throw new Error('Failed to create quiz');
      }
    } catch (error) {
      toast.error('Failed to create quiz');
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create Quiz</h1>

      <div className="flex mb-8">
        <div className={\`flex-1 h-2 \${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}\`} />
        <div className={\`flex-1 h-2 \${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}\`} />
        <div className={\`flex-1 h-2 \${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}\`} />
      </div>

      {step === 1 && (
        <QuizGenerator onQuestionsGenerated={handleQuestionsGenerated} />
      )}

      {step === 2 && (
        <MCQEditor 
          questions={quizData.questions}
          onQuestionsEdited={handleQuestionsEdited}
        />
      )}

      {step === 3 && (
        <QuizForm 
          quizData={quizData}
          onSave={handleSaveQuiz}
        />
      )}
    </div>
  );
}`,

  'app/organizer/edit-quiz/[quizId]/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MCQEditor from '@/components/organizer/MCQEditor';
import toast from 'react-hot-toast';
import type { Quiz, Question } from '@/types';

export default function EditQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(\`/api/quizzes/\${quizId}\`);
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (editedQuestions: Question[]) => {
    try {
      const response = await fetch(\`/api/quizzes/\${quizId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: editedQuestions }),
      });

      if (response.ok) {
        toast.success('Quiz updated successfully!');
        router.push('/organizer/dashboard');
      }
    } catch (error) {
      toast.error('Failed to update quiz');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Quiz: {quiz.title}</h1>
      <MCQEditor 
        questions={quiz.questions}
        onQuestionsEdited={handleSave}
      />
    </div>
  );
}`,

  'app/organizer/results/[quizId]/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ResultsTable from '@/components/organizer/ResultsTable';
import type { Quiz, Result } from '@/types';

export default function QuizResultsPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [results, setResults] = useState<Result[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      const [quizRes, resultsRes] = await Promise.all([
        fetch(\`/api/quizzes/\${quizId}\`),
        fetch(\`/api/quizzes/\${quizId}/results\`)
      ]);
      
      const quizData = await quizRes.json();
      const resultsData = await resultsRes.json();
      
      setQuiz(quizData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Results: {quiz?.title}
      </h1>
      {quiz && <ResultsTable results={results} quiz={quiz} />}
    </div>
  );
}`,

  // Candidate pages
  'app/candidate/layout.tsx': `import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute role="candidate">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </ProtectedRoute>
  );
}`,

  'app/candidate/dashboard/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import type { Result } from '@/types';

export default function CandidateDashboard() {
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttemptedQuizzes();
  }, []);

  const fetchAttemptedQuizzes = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setAttemptedQuizzes(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Quizzes Attempted</p>
            <p className="text-2xl font-bold">{attemptedQuizzes.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : attemptedQuizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No quizzes attempted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {attemptedQuizzes.map((result) => (
            <div key={result._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg">
                {(result.quizId as { title?: string })?.title || 'Quiz'}
              </h3>
              <p className="text-gray-600">Score: {result.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,

  'app/candidate/results/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import ResultSummary from '@/components/candidate/ResultSummary';
import type { Result } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Results</h1>
      {results.map((result) => (
        <ResultSummary key={result._id} result={result} />
      ))}
    </div>
  );
}`,

  // Quiz pages
  'app/quiz/[quizId]/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuizInstructions from '@/components/candidate/QuizInstructions';
import { useSession } from 'next-auth/react';
import type { Quiz } from '@/types';

export default function QuizLandingPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchQuiz();
  }, [quizId, session, router]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(\`/api/quizzes/\${quizId}\`);
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!quiz) return <div className="text-center py-8">Quiz not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <QuizInstructions quiz={quiz} />
    </div>
  );
}`,

  'app/quiz/[quizId]/attempt/page.tsx': `'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuizAttemptComponent from '@/components/candidate/QuizAttempt';
import Timer from '@/components/candidate/Timer';
import TabSwitchWarning from '@/components/candidate/TabSwitchWarning';
import toast from 'react-hot-toast';
import type { Quiz } from '@/types';

export default function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchQuiz();
  }, [quizId, session, router]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(\`/api/quizzes/\${quizId}\`);
      const data: Quiz = await response.json();
      setQuiz(data);
      setTimeRemaining(data.duration * 60);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const handleAnswerSelect = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = useCallback(async (autoSubmit: boolean = false) => {
    if (!quiz) return;

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers,
          timeTaken: (quiz.duration * 60) - timeRemaining,
        }),
      });

      if (response.ok) {
        if (autoSubmit) {
          toast.error('Quiz auto-submitted due to tab switching');
        } else {
          toast.success('Quiz submitted successfully!');
        }
        router.push('/candidate/dashboard');
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  }, [quizId, answers, timeRemaining, quiz, router]);

  const handleTimeUp = useCallback(() => {
    toast.error('Time is up! Your answers have been submitted.');
    handleSubmit(true);
  }, [handleSubmit]);

  const handleTabSwitch = useCallback(() => {
    if (tabSwitchCount === 0) {
      setShowWarning(true);
      setTabSwitchCount(1);
    } else if (tabSwitchCount >= 1) {
      handleSubmit(true);
    }
  }, [tabSwitchCount, handleSubmit]);

  if (!quiz) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <Timer 
        timeRemaining={timeRemaining}
        onTimeUp={handleTimeUp}
        setTimeRemaining={setTimeRemaining}
      />
      
      <QuizAttemptComponent
        quiz={quiz}
        answers={answers}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={() => handleSubmit(false)}
      />

      {showWarning && (
        <TabSwitchWarning 
          onClose={() => setShowWarning(false)}
        />
      )}

      <TabSwitchHandler onTabSwitch={handleTabSwitch} />
    </div>
  );
}

function TabSwitchHandler({ onTabSwitch }: { onTabSwitch: () => void }) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onTabSwitch]);

  return null;
}`,

  // API Routes
  'app/api/auth/login/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, photoURL } = await request.json();
    
    await connectDB();
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        role,
        photoURL,
      });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

  'app/api/auth/me/route.ts': `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user?.email });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

  'app/api/quizzes/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Quiz from '@/lib/models/Quiz';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const quizzes = await Quiz.find({ organizerId: user._id });
    
    return NextResponse.json(quizzes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const data = await request.json();
    
    const quiz = await Quiz.create({
      ...data,
      organizerId: user._id,
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { quizesCreatedIds: quiz._id }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

  'app/api/quizzes/[quizId]/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Quiz from '@/lib/models/Quiz';

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectDB();
    const quiz = await Quiz.findById(params.quizId);
    
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    
    return NextResponse.json(quiz);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectDB();
    const data = await request.json();
    
    const quiz = await Quiz.findByIdAndUpdate(
      params.quizId,
      data,
      { new: true }
    );
    
    return NextResponse.json(quiz);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectDB();
    await Quiz.findByIdAndDelete(params.quizId);
    
    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

  'app/api/quizzes/[quizId]/results/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Result from '@/lib/models/Result';

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectDB();
    const results = await Result.find({ quizId: params.quizId })
      .populate('studentId', 'name email');
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

  'app/api/results/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Result from '@/lib/models/Result';
import User from '@/lib/models/User';
import Quiz from '@/lib/models/Quiz';

export async function GET() {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const results = await Result.find({ studentId: user._id })
      .populate('quizId', 'title');
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const { quizId, answers, timeTaken } = await request.json();
    
    const quiz = await Quiz.findById(quizId);
    
    let score = 0;
    const answerResults = [];
    
    for (const question of quiz.questions) {
      const selectedOption = answers[question.questionId];
      const isCorrect = selectedOption === question.correctAnswer;
      
      if (isCorrect) {
        score += quiz.eachMarks;
      } else if (quiz.negativeMarking && selectedOption) {
        score -= quiz.negativeMarks;
      }
      
      answerResults.push({
        questionId: question.questionId,
        selectedOption,
      });
    }
    
    const result = await Result.create({
      quizId,
      studentId: user._id,
      score: Math.max(0, score),
      answers: answerResults,
      timeTaken,
    });
    
    await User.findByIdAndUpdate(user._id, {
      $push: { 
        quizesAttemptedIds: quizId,
        resultIds: result._id
      }
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,

  'app/api/ai/generate-mcqs/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic, numberOfQuestions = 10 } = await request.json();
    
    const prompt = \`Generate \${numberOfQuestions} multiple choice questions about "\${topic}". 
    For each question, provide 4 options (A, B, C, D) and indicate the correct answer.
    Format the response as a JSON array where each question has:
    {
      "questionId": number,
      "question": "the question text",
      "options": {
        "A": "option A",
        "B": "option B",
        "C": "option C",
        "D": "option D"
      },
      "correctAnswer": "A/B/C/D"
    }\`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content || '';
    const questions = JSON.parse(generatedText);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error generating MCQs:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' }, 
      { status: 500 }
    );
  }
}`,

  // Components
  'components/common/Navbar.tsx': `'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            QuizApp
          </Link>
          
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link 
                  href={session.user?.role === 'organizer' ? '/organizer/dashboard' : '/candidate/dashboard'}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}`,

  'components/common/ProtectedRoute.tsx': `'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'candidate' | 'organizer';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session && role && session.user?.role !== role) {
      router.push('/');
    }
  }, [session, status, role, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session || (role && session.user?.role !== role)) {
    return null;
  }

  return <>{children}</>;
}`,

  'components/common/Modal.tsx': `'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}`,

  'components/auth/GoogleLoginBtn.tsx': `'use client';
import { signIn } from 'next-auth/react';

interface GoogleLoginBtnProps {
  role: 'candidate' | 'organizer';
}

export default function GoogleLoginBtn({ role }: GoogleLoginBtnProps) {
  const handleLogin = () => {
    signIn('google', { 
      callbackUrl: role === 'organizer' ? '/organizer/dashboard' : '/candidate/dashboard'
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}`,

  'components/auth/RoleSelector.tsx': `'use client';

interface RoleSelectorProps {
  selectedRole: 'candidate' | 'organizer' | null;
  onRoleChange: (role: 'candidate' | 'organizer') => void;
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => onRoleChange('candidate')}
        className={\`px-6 py-3 rounded-lg border-2 transition-all \${
          selectedRole === 'candidate'
            ? 'border-blue-600 bg-blue-50 text-blue-600'
            : 'border-gray-300 hover:border-blue-400'
        }\`}
      >
        Candidate
      </button>
      <button
        onClick={() => onRoleChange('organizer')}
        className={\`px-6 py-3 rounded-lg border-2 transition-all \${
          selectedRole === 'organizer'
            ? 'border-blue-600 bg-blue-50 text-blue-600'
            : 'border-gray-300 hover:border-blue-400'
        }\`}
      >
        Organizer
      </button>
    </div>
  );
}`,

  'components/organizer/QuizGenerator.tsx': `'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Question } from '@/types';

interface QuizGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void;
}

export default function QuizGenerator({ onQuestionsGenerated }: QuizGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, numberOfQuestions }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Questions generated successfully!');
        onQuestionsGenerated(data.questions);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to generate questions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Generate MCQs with AI</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Topic or Paragraph</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Enter the topic or paste a paragraph to generate questions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Questions
          </label>
          <input
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
            min="1"
            max="50"
            className="input-field w-32"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>
    </div>
  );
}`,

  'components/organizer/MCQEditor.tsx': `'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Question } from '@/types';

interface MCQEditorProps {
  questions: Question[];
  onQuestionsEdited: (questions: Question[]) => void;
}

export default function MCQEditor({ questions: initialQuestions, onQuestionsEdited }: MCQEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (index: number, option: 'A' | 'B' | 'C' | 'D', value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      options: {
        ...updatedQuestions[index].options,
        [option]: value
      }
    };
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    onQuestionsEdited(questions);
    toast.success('Questions saved!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Edit Questions</h2>
        <button onClick={handleSave} className="btn-primary">
          Save & Continue
        </button>
      </div>

      <div className="space-y-8">
        {questions.map((question, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">Question {index + 1}</h3>
              <button
                onClick={() => handleDeleteQuestion(index)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <input
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              className="input-field mb-4"
              placeholder="Enter question"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    Option {key}
                  </label>
                  <input
                    value={value}
                    onChange={(e) => handleOptionChange(index, key as 'A' | 'B' | 'C' | 'D', e.target.value)}
                    className="input-field"
                    placeholder={\`Option \${key}\`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Correct Answer
              </label>
              <select
                value={question.correctAnswer}
                onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                className="input-field w-32"
              >
                <option value="">Select</option>
                {Object.keys(question.options).map((key) => (
                  <option key={key} value={key}>Option {key}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'components/organizer/QuizForm.tsx': `'use client';
import { useState } from 'react';
import type { Question, QuizFormData } from '@/types';

interface QuizFormProps {
  quizData: {
    questions: Question[];
  };
  onSave: (formData: QuizFormData) => void;
}

export default function QuizForm({ quizData, onSave }: QuizFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    eachMarks: 2,
    negativeMarking: false,
    negativeMarks: 0.5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalMarks = quizData.questions.length * formData.eachMarks;
    
    onSave({
      ...formData,
      totalMarks,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Quiz Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Marks per Question
            </label>
            <input
              type="number"
              value={formData.eachMarks}
              onChange={(e) => setFormData({ ...formData, eachMarks: Number(e.target.value) })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              checked={formData.negativeMarking}
              onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Enable Negative Marking</label>
          </div>

          {formData.negativeMarking && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Negative Marks per Wrong Answer
              </label>
              <input
                type="number"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                className="input-field w-32"
                step="0.1"
              />
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Quiz Summary</h3>
          <p>Total Questions: {quizData.questions.length}</p>
          <p>Total Marks: {quizData.questions.length * formData.eachMarks}</p>
          <p>Duration: {formData.duration} minutes</p>
        </div>

        <button type="submit" className="btn-primary w-full">
          Save Quiz
        </button>
      </form>
    </div>
  );
}`,

  'components/organizer/QuizCard.tsx': `'use client';
import Link from 'next/link';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const quizUrl = \`\${process.env.NEXT_PUBLIC_APP_URL}/quiz/\${quiz._id}\`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
      
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <p>Questions: {quiz.questions.length}</p>
        <p>Total Marks: {quiz.totalMarks}</p>
        <p>Duration: {quiz.duration} min</p>
        {quiz.negativeMarking && <p>Negative Marking: Yes</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Link 
            href={\`/organizer/edit-quiz/\${quiz._id}\`}
            className="flex-1 text-center btn-secondary text-sm"
          >
            Edit
          </Link>
          <Link 
            href={\`/organizer/results/\${quiz._id}\`}
            className="flex-1 text-center btn-primary text-sm"
          >
            Results
          </Link>
        </div>
        <input
          type="text"
          value={quizUrl}
          readOnly
          className="input-field text-xs cursor-pointer"
          onClick={(e) => {
            (e.target as HTMLInputElement).select();
            navigator.clipboard.writeText(quizUrl);
          }}
          title="Click to copy quiz link"
        />
      </div>
    </div>
  );
}`,

  'components/organizer/ResultsTable.tsx': `'use client';
import type { Result, Quiz } from '@/types';

interface ResultsTableProps {
  results: Result[];
  quiz: Quiz;
}

export default function ResultsTable({ results, quiz }: ResultsTableProps) {
  if (!results.length) {
    return <div className="text-center py-8 text-gray-500">No results yet</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Marks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Percentage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Time Taken
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result) => {
            const studentName = typeof result.studentId === 'object' && result.studentId 
              ? (result.studentId as any).name || 'Unknown'
              : 'Unknown';
            
            return (
              <tr key={result._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{result.score}</td>
                <td className="px-6 py-4 whitespace-nowrap">{quiz.totalMarks}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {((result.score / quiz.totalMarks) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(result.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}`,

  'components/candidate/QuizInstructions.tsx': `'use client';
import { useRouter } from 'next/navigation';
import type { Quiz } from '@/types';

interface QuizInstructionsProps {
  quiz: Quiz;
}

export default function QuizInstructions({ quiz }: QuizInstructionsProps) {
  const router = useRouter();

  const handleProceed = () => {
    router.push(\`/quiz/\${quiz._id}/attempt\`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Instructions</h2>
        <ul className="space-y-2 text-blue-700">
          <li>✓ Total Questions: {quiz.questions.length}</li>
          <li>✓ Total Marks: {quiz.totalMarks}</li>
          <li>✓ Marks per Question: {quiz.eachMarks}</li>
          <li>✓ Duration: {quiz.duration} minutes</li>
          {quiz.negativeMarking && (
            <li>✓ Negative Marking: {quiz.negativeMarks} marks per wrong answer</li>
          )}
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
        <ul className="space-y-1 text-yellow-700">
          <li>• Read each question carefully before answering</li>
          <li>• You cannot go back to previous questions</li>
          <li>• Do not switch tabs or windows during the quiz</li>
          <li>• Switching tabs twice will auto-submit your quiz</li>
          <li>• The quiz will auto-submit when time runs out</li>
        </ul>
      </div>

      <button onClick={handleProceed} className="btn-primary w-full text-lg py-4">
        Proceed to Quiz
      </button>
      
      <p className="text-center text-gray-500 mt-4">Best of luck! 🍀</p>
    </div>
  );
}`,

  'components/candidate/QuizAttempt.tsx': `'use client';
import { useState } from 'react';
import type { Quiz } from '@/types';

interface QuizAttemptProps {
  quiz: Quiz;
  answers: Record<number, string>;
  onAnswerSelect: (questionId: number, option: string) => void;
  onSubmit: () => void;
}

export default function QuizAttemptComponent({ quiz, answers, onAnswerSelect, onSubmit }: QuizAttemptProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const question = quiz.questions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: \`\${((currentQuestion + 1) / quiz.questions.length) * 100}%\` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
              <label
                key={key}
                className={\`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all \${
                  answers[question.questionId] === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }\`}
              >
                <input
                  type="radio"
                  name={\`question-\${question.questionId}\`}
                  value={key}
                  checked={answers[question.questionId] === key}
                  onChange={() => onAnswerSelect(question.questionId, key)}
                  className="mr-3"
                />
                <span className="font-medium mr-2">{key}.</span>
                <span>{value}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={onSubmit}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                Submit Quiz
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Questions Overview</h3>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((q, index) => (
            <button
              key={q.questionId}
              onClick={() => setCurrentQuestion(index)}
              className={\`p-2 rounded text-sm font-medium \${
                answers[q.questionId]
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              } \${currentQuestion === index ? 'ring-2 ring-blue-600' : ''}\`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  'components/candidate/Timer.tsx': `'use client';
import { useEffect } from 'react';

interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
}

export default function Timer({ timeRemaining, onTimeUp, setTimeRemaining }: TimerProps) {
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp, setTimeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 300;

  return (
    <div className={\`fixed top-16 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border-2 \${
      isLowTime ? 'border-red-500 animate-pulse' : 'border-gray-200'
    }\`}>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
        <p className={\`text-2xl font-bold \${
          isLowTime ? 'text-red-600' : 'text-gray-800'
        }\`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}`,

  'components/candidate/TabSwitchWarning.tsx': `'use client';
import Modal from '@/components/common/Modal';

interface TabSwitchWarningProps {
  onClose: () => void;
}

export default function TabSwitchWarning({ onClose }: TabSwitchWarningProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="⚠️ Warning">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          Tab Switch Detected!
        </h3>
        <p className="text-gray-600 mb-6">
          Switching tabs or windows during the quiz is not allowed. 
          If you switch tabs again, your quiz will be automatically submitted.
        </p>
        <button onClick={onClose} className="btn-primary">
          I Understand
        </button>
      </div>
    </Modal>
  );
}`,

  'components/candidate/ResultSummary.tsx': `'use client';
import type { Result, Quiz } from '@/types';

interface ResultSummaryProps {
  result: Result;
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const quizTitle = typeof result.quizId === 'object' && result.quizId 
    ? (result.quizId as Quiz).title || 'Quiz'
    : 'Quiz';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">{quizTitle}</h3>
          <p className="text-gray-600 mb-4">
            Submitted: {new Date(result.submittedAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{result.score}</p>
          <p className="text-sm text-gray-500">Score</p>
        </div>
      </div>
      
      <div className="flex gap-2 text-sm text-gray-500">
        <span>Time: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</span>
      </div>
    </div>
  );
}`,

  // Hooks
  'hooks/useAuth.ts': `'use client';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}`,

  'hooks/useQuiz.ts': `'use client';
import { useState, useEffect } from 'react';
import type { Quiz } from '@/types';

export function useQuiz(quizId: string | undefined) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        const response = await fetch(\`/api/quizzes/\${quizId}\`);
        const data = await response.json();
        
        if (response.ok) {
          setQuiz(data);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  return { quiz, loading, error };
}`,

  'hooks/useTimer.ts': `'use client';
import { useState, useEffect, useCallback } from 'react';

export function useTimer(initialTime: number, onTimeUp?: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) {
      if (timeRemaining <= 0) {
        onTimeUp?.();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, onTimeUp]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return {
    timeRemaining,
    minutes,
    seconds,
    isRunning,
    pause,
    resume,
    setTimeRemaining
  };
}`,

  'hooks/useTabSwitch.ts': `'use client';
import { useEffect, useCallback } from 'react';

export function useTabSwitch(onTabSwitch?: () => void) {
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      onTabSwitch?.();
    }
  }, [onTabSwitch]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
}`,

  // Context
  'context/AuthContext.tsx': `'use client';
import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}`,

  // Lib files
  'lib/mongodb.ts': `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}`,

  'lib/groq.ts': `import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});`,

  'lib/models/User.ts': `import mongoose, { Document, Model } from 'mongoose';

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

export default User;`,

  'lib/models/Quiz.ts': `import mongoose, { Document, Model } from 'mongoose';

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

export default Quiz;`,

  'lib/models/Result.ts': `import mongoose, { Document, Model } from 'mongoose';

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

export default Result;`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
};

// Function to create directories and files
function createProjectStructure() {
  console.log('Creating Quiz App project structure (TypeScript)...\n');

  // Create directories and files
  Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(BASE_DIR, filePath);
    
    // Create parent directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${path.relative(BASE_DIR, dir)}`);
    }

    // Write file
    fs.writeFileSync(fullPath, content.trim() + '\n');
    console.log(`📄 Created: ${filePath}`);
  });

  console.log('\n✅ TypeScript project structure created successfully!');
  console.log('\nNext steps:');
  console.log('1. npm install (if not already done)');
  console.log('2. Update .env.local with your credentials');
  console.log('3. npm run dev');
}

// Run the script
createProjectStructure();