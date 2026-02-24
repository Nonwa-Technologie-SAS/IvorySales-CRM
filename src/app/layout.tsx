import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

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
    default: 'IvoireLead CRM',
    template: '%s | IvoireLead CRM',
  },
  description:
    'IvoireLead CRM : CRM commercial fullstack moderne pour suivre vos leads, objectifs et ventes.',
  keywords: ['CRM', 'prospects', 'leads', 'ventes', 'Next.js', 'dashboard'],
  authors: [{ name: 'IvoireLead CRM' }],
  creator: 'IvoireLead CRM',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'IvoireLead CRM',
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
    <html lang='fr' className={plusJakarta.variable}>
      <body
        className={`${plusJakarta.className} min-h-screen bg-bgGray text-primary`}
      >
        <AuthProvider>
          {/* <Navbar /> */}
          <div className='md:pt-0'>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
