"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-[#09141A] via-[#0D1D23] to-[#1F4247] text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to YouApp</h1>
      <button
        onClick={handleGetStarted}
        className="px-6 py-2 bg-gradient-to-r from-[#4ad9ca] to-[#4a90e2] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all h-12 text-lg"
      >
        Get Started
      </button>
    </div>
  );
}