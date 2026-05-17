'use client';

import { useEffect, useState } from 'react';
import { formatMontant } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  total: number;
  payes: number;
  enAttente: number;
  echecs: number;
  revenus: number;
  tauxConversion: number;
  parJour: Array<{ date: string; count: number }>;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark rounded-2xl p-6 h-24 animate-pulse bg-white/5" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const widgets = [
    { icon: '👥', label: 'Total inscrits', value: stats.total, sub: 'Tous statuts' },
    { icon: '✅', label: 'Payés', value: stats.payes, sub: `${stats.tauxConversion}% conversion`, color: 'text-green-400' },
    { icon: '⏳', label: 'En attente', value: stats.enAttente, sub: 'Paiement non finalisé', color: 'text-yellow-400' },
    { icon: '💰', label: 'Revenus totaux', value: formatMontant(stats.revenus), sub: 'Paiements confirmés', color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <div key={w.label} className="card-dark rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{w.icon}</span>
            </div>
            <div className={`text-2xl font-black ${w.color || 'text-white'}`}>{w.value}</div>
            <div className="text-sm font-medium text-gray-300 mt-1">{w.label}</div>
            <div className="text-xs text-gray-600 mt-0.5">{w.sub}</div>
          </div>
        ))}
      </div>

      {stats.parJour.length > 0 && (
        <div className="card-dark rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Inscriptions par jour (30 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.parJour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #FF6B3530', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#FF6B35' }}
              />
              <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Inscriptions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}