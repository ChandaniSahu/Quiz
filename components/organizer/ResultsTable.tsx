'use client';
import type { Result, Quiz } from '@/types';

interface ResultsTableProps {
  results: Result[];
  quiz: Quiz;
}

export default function ResultsTable({ results, quiz }: ResultsTableProps) {
  if (!results.length) {
    return <div className="text-center py-8 text-gray-500">No results yet</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Marks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Percentage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Time Taken
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result) => {
            const studentName = typeof result.studentId === 'object' && result.studentId 
              ? (result.studentId as any).name || 'Unknown'
              : 'Unknown';
            
            return (
              <tr key={result._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{result.score}</td>
                <td className="px-6 py-4 whitespace-nowrap">{quiz.totalMarks}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {((result.score / quiz.totalMarks) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(result.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
