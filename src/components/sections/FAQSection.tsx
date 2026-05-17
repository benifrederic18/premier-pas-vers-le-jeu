'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: "Dois-je avoir de l'experience pour participer ?",
    a: "Non, cette formation est ouverte aux debutants comme aux amateurs. Aucune experience prealable n'est requise.",
  },
  {
    q: "Le paiement est-il securise ?",
    a: "Oui, nous utilisons FedaPay, une plateforme certifiee pour les paiements Mobile Money. Vos donnees bancaires ne transitent jamais par notre serveur.",
  },
  {
    q: "Quels moyens de paiement sont acceptes ?",
    a: "FedaPay accepte MTN Mobile Money, Moov Money, Celtiis Cash ainsi que les cartes bancaires (Visa, Mastercard).",
  },
  {
    q: "Que se passe-t-il si j'abandonne l'inscription ?",
    a: "Vos donnees sont automatiquement sauvegardees. Vous recevrez un email avec un lien pour finaliser votre paiement.",
  },
  {
    q: "Les places sont-elles vraiment limitees ?",
    a: "Oui, nous acceptons maximum 50 participants pour garantir un suivi personnalise et une experience de qualite.",
  },
  {
    q: "Y a-t-il une attestation a la fin ?",
    a: "Oui, tous les participants recoivent une attestation de participation lors de la restitution du Jour 4, accompagnee de lots surprises.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1 text-orange-400 text-sm font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-4xl font-black">
            Questions <span className="gradient-text">frequentes</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-dark rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                <span className="text-orange-500 text-xl flex-shrink-0">
                  {open === i ? '-' : '+'}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}