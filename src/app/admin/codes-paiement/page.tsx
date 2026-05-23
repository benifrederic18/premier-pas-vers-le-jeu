'use client';

import { useEffect, useState } from 'react';

interface Code {
  id: string;
  code: string;
  email: string;
  nomApprenant: string;
  montant: number;
  utilise: boolean;
  dateUtilise: string | null;
  inscriptionId: string | null;
  createdBy: string;
  createdAt: string;
}

export default function CodesPaiementPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', nomApprenant: '', montant: '' });
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () =>
    fetch('/api/admin/codes-paiement')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCodes(d))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!form.email || !form.nomApprenant || !form.montant) return;
    setSaving(true);
    const res = await fetch('/api/admin/codes-paiement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, montant: parseFloat(form.montant) }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setNewCode(data.code);
      load();
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const utilisés = codes.filter((c) => c.utilise).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Codes de paiement</h1>
          <p className="text-gray-500 text-sm mt-1">Pour les apprenants qui ont payé directement</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setNewCode(null); setForm({ email: '', nomApprenant: '', montant: '' }); }}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
        >
          <span>+</span> Générer un code
        </button>
      </div>

      {/* Info */}
      <div className="card-dark rounded-2xl p-4 mb-6 border border-blue-500/20 text-blue-300 text-sm">
        <p className="font-semibold mb-1">💡 Comment ça marche ?</p>
        <ol className="text-gray-400 space-y-1 text-xs list-decimal list-inside">
          <li>Vous générez un code unique pour un apprenant qui a payé directement (cash / MoMo).</li>
          <li>Vous lui communiquez ce code (SMS, WhatsApp, etc.).</li>
          <li>Sur le site, il clique <strong>"Déjà payé"</strong>, entre le code et complète son profil.</li>
          <li>Son inscription est automatiquement validée et les emails de confirmation sont envoyés.</li>
        </ol>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total générés', value: codes.length, icon: '🔑' },
          { label: 'Utilisés', value: utilisés, icon: '✅' },
          { label: 'En attente', value: codes.length - utilisés, icon: '⏳' },
        ].map((s) => (
          <div key={s.label} className="card-dark rounded-2xl p-4 text-center">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-black text-white mt-1">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : codes.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">🔑</p>
          <p>Aucun code généré pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => (
            <div key={c.id} className={`card-dark rounded-2xl p-4 flex items-center gap-4 ${c.utilise ? 'opacity-60' : ''}`}>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 shrink-0 text-center">
                <p className="text-orange-400 font-black text-xl tracking-widest font-mono">{c.code}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm">{c.nomApprenant}</p>
                  {c.utilise ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">✓ Utilisé</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">⏳ En attente</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{c.email}</p>
                <div className="flex gap-3 mt-1 text-gray-500 text-xs">
                  <span>💰 {c.montant.toLocaleString('fr-FR')} FCFA</span>
                  <span>📅 {new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                  {c.utilise && c.dateUtilise && (
                    <span>✅ utilisé le {new Date(c.dateUtilise).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </div>
              {!c.utilise && (
                <button
                  onClick={() => copy(c.code)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
                >
                  📋 Copier
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal génération */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-5">Générer un code de paiement</h2>

            {newCode ? (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">Code généré avec succès !</p>
                <div className="bg-orange-500/10 border-2 border-orange-500 rounded-2xl p-6 mb-4">
                  <p className="text-orange-400 font-black text-4xl tracking-widest font-mono">{newCode}</p>
                </div>
                <p className="text-gray-500 text-xs mb-4">Communiquez ce code à l'apprenant pour qu'il complète son inscription sur le site.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => copy(newCode)}
                    className="flex-1 bg-orange-500/20 text-orange-400 font-bold py-2.5 rounded-xl text-sm hover:bg-orange-500/30"
                  >
                    {copied ? '✓ Copié !' : '📋 Copier le code'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm hover:text-white"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Nom de l'apprenant *</label>
                  <input
                    value={form.nomApprenant}
                    onChange={(e) => setForm({ ...form, nomApprenant: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Ex : Ama Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email de l'apprenant *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder="apprenant@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Montant payé (FCFA) *</label>
                  <input
                    type="number"
                    value={form.montant}
                    onChange={(e) => setForm({ ...form, montant: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                    placeholder="30000"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm">
                    Annuler
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={saving || !form.email || !form.nomApprenant || !form.montant}
                    className="flex-[2] bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm"
                  >
                    {saving ? 'Génération...' : '🔑 Générer le code'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg z-50">
          ✓ Code copié !
        </div>
      )}
    </div>
  );
}
