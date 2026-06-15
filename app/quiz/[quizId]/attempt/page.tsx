'use client';
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
      const response = await fetch(`/api/quizzes/${quizId}`);
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
}
