import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If user is already authenticated (has a valid session), don't send them to login page
      if (url.includes('/auth/login')) {
        return baseUrl;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, account }) {
      if (account) {
        // On initial sign in, fetch user role from database
        try {
          const { connectDB } = await import('@/lib/mongodb');
          const User = (await import('@/lib/models/User')).default;
          await connectDB();
          const user = await User.findOne({ email: token.email });
          if (user?.role) {
            token.role = user.role;
          }
        } catch (e) {
          // Role not available yet
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
