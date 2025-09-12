"use client";

import React, { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to the console for debugging
    // eslint-disable-next-line no-console
    console.error("Passport page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">Application error</h1>
      <p className="text-gray-300 mb-4">A client-side exception occurred while loading this page.</p>
      {error?.message && (
        <p className="text-xs text-gray-500 max-w-xl break-all mb-4">{error.message}</p>
      )}
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold"
      >
        Reload page
      </button>
    </div>
  );
}


