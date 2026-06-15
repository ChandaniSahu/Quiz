'use client';
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
}
