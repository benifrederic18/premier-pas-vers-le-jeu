'use client';

import { useEffect, useState } from 'react';

interface Campagne {
  id: string;
  slug: string;
  titre: string | null;
  actif: boolean;
  objectif: number | null;
  totalCollecte: number;
  totalVotes: number;
  inscription: { nom: string; prenoms: string; email: string; photoUrl: string | null; photoBase64: string | null; photoMimeType: string | null };
  contributions: any[];
}

interface Inscription {
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  statut: string;
}

export default function SoutiensPage() {
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [objectif, setObjectif] = useState('');
  const [creating, setCreating] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const load = () =>
    Promise.all([
      fetch('/api/admin/soutiens').then((r) => r.json()).then(setCampagnes),
      fetch('/api/admin/inscriptions?statut=PAYE&limit=200').then((r) => r.json()).then((d) => setInscriptions(d.inscriptions || [])),
    ]).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!selectedInscription) return;
    setCreating(true);
    await fetch('/api/admin/soutiens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inscriptionId: selectedInscription, titre, description, objectif, actif: true }),
    });
    setCreating(false);
    setShowCreate(false);
    setSelectedInscription('');
    setTitre('');
    setDescription('');
    setObjectif('');
    load();
  };

  const toggleActif = async (c: Campagne) => {
    await fetch('/api/admin/soutiens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, actif: !c.actif, titre: c.titre, description: null, objectif: c.objectif }),
    });
    load();
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${baseUrl}/soutenir/${slug}`);
  };

  const totalCollecte = campagnes.reduce((sum, c) => sum + c.totalCollecte, 0);
  const totalVotes = campagnes.reduce((sum, c) => sum + c.totalVotes, 0);
  const actives = campagnes.filter((c) => c.actif).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Soutiens</h1>
          <p className="text-gray-500 text-sm mt-1">Campagnes de soutien des participants</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          <span>+</span> Créer une campagne
        </button>
      </div>

      {/* Explication du système */}
      <div className="mb-6 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2">
        <p className="text-blue-300 font-semibold text-sm">Comment fonctionnent les Soutiens & Votes ?</p>
        <ul className="text-gray-400 text-xs space-y-1 list-none">
          <li>🎭 <strong className="text-gray-300">Campagne</strong> — Chaque participant inscrit peut avoir sa propre page de soutien publique accessible via <code className="bg-white/10 px-1 rounded">/soutenir/[slug]</code>.</li>
          <li>💰 <strong className="text-gray-300">Contributions financières</strong> — Les visiteurs peuvent faire un don (paiement FedaPay) sur la page du participant. Le montant s'accumule dans <em>totalCollecte</em>.</li>
          <li>⭐ <strong className="text-gray-300">Votes</strong> — Les visiteurs peuvent aussi simplement voter (sans payer) pour encourager un participant. Chaque vote incrémente <em>totalVotes</em>.</li>
          <li>📋 <strong className="text-gray-300">Créer une campagne</strong> — Sélectionnez un participant payé, donnez un titre, une description et un objectif financier optionnel, puis cliquez sur <em>Créer</em>.</li>
          <li>🔗 <strong className="text-gray-300">Partager</strong> — Copiez le lien et partagez-le sur les réseaux sociaux pour que le public puisse soutenir le participant.</li>
          <li>⏸ <strong className="text-gray-300">Activer / Désactiver</strong> — Une campagne désactivée n'est plus visible sur le site public mais ses données sont conservées.</li>
        </ul>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Campagnes actives', value: actives, icon: '🎭' },
          { label: 'Total collecté', value: `${totalCollecte.toLocaleString('fr-FR')} F`, icon: '💰' },
          { label: 'Votes reçus', value: totalVotes, icon: '⭐' },
        ].map((s) => (
          <div key={s.label} className="card-dark rounded-2xl p-4 text-center">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-white font-black text-xl mt-1">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : campagnes.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">🎭</p>
          <p>Aucune campagne créée pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campagnes.map((c) => {
            const photoSrc = c.inscription.photoUrl
              || (c.inscription.photoBase64 && c.inscription.photoMimeType
                ? `data:${c.inscription.photoMimeType};base64,${c.inscription.photoBase64}`
                : null);
            const progressPct = c.objectif ? Math.min(100, (c.totalCollecte / c.objectif) * 100) : null;

            return (
              <div key={c.id} className={`card-dark rounded-2xl p-4 transition-opacity ${c.actif ? '' : 'opacity-60'}`}>
                <div className="flex items-start gap-4">
                  {photoSrc ? (
                    <img src={photoSrc} alt={c.inscription.prenoms} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl font-bold text-orange-400 shrink-0">
                      {c.inscription.prenoms[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold">{c.inscription.prenoms} {c.inscription.nom}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.actif ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'}`}>
                        {c.actif ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{c.titre}</p>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-orange-400 text-sm font-bold">{c.totalCollecte.toLocaleString('fr-FR')} FCFA</span>
                      <span className="text-gray-500 text-xs">· {c.totalVotes} votes</span>
                      {c.objectif && (
                        <span className="text-gray-500 text-xs">· Objectif : {c.objectif.toLocaleString('fr-FR')} F</span>
                      )}
                    </div>

                    {progressPct !== null && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
                  <button onClick={() => copyLink(c.slug)}
                    className="flex-1 text-xs py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                    📋 Copier le lien
                  </button>
                  <a href={`/soutenir/${c.slug}`} target="_blank"
                    className="flex-1 text-xs py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 text-center transition-colors">
                    👁 Voir la page
                  </a>
                  <button onClick={() => toggleActif(c)}
                    className={`flex-1 text-xs py-2 rounded-xl transition-colors ${c.actif ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                    {c.actif ? '⏸ Désactiver' : '▶ Activer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal création */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-white font-bold text-lg mb-5">Créer une campagne de soutien</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Participant (inscrit payé) *</label>
                <select value={selectedInscription} onChange={(e) => setSelectedInscription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  <option value="">-- Choisir un participant --</option>
                  {inscriptions.map((i) => (
                    <option key={i.id} value={i.id}>{i.prenoms} {i.nom} ({i.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Titre de la campagne</label>
                <input value={titre} onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex : Soutenez mon parcours !"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Objectif de collecte (FCFA, optionnel)</label>
                <input type="number" value={objectif} onChange={(e) => setObjectif(e.target.value)}
                  placeholder="Ex : 50000"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm">
                Annuler
              </button>
              <button onClick={handleCreate} disabled={creating || !selectedInscription}
                className="flex-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm">
                {creating ? 'Création...' : 'Créer la campagne'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
