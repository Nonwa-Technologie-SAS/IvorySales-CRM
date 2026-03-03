'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar, { getSidebarItemsForRole } from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import type { ComponentType, FC } from 'react';

export function withDashboardLayout<P extends object>(
  PageComponent: ComponentType<P>,
) {
  const Wrapped: FC<P> = (props) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const sidebarItems = getSidebarItemsForRole(user?.role ?? null);

    const handleNavigate = (href: string) => {
      if (href && href !== pathname) {
        router.push(href);
      }
    };

    return (
      <div className='min-h-screen flex flex-col sm:flex-row bg-bgGray'>
        {/* Sidebar desktop */}
        <Sidebar />

        <main className='flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full'>
          <Navbar />

          {/* Menu mobile horizontal (visible uniquement sur téléphone) */}
          <nav className='sm:hidden -mt-1 mb-3 flex items-center gap-2 overflow-x-auto'>
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type='button'
                  onClick={() => handleNavigate(item.href)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border bg-white shadow-neu-soft transition-colors ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-primary' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Contenu spécifique à chaque page dashboard */}
          <PageComponent {...props} />
        </main>
      </div>
    );
  };

  Wrapped.displayName = `WithDashboardLayout(${
    PageComponent.displayName || PageComponent.name || 'Component'
  })`;

  return Wrapped;
}
