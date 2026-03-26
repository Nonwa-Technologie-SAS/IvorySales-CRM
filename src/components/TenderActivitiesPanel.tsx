'use client';

import type { TenderActivityType } from '@prisma/client';
import { useState } from 'react';
import InteractionHistory from '@/components/InteractionHistory';

const TABS: { key: 'ALL' | TenderActivityType; label: string }[] = [
  { key: 'ALL', label: 'Activité' },
  { key: 'NOTE', label: 'Notes' },
  { key: 'CALL', label: 'Appels' },
  { key: 'EMAIL', label: 'Emails' },
  { key: 'MEETING', label: 'Rendez-vous' },
];

type Props = {
  tenderId: string;
  canWrite: boolean;
};

export default function TenderActivitiesPanel({ tenderId, canWrite }: Props) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('ALL');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-neu'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <InteractionHistory
        tenderId={tenderId}
        canWrite={canWrite}
        title="Activités"
        filterType={activeTab === 'ALL' ? undefined : activeTab}
        initialType={activeTab === 'ALL' ? 'NOTE' : activeTab}
      />
    </div>
  );
}

