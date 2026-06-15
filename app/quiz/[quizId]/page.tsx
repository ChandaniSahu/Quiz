'use client';
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
      const response = await fetch(`/api/quizzes/${quizId}`);
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
}
