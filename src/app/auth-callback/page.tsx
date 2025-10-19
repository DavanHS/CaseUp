'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAuthStatus } from './actions';

export default function AuthCallbackPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['auth-callback'],
    queryFn: async () => await getAuthStatus(),
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data?.success) {
      // Get configId from localStorage
      const configurationId = localStorage.getItem('configurationId');
      
      // Use setTimeout to defer navigation
      const timer = setTimeout(() => {
        if (configurationId) {
          localStorage.removeItem('configurationId');
          router.push(`/configure/preview?id=${configurationId}`);
        } else {
          router.push('/');
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [data, router]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-semibold">Redirecting...</h1>
          <p className="text-sm text-zinc-600">Please wait while we set up your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-semibold">Setting up your account...</h1>
      </div>
    </div>
  );
}