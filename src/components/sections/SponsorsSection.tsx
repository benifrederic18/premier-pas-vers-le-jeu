'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sponsor {
  id: string;
  nom: string;
  logoUrl: string;
  siteWeb: string | null;
  type: 'SPONSOR' | 'PARTENAIRE';
  description: string | null;
}

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', organisation: '', email: '', telephone: '', message: '', type: 'PARTENAIRE' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/partenariat')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSponsors(d))
      .catch(() => {});
  }, []);

  const sponsorsList = sponsors.filter((s) => s.type === 'SPONSOR');
  const partnersList = sponsors.filter((s) => s.type === 'PARTENAIRE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/partenariat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ nom: '', organisation: '', email: '', telephone: '', message: '', type: 'PARTENAIRE' });
        setTimeout(() => { setShowForm(false); setSuccess(false); }, 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Toujours afficher même si pas de sponsors (pour le bouton "Devenir sponsor")

  return (
    <section className="py-16 px-4 bg-black/50" id="sponsors">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-white mb-3">
            Nos <span className="gradient-text">Sponsors & Partenaires</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Ils nous font confiance et soutiennent la formation Premier Pas Vers Le Jeu.
          </p>
        </motion.div>

        {/* Sponsors */}
        {sponsorsList.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-center gap-10">
              {sponsorsList.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={s.siteWeb || '#'}
                  target={s.siteWeb ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="group transition-all"
                  title={s.nom}
                >
                  <img src={s.logoUrl} alt={s.nom} className="h-14 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Partenaires */}
        {partnersList.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {partnersList.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={s.siteWeb || '#'}
                  target={s.siteWeb ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="group transition-all"
                  title={s.nom}
                >
                  <img src={s.logoUrl} alt={s.nom} className="h-10 w-auto object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* CTA Devenir sponsor */}
        <div className="text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 border border-orange-500/30 hover:border-orange-500 text-orange-400 hover:bg-orange-500/10 px-6 py-3 rounded-xl text-sm font-medium transition-all"
          >
            🤝 Devenir sponsor ou partenaire
          </button>
        </div>

        {/* Formulaire */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-lg mx-auto mt-8 card-dark rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Rejoindre l'aventure</h3>

                {success ? (
                  <div className="text-center py-6">
                    <p className="text-4xl mb-3">✅</p>
                    <p className="text-green-400 font-semibold">Demande envoyée !</p>
                    <p className="text-gray-500 text-sm mt-1">Nous vous contacterons très bientôt.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        placeholder="Votre nom *"
                        className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                      <input required value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                        placeholder="Organisation *"
                        className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email *"
                        className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                      <input required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                        placeholder="Téléphone *"
                        className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                    <div className="flex gap-3">
                      {['PARTENAIRE', 'SPONSOR'].map((t) => (
                        <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                          className={`flex-1 py-2 rounded-xl border text-xs transition-all ${form.type === t ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                          {t === 'PARTENAIRE' ? '🤝 Partenaire' : '💼 Sponsor'}
                        </button>
                      ))}
                    </div>
                    <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3}
                      placeholder="Votre message / proposition *"
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
                    <button type="submit" disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                      {submitting ? 'Envoi...' : 'Envoyer ma demande'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
