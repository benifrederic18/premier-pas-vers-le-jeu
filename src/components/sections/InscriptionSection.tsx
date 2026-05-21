'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const FormInscription = dynamic(() => import('../forms/FormInscription'), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  ),
});

export default function InscriptionSection() {
  const [params, setParams] = useState<{ formationActive: boolean; messageInscriptionFermee?: string; placesDisponibles?: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/parametres')
      .then((r) => r.json())
      .then(setParams)
      .catch(() => setParams({ formationActive: true }));
  }, []);

  return (
    <section id="inscription" className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1 text-orange-400 text-sm font-medium mb-4">
            ✍️ INSCRIPTION
          </div>
          <h2 className="text-4xl font-black mb-3">
            Réservez votre <span className="gradient-text">place</span>
          </h2>
          <p className="text-gray-500">
            Complétez le formulaire en 3 étapes simples et payez de façon sécurisée
          </p>
          {params?.placesDisponibles && (
            <p className="mt-3 text-orange-400 font-semibold text-sm">
              👥 {params.placesDisponibles} places maximum
            </p>
          )}
        </motion.div>

        {/* Inscriptions fermées */}
        {params && !params.formationActive ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card-dark rounded-3xl p-10 text-center border border-red-500/20">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-white text-2xl font-black mb-3">Inscriptions fermées</h3>
              <p className="text-gray-400 leading-relaxed">
                {params.messageInscriptionFermee ||
                  'Les inscriptions sont actuellement fermées. Suivez nos réseaux sociaux pour être informé de la prochaine édition.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <FormInscription />
        )}
      </div>
    </section>
  );
}
