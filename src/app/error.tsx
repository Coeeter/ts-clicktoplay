'use client';

import { MdErrorOutline } from 'react-icons/md';

export function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-6 max-w-3xl mx-auto">
      <MdErrorOutline className="text-6xl text-slate-200" />
      <h1 className="text-4xl text-slate-200 font-bold">
        Something went wrong
      </h1>
      <p className="text-slate-300">Try reloading the page</p>
      <button
        onClick={reset}
        className="px-6 py-3 hover:scale-110 rounded-full bg-blue-700 transition text-slate-200 -mt-3"
      >
        Reload Page
      </button>
    </div>
  );
}

export default ErrorPage;
