'use client';

import DashboardShell from '@/components/layouts/DashboardShell';
import type { ComponentType, FC } from 'react';
import { use } from 'react';

/** Props dynamiques injectées par Next.js 15+ sur chaque page. */
export type NextPageDynamicProps = {
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export type ResolvedPageDynamicProps = {
  params?: Record<string, string | string[]>;
  searchParams?: Record<string, string | string[] | undefined>;
};

function unwrapPageProps(
  props: NextPageDynamicProps,
): ResolvedPageDynamicProps {
  const { params, searchParams } = props;
  return {
    params: params ? use(params) : undefined,
    searchParams: searchParams ? use(searchParams) : undefined,
  };
}

export function withDashboardLayout<P extends object>(
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
      <DashboardShell>
        <PageComponent {...pageProps} />
      </DashboardShell>
    );
  };

  Wrapped.displayName = `WithDashboardLayout(${
    PageComponent.displayName || PageComponent.name || 'Component'
  })`;

  return Wrapped;
}
