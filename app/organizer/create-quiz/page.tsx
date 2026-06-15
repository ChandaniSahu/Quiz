'use client';
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
        <div className={`flex-1 h-2 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
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
}
