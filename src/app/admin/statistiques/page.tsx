'use client';

import { useEffect, useState } from 'react';
import { formatMontant } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUT_LABELS: Record<string, string> = {
  PAYE: 'Payés',
  EN_ATTENTE_PAIEMENT: 'En attente',
  PAIEMENT_EN_COURS: 'En cours',
  ECHEC_PAIEMENT: 'Échecs',
  REMBOURSE: 'Remboursés',
  ANNULE: 'Annulés',
};

const COLORS = ['#FF6B35', '#F7931E', '#4CAF50', '#2196F3', '#9C27B0', '#F44336'];

export default function StatistiquesPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-600">Chargement des statistiques...</div>;
  }

  if (!stats) return null;

  const statutData = (stats.parStatut || []).map((s: any) => ({
    name: STATUT_LABELS[s.statut] || s.statut,
    value: s._count.statut,
  }));

  const sourceData = (stats.parSource || [])
    .filter((s: any) => s.sourceUtm)
    .map((s: any) => ({
      name: s.sourceUtm,
      value: s._count.sourceUtm,
    }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Statistiques</h1>
        <p className="text-gray-500 text-sm mt-1">Analyse des performances</p>
      </div>

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total inscrits', value: stats.total, icon: '👥' },
            { label: 'Payés', value: stats.payes, icon: '✅', color: 'text-green-400' },
            { label: 'Taux de conversion', value: `${stats.tauxConversion}%`, icon: '🎯', color: 'text-orange-400' },
            { label: 'Revenus', value: formatMontant(stats.revenus), icon: '💰', color: 'text-yellow-400' },
          ].map((k) => (
            <div key={k.label} className="card-dark rounded-2xl p-5">
              <div className="text-2xl mb-2">{k.icon}</div>
              <div className={`text-2xl font-black ${k.color || 'text-white'}`}>{k.value}</div>
              <div className="text-gray-500 text-xs mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Graphique inscriptions par jour */}
        {stats.parJour?.length > 0 && (
          <div className="card-dark rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-6">Inscriptions par jour</h3>
            <ResponsiveContainer width="100%" height={250}>
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
                  labelFormatter={(v) => new Date(v).toLocaleDateString('fr-FR')}
                  itemStyle={{ color: '#FF6B35' }}
                />
                <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Répartition par statut */}
          {statutData.length > 0 && (
            <div className="card-dark rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-6">Répartition par statut</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statutData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {statutData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #FF6B3530', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sources de trafic */}
          {sourceData.length > 0 && (
            <div className="card-dark rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-6">Sources de trafic</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {sourceData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #FF6B3530', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}