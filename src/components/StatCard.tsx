"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
}

export default function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <motion.div
      className="bg-bgGray rounded-2xl p-4 shadow-neu flex flex-col gap-1 min-w-[150px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <span className="text-[11px] uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-xl md:text-2xl font-semibold text-primary">{value}</span>
      {trend && (
        <span className="text-[11px] text-emerald-500 font-medium">{trend}</span>
      )}
    </motion.div>
  );
}
