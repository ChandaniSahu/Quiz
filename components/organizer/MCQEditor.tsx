'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Question } from '@/types';

interface MCQEditorProps {
  questions: Question[];
  onQuestionsEdited: (questions: Question[]) => void;
}

export default function MCQEditor({ questions: initialQuestions, onQuestionsEdited }: MCQEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (index: number, option: 'A' | 'B' | 'C' | 'D', value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      options: {
        ...updatedQuestions[index].options,
        [option]: value
      }
    };
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    onQuestionsEdited(questions);
    toast.success('Questions saved!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Edit Questions</h2>
        <button onClick={handleSave} className="btn-primary">
          Save & Continue
        </button>
      </div>

      <div className="space-y-8">
        {questions.map((question, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">Question {index + 1}</h3>
              <button
                onClick={() => handleDeleteQuestion(index)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <input
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              className="input-field mb-4"
              placeholder="Enter question"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    Option {key}
                  </label>
                  <input
                    value={value}
                    onChange={(e) => handleOptionChange(index, key as 'A' | 'B' | 'C' | 'D', e.target.value)}
                    className="input-field"
                    placeholder={`Option ${key}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Correct Answer
              </label>
              <select
                value={question.correctAnswer}
                onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                className="input-field w-32"
              >
                <option value="">Select</option>
                {Object.keys(question.options).map((key) => (
                  <option key={key} value={key}>Option {key}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
