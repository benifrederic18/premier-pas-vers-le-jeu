'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  nom: string;
  prenoms: string;
  telephone: string;
  email: string;
  age: string;
  dejaForme: boolean | null;
  professionnel: boolean | null;
  motivation: string;
  modeParticipation: 'PRESENTIEL' | 'EN_LIGNE';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillData?: Partial<FormData>;
}

export default function DejaPayeModal({ open, onClose, onSuccess, prefillData }: Props) {
  const [step, setStep] = useState<'code' | 'form'>('code');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [checking, setChecking] = useState(false);
  const [codeData, setCodeData] = useState<{ email: string; nomApprenant: string; montant: number } | null>(null);

  const [form, setForm] = useState<FormData>({
    nom: prefillData?.nom || '',
    prenoms: prefillData?.prenoms || '',
    telephone: prefillData?.telephone || '',
    email: prefillData?.email || '',
    age: prefillData?.age || '',
    dejaForme: prefillData?.dejaForme ?? null,
    professionnel: prefillData?.professionnel ?? null,
    motivation: prefillData?.motivation || '',
    modeParticipation: prefillData?.modeParticipation || 'PRESENTIEL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleCheckCode = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setCodeError('');
    try {
      const res = await fetch('/api/codes-paiement/verifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.error || 'Code invalide.');
      } else {
        setCodeData(data);
        setForm((f) => ({ ...f, email: data.email }));
        setStep('form');
      }
    } catch {
      setCodeError('Erreur réseau. Réessayez.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenoms || !form.telephone || !form.email || !form.age) {
      setSubmitError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/codes-paiement/utiliser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Erreur lors de la validation.');
      } else {
        onSuccess();
      }
    } catch {
      setSubmitError('Erreur réseau. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('code');
    setCode('');
    setCodeError('');
    setCodeData(null);
    setSubmitError('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { onClose(); reset(); } }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={() => { onClose(); reset(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {step === 'code' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🔑</div>
                  <h3 className="text-white font-black text-xl">J'ai déjà payé</h3>
                  <p className="text-gray-400 text-sm mt-1">Entrez le code que l'équipe vous a communiqué</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Code de paiement</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckCode()}
                      className="w-full bg-white/5 border border-white/10 text-white text-center rounded-xl px-4 py-4 text-2xl font-black font-mono tracking-widest focus:outline-none focus:border-orange-500 uppercase"
                      placeholder="XXXXXXXX"
                      maxLength={8}
                    />
                    {codeError && <p className="text-red-400 text-sm mt-2">{codeError}</p>}
                  </div>

                  <button
                    onClick={handleCheckCode}
                    disabled={checking || !code.trim()}
                    className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm"
                  >
                    {checking ? 'Vérification...' : 'Valider le code →'}
                  </button>

                  <p className="text-gray-600 text-xs text-center">
                    Vous n'avez pas de code ? Contactez l'équipe de formation.
                  </p>
                </div>
              </>
            ) : (
              <>
                {codeData && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-5 flex items-center gap-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <div>
                      <p className="text-green-400 text-sm font-semibold">Code valide !</p>
                      <p className="text-gray-400 text-xs">Montant enregistré : {codeData.montant.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                )}

                <h3 className="text-white font-black text-lg mb-5">Complétez votre profil</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Prénom(s) *</label>
                      <input value={form.prenoms} onChange={(e) => setForm({ ...form, prenoms: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Nom *</label>
                      <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Téléphone *</label>
                      <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Âge *</label>
                      <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Mode de participation</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: 'PRESENTIEL', l: '🏠 Présentiel' },
                        { v: 'EN_LIGNE', l: '💻 En ligne' },
                      ].map((opt) => (
                        <button key={opt.v} type="button"
                          onClick={() => setForm({ ...form, modeParticipation: opt.v as any })}
                          className={`py-2 rounded-xl border text-xs transition-all ${form.modeParticipation === opt.v ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Motivation (courte)</label>
                    <textarea value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} rows={2}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" />
                  </div>

                  {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep('code')} className="px-4 py-2.5 border border-white/10 text-gray-400 rounded-xl text-sm hover:text-white">
                      ← Retour
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !form.nom || !form.prenoms || !form.telephone || !form.email}
                      className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm"
                    >
                      {submitting ? 'Validation...' : '✅ Valider mon inscription'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
