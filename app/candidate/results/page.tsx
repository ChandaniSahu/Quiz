'use client';
import { useState, useEffect } from 'react';
import ResultSummary from '@/components/candidate/ResultSummary';
import type { Result } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Results</h1>
      {results.map((result) => (
        <ResultSummary key={result._id} result={result} />
      ))}
    </div>
  );
}
