import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { readRows } from '@/lib/googleSheets';
import { env } from '@/lib/env';

// User cache to reduce Google Sheets API calls
const userCache = new Map<string, { data: Record<string, string>[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedUsers(): Record<string, string>[] | null {
  const cached = userCache.get('users_all');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedUsers(users: Record<string, string>[]) {
  userCache.set('users_all', { data: users, timestamp: Date.now() });
}

export function invalidateUserCache() {
  userCache.delete('users_all');
}

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
    };
  }

  interface User {
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/Japanese/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Use cache to avoid redundant Google Sheets calls
        let users = getCachedUsers();
        if (!users) {
          users = await readRows('Users');
          setCachedUsers(users);
        }

        const match = users.find((user: any) => user.email?.toLowerCase() === String(credentials.email).toLowerCase());

        if (!match || !match.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(String(credentials.password), String(match.passwordHash));
        if (!valid) {
          return null;
        }

        return {
          id: String(match.id || ''),
          email: String(match.email || ''),
          name: String(match.name || match.email || ''),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = String(token.id || '');
        (session.user as any).email = String(token.email || '');
        (session.user as any).name = String(token.name || token.email || '');
      }
      return session;
    },
  },
  secret: env.authSecret,
};
