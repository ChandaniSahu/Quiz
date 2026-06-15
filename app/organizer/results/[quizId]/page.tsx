'use client';
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
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/results`)
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
}
