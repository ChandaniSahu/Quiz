'use client';
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
}
