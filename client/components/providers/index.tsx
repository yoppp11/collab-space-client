'use client';

import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from './query-provider';
import { I18nProvider } from './i18n-provider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </I18nProvider>
  );
}
