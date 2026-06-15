'use client';
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
}
