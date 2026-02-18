'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, Package, Settings, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

// Les groupes de routes entre parenthèses (ex: (dashboard)) ne font pas partie de l'URL publique.
// On navigue donc vers /, /stats, /clients, /users, etc.
export const sidebarItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: Package, label: 'Produits et services', href: '/products-services' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: Users, label: 'Utilisateurs', href: '/users' },
  { icon: Settings, label: 'Paramètres', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    if (href && href !== pathname) {
      router.push(href);
    }
  };

  return (
    <aside className='hidden sm:flex flex-col justify-between py-6 px-3 w-16 bg-transparent'>
      <div className='flex flex-col items-center gap-6'>
        <button
          type='button'
          onClick={() => handleNavigate('/')}
          className='w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-neu flex items-center justify-center text-white text-lg font-bold'
        >
          C
        </button>
        <nav className='flex flex-col items-center gap-4'>
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div
                key={item.label}
                className='group relative flex items-center justify-center'
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  type='button'
                  onClick={() => handleNavigate(item.href)}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-neu'
                      : 'bg-bgGray text-gray-500 shadow-neu hover:text-primary'
                  }`}
                  aria-label={item.label}
                >
                  <item.icon className='w-4 h-4' />
                </motion.button>
                <span
                  className='pointer-events-none absolute left-full ml-3 z-50 px-2.5 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium whitespace-nowrap opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100'
                  role='tooltip'
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
