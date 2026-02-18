"use client";

import NeumoCard from "@/components/NeumoCard";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";

function StatsPageInner() {
  return (
    <>
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-primary">Statistiques</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Suivi des performances commerciales, taux de conversion et objectifs.
          </p>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NeumoCard className="p-4 bg-white flex flex-col gap-2">
          <span className="text-[11px] text-gray-500">Taux de conversion</span>
          <span className="text-2xl font-semibold text-primary">23%</span>
          <span className="text-[11px] text-emerald-500">+2,1% vs mois dernier</span>
        </NeumoCard>
        <NeumoCard className="p-4 bg-white flex flex-col gap-2">
          <span className="text-[11px] text-gray-500">Revenus prévisionnels</span>
          <span className="text-2xl font-semibold text-primary">$45,6k</span>
          <span className="text-[11px] text-gray-400">Basé sur les opportunités en cours</span>
        </NeumoCard>
        <NeumoCard className="p-4 bg-white flex flex-col gap-2">
          <span className="text-[11px] text-gray-500">Leads ce mois-ci</span>
          <span className="text-2xl font-semibold text-primary">124</span>
          <span className="text-[11px] text-gray-400">Objectif: 150</span>
        </NeumoCard>
      </div>

      <NeumoCard className="mt-6 p-5 bg-white flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Performance par source</p>
            <p className="text-sm font-semibold text-primary">Facebook, WhatsApp, Site web, Références</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
          <div className="flex flex-col gap-1">
            <span className="font-medium">Facebook</span>
            <span>52 leads</span>
            <span className="text-emerald-500 text-[11px]">+12% vs N-1</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium">WhatsApp</span>
            <span>34 leads</span>
            <span className="text-emerald-500 text-[11px]">+8% vs N-1</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium">Site Web</span>
            <span>20 leads</span>
            <span className="text-orange-500 text-[11px]">Stable</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium">Références</span>
            <span>18 leads</span>
            <span className="text-emerald-500 text-[11px]">+5% vs N-1</span>
          </div>
        </div>
      </NeumoCard>
    </>
  );
}

const StatsPage = withDashboardLayout(StatsPageInner);

export default StatsPage;
