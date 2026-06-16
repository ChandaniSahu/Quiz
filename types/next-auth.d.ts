import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role?: 'candidate' | 'organizer';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: 'candidate' | 'organizer';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'candidate' | 'organizer';
  }
}