'use client';

interface RoleSelectorProps {
  selectedRole: 'candidate' | 'organizer' | null;
  onRoleChange: (role: 'candidate' | 'organizer') => void;
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => onRoleChange('candidate')}
        className={`px-6 py-3 rounded-lg border-2 transition-all ${
          selectedRole === 'candidate'
            ? 'border-blue-600 bg-blue-50 text-blue-600'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        Candidate
      </button>
      <button
        onClick={() => onRoleChange('organizer')}
        className={`px-6 py-3 rounded-lg border-2 transition-all ${
          selectedRole === 'organizer'
            ? 'border-blue-600 bg-blue-50 text-blue-600'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        Organizer
      </button>
    </div>
  );
}
