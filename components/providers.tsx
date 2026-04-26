'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ModalRoot } from '@/components/modals/modal-root';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ModalRoot />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-ink)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
          },
        }}
      />
    </QueryClientProvider>
  );
}
