import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute role="organizer">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </ProtectedRoute>
  );
}
