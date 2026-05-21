'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Membre {
  id: string;
  nom: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  type: 'VISIONNAIRE' | 'EQUIPE' | 'FORMATEUR';
  ordre: number;
  reseaux: any;
}

export default function EquipeSection() {
  const [membres, setMembres] = useState<Membre[]>([]);

  useEffect(() => {
    fetch('/api/admin/equipe')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setMembres(d.filter((m: Membre) => m.actif !== false)))
      .catch(() => {});
  }, []);

  if (membres.length === 0) return null;

  const visionnaire = membres.find((m) => m.type === 'VISIONNAIRE');
  const formateurs = membres.filter((m) => m.type === 'FORMATEUR');
  const equipe = membres.filter((m) => m.type === 'EQUIPE');

  return (
    <section className="py-20 px-4" id="equipe">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-orange-500 text-xs uppercase tracking-[4px] font-semibold mb-3">Les gens derrière le projet</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Notre <span className="gradient-text">Équipe</span>
          </h2>
        </motion.div>

        {/* Visionnaire — grande carte centrale */}
        {visionnaire && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-xs uppercase tracking-widest text-orange-500/60 text-center mb-6">Le Visionnaire</p>
            <div className="max-w-2xl mx-auto card-dark rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 border border-orange-500/20 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg shadow-orange-500/20">
                  {visionnaire.photoUrl ? (
                    <img src={visionnaire.photoUrl} alt={visionnaire.nom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-orange-500/20 flex items-center justify-center text-4xl">🎬</div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm shadow-lg">
                  ⭐
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-black text-white">{visionnaire.nom}</h3>
                <p className="text-orange-400 font-medium mt-1">{visionnaire.role}</p>
                {visionnaire.bio && (
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">{visionnaire.bio}</p>
                )}
                {visionnaire.reseaux && (
                  <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                    {visionnaire.reseaux.instagram && (
                      <a href={visionnaire.reseaux.instagram} target="_blank" rel="noopener noreferrer"
                        className="text-gray-500 hover:text-pink-500 transition-colors text-sm">📸 Instagram</a>
                    )}
                    {visionnaire.reseaux.facebook && (
                      <a href={visionnaire.reseaux.facebook} target="_blank" rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-500 transition-colors text-sm">📘 Facebook</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Formateurs */}
        {formateurs.length > 0 && (
          <div className="mb-14">
            <p className="text-xs uppercase tracking-widest text-gray-600 text-center mb-8">Formateurs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {formateurs.map((m, i) => (
                <MembreCard key={m.id} membre={m} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Équipe */}
        {equipe.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-600 text-center mb-8">L'équipe</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {equipe.map((m, i) => (
                <MembreCardSmall key={m.id} membre={m} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MembreCard({ membre, index }: { membre: Membre; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      viewport={{ once: true }}
      className="card-dark rounded-2xl p-6 text-center group hover:border-orange-500/20 border border-transparent transition-colors"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-white/10 group-hover:border-orange-500/40 transition-colors">
        {membre.photoUrl ? (
          <img src={membre.photoUrl} alt={membre.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-2xl">🎭</div>
        )}
      </div>
      <h4 className="text-white font-bold">{membre.nom}</h4>
      <p className="text-orange-400 text-xs mt-1">{membre.role}</p>
      {membre.bio && <p className="text-gray-500 text-xs mt-2 line-clamp-3 leading-relaxed">{membre.bio}</p>}
      {membre.reseaux && (membre.reseaux.instagram || membre.reseaux.facebook) && (
        <div className="flex justify-center gap-2 mt-3">
          {membre.reseaux.instagram && (
            <a href={membre.reseaux.instagram} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-500 text-xs transition-colors">📸</a>
          )}
          {membre.reseaux.facebook && (
            <a href={membre.reseaux.facebook} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500 text-xs transition-colors">📘</a>
          )}
          {membre.reseaux.linkedin && (
            <a href={membre.reseaux.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-400 text-xs transition-colors">💼</a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function MembreCardSmall({ membre, index }: { membre: Membre; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="card-dark rounded-2xl p-4 text-center"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border border-white/10">
        {membre.photoUrl ? (
          <img src={membre.photoUrl} alt={membre.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-xl">👤</div>
        )}
      </div>
      <h4 className="text-white text-sm font-semibold leading-tight">{membre.nom}</h4>
      <p className="text-orange-400 text-xs mt-1">{membre.role}</p>
    </motion.div>
  );
}
