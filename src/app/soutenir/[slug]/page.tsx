'use client';

import { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Contribution {
  id: string;
  type: string;
  montant: number;
  nombreVotes: number | null;
  donateur: string | null;
  message: string | null;
  createdAt: string;
}

interface Campagne {
  id: string;
  slug: string;
  titre: string | null;
  description: string | null;
  objectif: number | null;
  totalCollecte: number;
  totalVotes: number;
  inscription: {
    nom: string;
    prenoms: string;
    email: string;
    photoUrl: string | null;
    photoBase64: string | null;
    photoMimeType: string | null;
    modeParticipation: string;
  };
  contributions: Contribution[];
}

const MONTANTS_FIXES = [500, 1000, 2000, 5000, 10000];

export default function SoutenirPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [campagne, setCampagne] = useState<Campagne | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mode, setMode] = useState<'VOTE' | 'MONTANT_FIXE' | 'LIBRE' | null>(null);
  const [votes, setVotes] = useState(1);
  const [montantFixe, setMontantFixe] = useState(1000);
  const [montantLibre, setMontantLibre] = useState('');
  const [donateur, setDonateur] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [paying, setPaying] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    fetch(`/api/soutenir/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => d && setCampagne(d))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // Polling toutes les 15 secondes
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [slug]);

  const getMontant = () => {
    if (mode === 'VOTE') return votes * 500;
    if (mode === 'MONTANT_FIXE') return montantFixe;
    if (mode === 'LIBRE') return parseFloat(montantLibre) || 0;
    return 0;
  };

  const handlePay = async () => {
    const montant = getMontant();
    if (!montant || montant < 100) return;
    setPaying(true);
    try {
      const res = await fetch('/api/contributions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          type: mode,
          montant,
          nombreVotes: mode === 'VOTE' ? votes : undefined,
          donateur: donateur || undefined,
          emailDonateur: email || undefined,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      alert('Erreur. Veuillez réessayer.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !campagne) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-center p-8">
        <div>
          <p className="text-6xl mb-4">🎭</p>
          <h1 className="text-white text-2xl font-bold mb-2">Campagne introuvable</h1>
          <p className="text-gray-500">Cette campagne n'existe pas ou n'est plus active.</p>
        </div>
      </div>
    );
  }

  const progressPct = campagne.objectif
    ? Math.min(100, (campagne.totalCollecte / campagne.objectif) * 100)
    : null;

  const photoSrc = campagne.inscription.photoUrl
    || (campagne.inscription.photoBase64 && campagne.inscription.photoMimeType
      ? `data:${campagne.inscription.photoMimeType};base64,${campagne.inscription.photoBase64}`
      : null);

  const modeLabel = campagne.inscription.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel';

  return (
    <div className="min-h-screen bg-[#0A0A0A]" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Carte participant */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', border: '1px solid rgba(255,107,53,0.3)' }}
        >
          {/* Fond décoratif */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-500/5" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-500/5" />
          </div>

          <div className="relative p-6">
            {/* Logo/titre de la formation */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-orange-400 text-xs font-bold tracking-widest uppercase">Premier Pas Vers Le Jeu</span>
            </div>

            {/* Photo et infos */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative shrink-0">
                {photoSrc ? (
                  <img src={photoSrc} alt={campagne.inscription.prenoms}
                    className="w-24 h-24 rounded-2xl object-cover"
                    style={{ border: '3px solid rgba(255,107,53,0.5)' }} />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-orange-500/20 flex items-center justify-center text-4xl font-bold text-orange-400">
                    {campagne.inscription.prenoms[0]}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs">🎭</div>
              </div>
              <div>
                <h1 className="text-white text-xl font-black leading-tight">
                  {campagne.inscription.prenoms}<br />
                  <span className="text-orange-400">{campagne.inscription.nom}</span>
                </h1>
                <span className="text-gray-500 text-xs bg-white/5 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {modeLabel}
                </span>
              </div>
            </div>

            {campagne.titre && (
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{campagne.titre}</p>
            )}
            {campagne.description && (
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{campagne.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-orange-400 text-2xl font-black">{campagne.totalCollecte.toLocaleString('fr-FR')}</p>
                <p className="text-gray-500 text-xs mt-0.5">FCFA collectés</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-orange-400 text-2xl font-black">{campagne.totalVotes}</p>
                <p className="text-gray-500 text-xs mt-0.5">votes reçus</p>
              </div>
            </div>

            {/* Barre de progression */}
            {progressPct !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Objectif : {campagne.objectif?.toLocaleString('fr-FR')} FCFA</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FF6B35, #F7931E)' }}
                  />
                </div>
              </div>
            )}

            {/* Bouton soutenir */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full py-4 rounded-2xl font-black text-white text-base transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #F7931E)' }}
            >
              ❤️ Soutenir {campagne.inscription.prenoms}
            </button>
          </div>
        </motion.div>

        {/* Formulaire de soutien */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card-dark rounded-3xl p-6 mb-6" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-white font-bold text-lg mb-4">Choisissez votre soutien</h2>

                {/* Mode de soutien */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { value: 'VOTE', icon: '⭐', label: 'Votes', desc: '500 FCFA/vote' },
                    { value: 'MONTANT_FIXE', icon: '💰', label: 'Montant', desc: 'Choix fixes' },
                    { value: 'LIBRE', icon: '🎁', label: 'Libre', desc: 'Votre choix' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value as any)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        mode === opt.value
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-2xl">{opt.icon}</p>
                      <p className={`text-xs font-bold mt-1 ${mode === opt.value ? 'text-orange-400' : 'text-white'}`}>{opt.label}</p>
                      <p className="text-gray-600 text-xs">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Votes */}
                {mode === 'VOTE' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                    <p className="text-gray-400 text-sm mb-3">Combien de votes ?</p>
                    <div className="flex items-center gap-4 justify-center mb-3">
                      <button onClick={() => setVotes(Math.max(1, votes - 1))} className="w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20">−</button>
                      <span className="text-orange-400 text-4xl font-black w-16 text-center">{votes}</span>
                      <button onClick={() => setVotes(votes + 1)} className="w-10 h-10 rounded-full bg-orange-500 text-white text-xl hover:bg-orange-400">+</button>
                    </div>
                    <p className="text-center text-gray-400 text-sm">= <span className="text-orange-400 font-bold">{(votes * 500).toLocaleString('fr-FR')} FCFA</span></p>
                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                      {[1, 5, 10, 20, 50].map((v) => (
                        <button key={v} onClick={() => setVotes(v)} className={`px-3 py-1 rounded-full text-xs transition-all ${votes === v ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                          {v} vote{v > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Montants fixes */}
                {mode === 'MONTANT_FIXE' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                    <div className="grid grid-cols-3 gap-2">
                      {MONTANTS_FIXES.map((m) => (
                        <button key={m} onClick={() => setMontantFixe(m)}
                          className={`p-3 rounded-xl text-sm font-bold transition-all ${montantFixe === m ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                          {m.toLocaleString('fr-FR')} F
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Montant libre */}
                {mode === 'LIBRE' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Montant (minimum 100 FCFA)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={montantLibre}
                        onChange={(e) => setMontantLibre(e.target.value)}
                        placeholder="Ex : 2500"
                        min={100}
                        className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <span className="text-gray-500 text-sm">FCFA</span>
                    </div>
                  </motion.div>
                )}

                {mode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-4">
                    <input value={donateur} onChange={(e) => setDonateur(e.target.value)}
                      placeholder="Votre nom (optionnel)"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (optionnel)"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                      placeholder="Message d'encouragement (optionnel)"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
                  </motion.div>
                )}

                {mode && getMontant() >= 100 && (
                  <button onClick={handlePay} disabled={paying}
                    className="w-full py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50 text-sm"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #F7931E)' }}>
                    {paying ? 'Redirection...' : `Payer ${getMontant().toLocaleString('fr-FR')} FCFA`}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Derniers soutiens */}
        {campagne.contributions.length > 0 && (
          <div className="card-dark rounded-3xl p-5" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="text-white font-bold mb-4 text-sm">❤️ Derniers soutiens</h3>
            <div className="space-y-3">
              {campagne.contributions.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm">
                    {c.type === 'VOTE' ? '⭐' : '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">{c.donateur || 'Anonyme'}</p>
                    {c.message && <p className="text-gray-500 text-xs truncate">{c.message}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-orange-400 text-xs font-bold">
                      {c.type === 'VOTE' ? `${c.nombreVotes} vote${(c.nombreVotes || 0) > 1 ? 's' : ''}` : `${c.montant.toLocaleString('fr-FR')} F`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
