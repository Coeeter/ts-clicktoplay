import { prisma } from '@/lib/database';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';

const handler = NextAuth({
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: PrismaAdapter(prisma),
});

export { handler as GET, handler as POST };
