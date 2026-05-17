'use client';

import { useEffect, useState } from 'react';
import { formatDate, formatMontant, getStatutLabel } from '@/lib/utils';

interface Props {
  id: string;
  onClose: () => void;
  onRefresh: () => void;
}

export default function InscriptionModal({ id, onClose, onRefresh }: Props) {
  const [inscription, setInscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/inscriptions/${id}`)
      .then((r) => r.json())
      .then(setInscription)
      .finally(() => setLoading(false));
  }, [id]);

  const s = inscription ? getStatutLabel(inscription.statut) : null;
  const statutColors: Record<string, string> = {
    green: 'text-green-400 bg-green-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    red: 'text-red-400 bg-red-400/10',
    gray: 'text-gray-400 bg-gray-400/10',
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Détails de l'inscription</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-600">Chargement...</div>
        ) : inscription ? (
          <div className="p-6 space-y-5">
            {/* Photo */}
            {inscription.photoBase64 && (
              <div className="flex justify-center">
                <img
                  src={`data:${inscription.photoMimeType};base64,${inscription.photoBase64}`}
                  alt="Photo"
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
                />
              </div>
            )}

            {/* Infos perso */}
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Informations personnelles</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Nom complet', `${inscription.nom} ${inscription.prenoms}`],
                  ['Téléphone', inscription.telephone],
                  ['Email', inscription.email],
                  ['Âge', `${inscription.age} ans`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profil artistique */}
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Profil artistique</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Professionnel', inscription.professionnel ? 'Oui' : 'Non'],
                  ['Déjà formé', inscription.dejaForme ? 'Oui' : 'Non'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-white/5 rounded-xl text-sm text-gray-400 leading-relaxed">
                <p className="text-gray-500 text-xs mb-1">Motivation :</p>
                {inscription.motivation}
              </div>
            </div>

            {/* Paiement */}
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Paiement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Statut</span>
                  {s && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutColors[s.color] || statutColors.gray}`}>
                      {s.label}
                    </span>
                  )}
                </div>
                {inscription.montantPaye && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant</span>
                    <span className="text-white">{formatMontant(inscription.montantPaye)}</span>
                  </div>
                )}
                {inscription.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Référence</span>
                    <span className="text-white font-mono text-xs">{inscription.transactionId}</span>
                  </div>
                )}
                {inscription.datePaiement && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date paiement</span>
                    <span className="text-white">{formatDate(inscription.datePaiement)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking */}
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Tracking</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Source</span>
                  <span className="text-white">{inscription.sourceUtm || 'Direct'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date inscription</span>
                  <span className="text-white">{formatDate(inscription.dateInscription)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-600">Inscription introuvable.</div>
        )}
      </div>
    </div>
  );
}