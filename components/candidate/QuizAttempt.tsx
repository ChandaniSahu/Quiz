'use client';
import { useState } from 'react';
import type { Quiz } from '@/types';

interface QuizAttemptProps {
  quiz: Quiz;
  answers: Record<number, string>;
  onAnswerSelect: (questionId: number, option: string) => void;
  onSubmit: () => void;
}

export default function QuizAttemptComponent({ quiz, answers, onAnswerSelect, onSubmit }: QuizAttemptProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const question = quiz.questions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answers[question.questionId] === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.questionId}`}
                  value={key}
                  checked={answers[question.questionId] === key}
                  onChange={() => onAnswerSelect(question.questionId, key)}
                  className="mr-3"
                />
                <span className="font-medium mr-2">{key}.</span>
                <span>{value}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={onSubmit}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                Submit Quiz
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Questions Overview</h3>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((q, index) => (
            <button
              key={q.questionId}
              onClick={() => setCurrentQuestion(index)}
              className={`p-2 rounded text-sm font-medium ${
                answers[q.questionId]
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              } ${currentQuestion === index ? 'ring-2 ring-blue-600' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
