'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatDate, getStatutLabel } from '@/lib/utils';
import InscriptionModal from '@/components/admin/InscriptionModal';

const STATUTS = [
  { value: 'TOUS', label: 'Tous' },
  { value: 'PAYE', label: 'Payés' },
  { value: 'EN_ATTENTE_PAIEMENT', label: 'En attente' },
  { value: 'ECHEC_PAIEMENT', label: 'Échecs' },
];

const statutColors: Record<string, string> = {
  green: 'text-green-400 bg-green-400/10 border-green-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  red: 'text-red-400 bg-red-400/10 border-red-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  gray: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export default function InscriptionsPage() {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState('TOUS');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchInscriptions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ statut, page: String(page) });
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/inscriptions?${params}`);
    const data = await res.json();
    setInscriptions(data.inscriptions || []);
    setTotalPages(data.pages || 1);
    setLoading(false);
  }, [statut, search, page]);

  useEffect(() => { fetchInscriptions(); }, [fetchInscriptions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette inscription ? Cette action est irréversible.')) return;
    await fetch(`/api/admin/inscriptions/${id}`, { method: 'DELETE' });
    fetchInscriptions();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Inscrits</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des participants</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card-dark rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {STATUTS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatut(s.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statut === s.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher (nom, email, téléphone)..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Tableau */}
      <div className="card-dark rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-600">Chargement...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-500 font-medium">Participant</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden lg:table-cell">Téléphone</th>
                <th className="text-left p-4 text-gray-500 font-medium">Statut</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                <th className="text-right p-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inscriptions.map((ins) => {
                const s = getStatutLabel(ins.statut);
                return (
                  <tr key={ins.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{ins.prenoms} {ins.nom}</div>
                      <div className="text-xs text-gray-500">{ins.age} ans · {ins.professionnel ? 'Pro' : 'Débutant'}</div>
                    </td>
                    <td className="p-4 text-gray-400 hidden md:table-cell">{ins.email}</td>
                    <td className="p-4 text-gray-400 hidden lg:table-cell">{ins.telephone}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statutColors[s.color] || statutColors.gray}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs hidden lg:table-cell">{formatDate(ins.dateInscription)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedId(ins.id)}
                          className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleDelete(ins.id)}
                          className="px-3 py-1.5 text-xs bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {inscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-600">
                    Aucune inscription trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg disabled:opacity-30 transition-all"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg disabled:opacity-30 transition-all"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <InscriptionModal id={selectedId} onClose={() => setSelectedId(null)} onRefresh={fetchInscriptions} />
      )}
    </div>
  );
}