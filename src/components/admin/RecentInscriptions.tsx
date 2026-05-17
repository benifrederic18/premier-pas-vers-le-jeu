'use client';

import { useEffect, useState } from 'react';
import { formatDate, getStatutLabel } from '@/lib/utils';

interface Inscription {
  id: string;
  nom: string;
  prenoms: string;
  telephone: string;
  statut: string;
  dateInscription: string;
}

export default function RecentInscriptions() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/inscriptions?page=1')
      .then((r) => r.json())
      .then((d) => setInscriptions(d.inscriptions?.slice(0, 10) || []))
      .finally(() => setLoading(false));
  }, []);

  const statutColors: Record<string, string> = {
    green: 'text-green-400 bg-green-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    red: 'text-red-400 bg-red-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    gray: 'text-gray-400 bg-gray-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  };

  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="font-semibold text-white">Dernières inscriptions</h3>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-600">Chargement...</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-gray-500 font-medium">Participant</th>
              <th className="text-left p-4 text-gray-500 font-medium hidden md:table-cell">Téléphone</th>
              <th className="text-left p-4 text-gray-500 font-medium">Statut</th>
              <th className="text-left p-4 text-gray-500 font-medium hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((ins) => {
              const s = getStatutLabel(ins.statut);
              return (
                <tr key={ins.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{ins.prenoms} {ins.nom}</td>
                  <td className="p-4 text-gray-400 hidden md:table-cell">{ins.telephone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColors[s.color] || statutColors.gray}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs hidden lg:table-cell">{formatDate(ins.dateInscription)}</td>
                </tr>
              );
            })}
            {inscriptions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-600">
                  Aucune inscription pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <div className="p-4 border-t border-white/5">
        <a href="/admin/inscriptions" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
          Voir toutes les inscriptions →
        </a>
      </div>
    </div>
  );
}