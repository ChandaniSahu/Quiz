'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Question } from '@/types';

interface QuizGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void;
}

export default function QuizGenerator({ onQuestionsGenerated }: QuizGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, numberOfQuestions }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Questions generated successfully!');
        onQuestionsGenerated(data.questions);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to generate questions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Generate MCQs with AI</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Topic or Paragraph</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Enter the topic or paste a paragraph to generate questions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Questions
          </label>
          <input
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
            min="1"
            max="50"
            className="input-field w-32"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>
    </div>
  );
}
