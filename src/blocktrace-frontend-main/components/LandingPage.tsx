'use client';

import React from 'react';
import { loginWithInternetIdentity, loginWithPlugWallet } from '@/lib/auth';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-5xl font-bold mb-4">BLOCKTRACE</h1>
      <p className="mb-10 text-lg">Track your product from origin to consumer transparently</p>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={loginWithInternetIdentity}
          className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-lg"
        >
          Login with Internet Identity
        </button>
        
        <button
          onClick={loginWithPlugWallet}
          className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg"
        >
          Login with Plug Wallet
        </button>
      </div>
    </div>
  );
};

export default LandingPage;