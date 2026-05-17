'use client';

import { motion } from 'framer-motion';

const infos = [
  { icon: '📅', label: 'Dates', value: '24 au 27 Juin 2025' },
  { icon: '💰', label: 'Tarif', value: '30.000 FCFA' },
  { icon: '🎁', label: 'Restitution', value: 'Lots a gagner' },
];

const points = [
  "Comprendre les fondamentaux du metier d'acteur",
  "Maitriser les techniques de jeu devant la camera",
  "Reussir vos auditions et castings",
  "Developper votre presence scenique",
];

export default function PresentationSection() {
  return (
    <section id="presentation" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1 text-orange-400 text-sm font-medium mb-6">
              🎭 A PROPOS
            </div>
            <h2 className="text-4xl font-black mb-6">
              Une formation <span className="gradient-text">unique</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Plongez dans l&apos;univers fascinant du jeu d&apos;acteur avec une formation intensive de{' '}
              <strong className="text-white">4 jours</strong>, animee par des professionnels
              du cinema beninois.
            </p>
            <p className="text-gray-400 mb-6">
              Que vous soyez debutant ou amateur, cette formation vous donnera les cles pour :
            </p>
            <ul className="space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold mt-0.5">✓</span>
                  <span className="text-gray-300">{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="card-dark rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-orange-400">Informations pratiques</h3>
              <div className="space-y-4">
                {infos.map((info) => (
                  <div
                    key={info.label}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{info.label}</div>
                      <div className="text-white font-semibold">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="#inscription"
                className="mt-8 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <span>Je m&apos;inscris</span>
                <span>→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}