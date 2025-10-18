"use client"

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getAuthStatus } from './actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function Page() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const {data, isLoading, isError} = useQuery({
        queryKey: ['auth-callback'],
        queryFn: async () => getAuthStatus(),
        retry: true,
        retryDelay: 500,
    });

    useEffect(() => {
        const handleRedirect = async () => {
            if (isRedirecting || !data?.success) return;
            setIsRedirecting(true);

            try {
                const configurationId = localStorage.getItem('configurationId');
                const savedConfiguration = localStorage.getItem('savedConfiguration');

                console.log('Stored Configuration ID:', configurationId);
                console.log('Saved Configuration:', savedConfiguration ? JSON.parse(savedConfiguration) : null);

                if (configurationId && savedConfiguration) {
                    // Clear localStorage before redirect
                    localStorage.removeItem('configurationId');
                    localStorage.removeItem('savedConfiguration');
                    
                    console.log('Redirecting to configuration:', configurationId);
                    router.push(`/configure/preview?id=${configurationId}`);
                } else {
                    console.log('No saved configuration, redirecting to home');
                    router.push('/');
                }
            } catch (error) {
                console.error('Redirect error:', error);
                toast.error('Something went wrong', {
                    description: 'Failed to restore your configuration. Please try again.',
                });
                router.push('/');
            }
        };

        if (data?.success && !isLoading && !isError) {
            handleRedirect();
        }
    }, [data?.success, isLoading, isError, router, isRedirecting]);


  if (isError) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <h3 className='font-semibold text-xl text-red-500'>Authentication Error</h3>
          <p>Please try logging in again.</p>
          <button 
            onClick={() => router.push('/')}
            className='mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800'
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
        <h3 className='font-semibold text-xl'>
          {isRedirecting ? 'Restoring your configuration...' : 'Logging you in...'}
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page