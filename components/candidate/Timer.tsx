'use client';
import { useEffect } from 'react';

interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
}

export default function Timer({ timeRemaining, onTimeUp, setTimeRemaining }: TimerProps) {
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp, setTimeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 300;

  return (
    <div className={`fixed top-16 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border-2 ${
      isLowTime ? 'border-red-500 animate-pulse' : 'border-gray-200'
    }`}>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
        <p className={`text-2xl font-bold ${
          isLowTime ? 'text-red-600' : 'text-gray-800'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}
