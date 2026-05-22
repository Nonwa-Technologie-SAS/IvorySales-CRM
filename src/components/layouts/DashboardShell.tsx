'use client';

import MobileBottomNav from '@/components/MobileBottomNav';
import MobileHeader, { MOBILE_HEADER_OFFSET } from '@/components/MobileHeader';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import type { ReactNode } from 'react';

/** Padding bas sur mobile pour ne pas masquer le contenu sous la barre d’onglets. */
export const MOBILE_BOTTOM_NAV_PADDING =
  'pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0';

type DashboardShellProps = {
  children: ReactNode;
  /** Masquer le pied de page (ex. pages très longues). */
  hideFooter?: boolean;
};

export default function DashboardShell({
  children,
  hideFooter = false,
}: DashboardShellProps) {
  return (
    <div className='min-h-screen flex flex-col sm:flex-row bg-bgGray'>
      <Sidebar />
      <MobileHeader />

      <main
        className={`flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-3 sm:py-4 md:py-8 gap-4 w-full ${MOBILE_HEADER_OFFSET} ${MOBILE_BOTTOM_NAV_PADDING}`}
      >
        <Navbar />
        {children}
        {!hideFooter && (
          <footer className='mt-2 text-center text-[11px] text-gray-400 sm:mb-0 mb-1'>
            © 2026 by Appatam
          </footer>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
