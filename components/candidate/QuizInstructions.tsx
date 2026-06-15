'use client';
import { useRouter } from 'next/navigation';
import type { Quiz } from '@/types';

interface QuizInstructionsProps {
  quiz: Quiz;
}

export default function QuizInstructions({ quiz }: QuizInstructionsProps) {
  const router = useRouter();

  const handleProceed = () => {
    router.push(`/quiz/${quiz._id}/attempt`);
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
}
