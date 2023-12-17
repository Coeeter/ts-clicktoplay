import {
  AuthOptions,
  Session,
  getServerSession as getSession,
} from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/lib/database';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { env } from './env';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    }),
    EmailProvider({
      server: {
        host: env.emailServerHost,
        port: env.emailServerPort,
        auth: {
          user: env.emailServerUser,
          pass: env.emailServerPassword,
        },
      },
      from: env.emailFrom,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      };
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
};

export type AuthSession = Omit<Session, 'user'> & {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
};

export const getServerSession = () => {
  return getSession(authOptions) as Promise<AuthSession | null>;
};

export type AuthParams = {
  authenticated?: boolean;
  redirectTo?: string;
  userId?: string;
};
