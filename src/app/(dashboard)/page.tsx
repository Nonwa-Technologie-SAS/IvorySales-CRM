'use client';

import Navbar from '@/components/Navbar';
import NeumoCard from '@/components/NeumoCard';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import {
  ChartPieDonut,
  ChartPieDonutBySource,
} from '@/components/ui/chart-pie-donut';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Lead } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LeadStats {
  total: number;
  converted: number;
  conversionRate: number; // en %
}

const initialLeadStats: LeadStats = {
  total: 0,
  converted: 0,
  conversionRate: 0,
};

interface RecentLead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [leadStats, setLeadStats] = useState<LeadStats>(initialLeadStats);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  // Récupération des leads pour alimenter les stats globales + les 10 derniers
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/leads');
        if (!res.ok) return;
        const data = await res.json();

        const total = data.length;
        const converted = data.filter(
          (l: Lead) => l.status === 'CONVERTED',
        ).length;
        const conversionRate = total > 0 ? (converted / total) * 100 : 0;
        setLeadStats({ total, converted, conversionRate });

        const rows: RecentLead[] = data
          .sort(
            (a: Lead, b: Lead) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 10)
          .map((l: Lead) => ({
            id: l.id,
            firstName: l.firstName,
            lastName: l.lastName,
            email: l.email,
            phone: l.phone,
            status: l.status ?? 'NEW',
            createdAt: l.createdAt,
          }));
        setRecentLeads(rows);
      } catch {
        // silencieux pour le dashboard
      }
    })();
  }, []);

  return (
    <div className='min-h-screen flex bg-bgGray'>
      <Sidebar />
      <main className='flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8'>
        <Navbar />

        {loading ? (
          <div className='mt-4 flex flex-col gap-4'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full'>
              <SkeletonLoader className='h-24' />
              <SkeletonLoader className='h-24' />
              <SkeletonLoader className='h-24' />
            </div>
            <SkeletonLoader className='h-64' />
          </div>
        ) : (
          <>
            {/* Bandeau supérieur de cartes statistiques leads */}
            <section className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
              <div className='relative group'>
                <div className='pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary/10 to-indigo-200/40 opacity-50 blur-xl group-hover:opacity-70 transition-opacity' />
                <NeumoCard className='relative p-4 flex flex-col gap-2 bg-gradient-to-br from-primary/5 via-white to-indigo-50'>
                  <span className='text-[11px] text-gray-400'>
                    Total prospects
                  </span>
                  <span className='text-2xl font-semibold text-primary'>
                    {leadStats.total.toLocaleString('fr-FR')}
                  </span>
                  <span className='text-[11px] text-gray-500'>
                    Tous les leads enregistrés dans l&apos;application.
                  </span>
                </NeumoCard>
              </div>

              <div className='relative group'>
                <div className='pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-100/40 to-teal-200/40 opacity-50 blur-xl group-hover:opacity-70 transition-opacity' />
                <NeumoCard className='relative p-4 flex flex-col gap-2 bg-gradient-to-br from-emerald-50 via-white to-teal-50'>
                  <span className='text-[11px] text-gray-400'>
                    Taux de conversion
                  </span>
                  <span className='text-2xl font-semibold text-primary'>
                    {leadStats.conversionRate.toFixed(1)}%
                  </span>
                  <span className='text-[11px] text-gray-500'>
                    Proportion de leads au statut &quot;CONVERTED&quot;.
                  </span>
                </NeumoCard>
              </div>

              <div className='relative group'>
                <div className='pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-amber-100/40 to-orange-200/40 opacity-50 blur-xl group-hover:opacity-70 transition-opacity' />
                <NeumoCard className='relative p-4 flex flex-col gap-2 bg-gradient-to-br from-amber-50 via-white to-orange-50'>
                  <span className='text-[11px] text-gray-400'>
                    Leads convertis
                  </span>
                  <span className='text-2xl font-semibold text-primary'>
                    {leadStats.converted.toLocaleString('fr-FR')}
                  </span>
                  <span className='text-[11px] text-gray-500'>
                    Nombre total de prospects convertis.
                  </span>
                </NeumoCard>
              </div>

              <div className='relative group'>
                <div className='pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-rose-100/40 to-red-200/40 opacity-50 blur-xl group-hover:opacity-70 transition-opacity' />
                <NeumoCard className='relative p-4 flex flex-col gap-2 bg-gradient-to-br from-rose-50 via-white to-red-50'>
                  <span className='text-[11px] text-gray-400'>
                    Leads non convertis
                  </span>
                  <span className='text-2xl font-semibold text-primary'>
                    {(leadStats.total - leadStats.converted).toLocaleString(
                      'fr-FR',
                    )}
                  </span>
                  <span className='text-[11px] text-gray-500'>
                    Prospects encore à travailler dans le pipeline.
                  </span>
                </NeumoCard>
              </div>
            </section>

            {/* Bloc central : deux colonnes (donut source + donut statut) */}
            <section className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full'>
              <div className='relative overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-50 via-indigo-50/80 to-primary/5 p-1 shadow-neu-soft'>
                <ChartPieDonutBySource />
              </div>
              <div className='relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-50 via-teal-50/80 to-cyan-500/5 p-1 shadow-neu-soft'>
                <ChartPieDonut />
              </div>
            </section>

            {/* Section tableau des 10 derniers prospects */}
            <section className='mt-8 flex-1 rounded-3xl shadow-neu-soft bg-gradient-to-br from-[#f7f7fb] to-[#ececff] p-4 md:p-6 flex flex-col gap-4 overflow-hidden w-full'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-sm md:text-base font-semibold text-primary'>
                    Derniers prospects
                  </h2>
                  <p className='text-xs text-gray-400'>
                    Les 10 leads les plus récents créés dans l&apos;application.
                  </p>
                </div>
                <Link
                  href='/leads'
                  className='px-3 py-1.5 rounded-full bg-white text-[11px] font-medium shadow-neu hover:bg-gray-50'
                >
                  Voir tous les leads
                </Link>
              </div>

              <div className='bg-white/60 rounded-2xl border border-white/70 overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-100 text-[11px] text-gray-500'>
                      <TableHead>Prospect</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className='text-right'>Créé le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLeads.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className='border-b border-gray-50 hover:bg-gray-50/60 text-[11px] text-gray-700'
                      >
                        <TableCell className='py-2'>
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell className='py-2 text-gray-500'>
                          {lead.email ?? '—'}
                        </TableCell>
                        <TableCell className='py-2 text-gray-500'>
                          {lead.phone ?? '—'}
                        </TableCell>
                        <TableCell className='py-2'>
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600'>
                            {lead.status}
                          </span>
                        </TableCell>
                        <TableCell className='py-2 text-right text-gray-500'>
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString(
                                'fr-FR',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                },
                              )
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentLeads.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='py-6 text-center text-[11px] text-gray-400'
                        >
                          Aucun prospect trouvé pour le moment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
