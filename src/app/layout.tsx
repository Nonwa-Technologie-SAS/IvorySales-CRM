import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: {
    default: 'CRM Neumorphism Dashboard',
    template: '%s | CRM',
  },
  description:
    'CRM commercial fullstack avec Next.js et design premium. Gérez vos leads, produits, services et clients.',
  keywords: ['CRM', 'prospects', 'leads', 'ventes', 'Next.js', 'dashboard'],
  authors: [{ name: 'CRM' }],
  creator: 'CRM',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'CRM Neumorphism',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr'>
      <body className='min-h-screen bg-bgGray text-primary'>
        {/* <Navbar /> */}
        <div className='md:pt-0'>{children}</div>
      </body>
    </html>
  );
}
