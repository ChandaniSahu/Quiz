import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-5xl font-bold text-center mb-6">
        AI-Powered Quiz Platform
      </h1>
      <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl">
        Create quizzes instantly with AI or test your knowledge with our smart quiz system.
      </p>
      <div className="flex gap-4">
        <Link href="/organizer/dashboard" className="btn-primary">
          Create Quiz
        </Link>
        <Link href="/candidate/dashboard" className="btn-secondary">
          Take Quiz
        </Link>
      </div>
    </div>
  );
}
