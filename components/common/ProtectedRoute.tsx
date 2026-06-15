'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'candidate' | 'organizer';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session && role && session.user?.role !== role) {
      router.push('/');
    }
  }, [session, status, role, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session || (role && session.user?.role !== role)) {
    return null;
  }

  return <>{children}</>;
}
