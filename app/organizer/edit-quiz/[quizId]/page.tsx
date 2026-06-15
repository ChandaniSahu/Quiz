'use client';
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
      const response = await fetch(`/api/quizzes/${quizId}`);
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
      const response = await fetch(`/api/quizzes/${quizId}`, {
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
}
