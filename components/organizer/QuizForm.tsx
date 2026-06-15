'use client';
import { useState } from 'react';
import type { Question, QuizFormData } from '@/types';

interface QuizFormProps {
  quizData: {
    questions: Question[];
  };
  onSave: (formData: QuizFormData) => void;
}

export default function QuizForm({ quizData, onSave }: QuizFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    eachMarks: 2,
    negativeMarking: false,
    negativeMarks: 0.5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalMarks = quizData.questions.length * formData.eachMarks;
    
    onSave({
      ...formData,
      totalMarks,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Quiz Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Marks per Question
            </label>
            <input
              type="number"
              value={formData.eachMarks}
              onChange={(e) => setFormData({ ...formData, eachMarks: Number(e.target.value) })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              checked={formData.negativeMarking}
              onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Enable Negative Marking</label>
          </div>

          {formData.negativeMarking && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Negative Marks per Wrong Answer
              </label>
              <input
                type="number"
                value={formData.negativeMarks}
                onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                className="input-field w-32"
                step="0.1"
              />
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Quiz Summary</h3>
          <p>Total Questions: {quizData.questions.length}</p>
          <p>Total Marks: {quizData.questions.length * formData.eachMarks}</p>
          <p>Duration: {formData.duration} minutes</p>
        </div>

        <button type="submit" className="btn-primary w-full">
          Save Quiz
        </button>
      </form>
    </div>
  );
}
