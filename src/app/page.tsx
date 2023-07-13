'use client';

import { useSession } from 'next-auth/react';

export default function Home() {
  const session = useSession();

  console.log(session)

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold">Hello World</h1>
    </div>
  );
}
