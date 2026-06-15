'use client';
import Link from 'next/link';
import type { Quiz } from '@/types';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const quizUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quiz/${quiz._id}`;

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
            href={`/organizer/edit-quiz/${quiz._id}`}
            className="flex-1 text-center btn-secondary text-sm"
          >
            Edit
          </Link>
          <Link 
            href={`/organizer/results/${quiz._id}`}
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
}
