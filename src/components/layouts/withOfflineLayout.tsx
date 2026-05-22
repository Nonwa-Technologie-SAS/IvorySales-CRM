'use client';

import type { ComponentType, FC } from 'react';
import { use } from 'react';
import NeumoCard from '@/components/NeumoCard';
import type {
  NextPageDynamicProps,
  ResolvedPageDynamicProps,
} from '@/components/layouts/withDashboardLayout';

function unwrapPageProps(
  props: NextPageDynamicProps,
): ResolvedPageDynamicProps {
  const { params, searchParams } = props;
  return {
    params: params ? use(params) : undefined,
    searchParams: searchParams ? use(searchParams) : undefined,
  };
}

// HOC pour les pages "offline" (auth, reset, etc.) sans sidebar/dashboard
export function withOfflineLayout<P extends object>(
  PageComponent: ComponentType<P>,
) {
  const Wrapped: FC<P & NextPageDynamicProps> = (props) => {
    const { params, searchParams, ...rest } = props;
    const resolved = unwrapPageProps({ params, searchParams });

    const pageProps = {
      ...(rest as P),
      ...(resolved.params ? { params: resolved.params } : {}),
      ...(resolved.searchParams
        ? { searchParams: resolved.searchParams }
        : {}),
    } as P;

    return (
      <div className='min-h-screen flex items-center justify-center bg-bgGray px-4'>
        <div className='w-full max-w-md'>
          <NeumoCard className='p-6 bg-white shadow-neu-soft'>
            <PageComponent {...pageProps} />
          </NeumoCard>
        </div>
      </div>
    );
  };

  Wrapped.displayName = `WithOfflineLayout(${
    PageComponent.displayName || PageComponent.name || 'Component'
  })`;

  return Wrapped;
}
