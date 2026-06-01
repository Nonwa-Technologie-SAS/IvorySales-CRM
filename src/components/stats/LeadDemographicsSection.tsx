'use client';

import type { LeadDemographicsResponse } from '@/app/api/dashboard/lead-demographics/route';
import { LABEL_NONE } from '@/lib/lead-demographics';
import { LocationBarCard } from '@/components/ui/chart-location-bars';
import {
  MarketShareCard,
  TotalProspectsKpiCard,
  type DonutDatum,
} from '@/components/ui/chart-pie-donut-generic';
import { useCallback, useEffect, useState } from 'react';

type LeadDemographicsSectionProps = {
  companyId?: string;
  scopeLabel?: string;
};

function hasMeaningfulLocationRows(rows: DonutDatum[]): boolean {
  const withData = rows.filter((r) => r.count > 0);
  if (withData.length === 0) return false;
  if (withData.length === 1 && withData[0].label === LABEL_NONE) return false;
  return true;
}

function DemographicsSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[220px] animate-pulse'
          />
        ))}
      </div>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[280px] animate-pulse' />
    </div>
  );
}

export function LeadDemographicsSection({
  companyId,
  scopeLabel,
}: LeadDemographicsSectionProps) {
  const [data, setData] = useState<LeadDemographicsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemographics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (companyId?.trim()) {
        params.set('companyId', companyId.trim());
      }
      const qs = params.toString();
      const url = qs
        ? `/api/dashboard/lead-demographics?${qs}`
        : '/api/dashboard/lead-demographics';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setData(null);
        setError(
          typeof json?.error === 'string'
            ? json.error
            : 'Impossible de charger la répartition des prospects.',
        );
        return;
      }
      setData(json as LeadDemographicsResponse);
    } catch {
      setData(null);
      setError('Impossible de charger la répartition des prospects.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void fetchDemographics();
  }, [fetchDemographics]);

  useEffect(() => {
    const onInvalidate = () => {
      void fetchDemographics();
    };
    window.addEventListener('crm:goals-invalidate', onInvalidate);
    return () => {
      window.removeEventListener('crm:goals-invalidate', onInvalidate);
    };
  }, [fetchDemographics]);

  const kpiScope = scopeLabel ?? 'Périmètre actuel';
  const locationRows = (data?.byLocation ?? []) as DonutDatum[];
  const showLocationChart = hasMeaningfulLocationRows(locationRows);

  return (
    <section className='mt-4'>
      <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-sm font-semibold text-gray-800'>
            Répartition des prospects
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>
            Civilité, domaine d&apos;activités et situation géographique
          </p>
        </div>
        {!loading && data && data.total > 0 && (
          <span
            className='inline-flex items-center self-start rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-600 shadow-sm'
            title={kpiScope}
          >
            {kpiScope}
          </span>
        )}
      </div>

      {loading && <DemographicsSkeleton />}

      {!loading && error && (
        <p className='text-xs text-red-600 bg-white rounded-2xl border border-red-100 p-4'>
          {error}
        </p>
      )}

      {!loading && !error && data && data.total === 0 && (
        <p className='text-xs text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm p-5'>
          Aucun prospect sur ce périmètre pour le moment.
        </p>
      )}

      {!loading && !error && data && data.total > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <TotalProspectsKpiCard total={data.total} scopeLabel={kpiScope} />

            <MarketShareCard
              title='Par civilité'
              rows={data.byCivility as DonutDatum[]}
            />

            <MarketShareCard
              title="Par domaine d'activités"
              rows={data.byActivityDomain as DonutDatum[]}
            />
          </div>

          {showLocationChart ? (
            <LocationBarCard rows={locationRows} />
          ) : (
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[120px] flex items-center justify-center'>
              <p className='text-xs text-gray-500 text-center px-4'>
                Aucune situation géographique renseignée sur les prospects de
                ce périmètre. Complétez le champ « Situation géographique » sur
                vos fiches leads.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
