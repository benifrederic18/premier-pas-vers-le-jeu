'use client';

import { useEffect, useState } from 'react';

interface Demande {
  id: string;
  nom: string;
  organisation: string;
  email: string;
  telephone: string;
  message: string;
  type: 'SPONSOR' | 'PARTENAIRE';
  traite: boolean;
  createdAt: string;
}

export default function PartenairesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'false' | 'true'>('false');
  const [selected, setSelected] = useState<Demande | null>(null);

  const load = () =>
    fetch(filter !== 'all' ? `/api/admin/partenaires?traite=${filter}` : '/api/admin/partenaires')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setDemandes(d))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [filter]);

  const marquerTraite = async (id: string, traite: boolean) => {
    await fetch('/api/admin/partenaires', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, traite }),
    });
    load();
    if (selected?.id === id) setSelected(null);
  };

  const typeColors = {
    SPONSOR: 'bg-orange-500/20 text-orange-400',
    PARTENAIRE: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Demandes de partenariat</h1>
        <p className="text-gray-500 text-sm mt-1">Personnes qui souhaitent devenir sponsor ou partenaire</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'false', label: '🔔 Non traitées' },
          { value: 'true', label: '✅ Traitées' },
          { value: 'all', label: 'Toutes' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${filter === f.value ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : demandes.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">📩</p>
          <p>{filter === 'false' ? 'Aucune demande en attente.' : 'Aucune demande.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => (
            <div key={d.id} className={`card-dark rounded-2xl p-5 transition-opacity ${d.traite ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white font-semibold">{d.nom}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[d.type]}`}>
                      {d.type === 'SPONSOR' ? '💼 Sponsor' : '🤝 Partenaire'}
                    </span>
                    {d.traite && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">✓ Traité</span>}
                  </div>
                  <p className="text-orange-400 text-sm">{d.organisation}</p>
                  <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs">
                    <span>✉️ {d.email}</span>
                    <span>📞 {d.telephone}</span>
                    <span>🗓 {new Date(d.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-3 bg-white/5 rounded-xl p-3 leading-relaxed">
                    {d.message}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href={`mailto:${d.email}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-center transition-colors">
                    ✉️ Répondre
                  </a>
                  {!d.traite ? (
                    <button onClick={() => marquerTraite(d.id, true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                      ✓ Marquer traité
                    </button>
                  ) : (
                    <button onClick={() => marquerTraite(d.id, false)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/10 transition-colors">
                      ↩ Rouvrir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
