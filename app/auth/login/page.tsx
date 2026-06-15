'use client';
import { useState } from 'react';
import GoogleLoginBtn from '@/components/auth/GoogleLoginBtn';
import RoleSelector from '@/components/auth/RoleSelector';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'organizer' | null>(null);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Select Your Role</h3>
          <RoleSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole} 
          />
        </div>

        {selectedRole && (
          <div className="space-y-4">
            <GoogleLoginBtn role={selectedRole} />
          </div>
        )}

        {!selectedRole && (
          <p className="text-gray-500 text-center">Please select a role to continue</p>
        )}
      </div>
    </div>
  );
}
