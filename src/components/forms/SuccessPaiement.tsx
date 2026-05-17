'use client';

import { motion } from 'framer-motion';

export default function SuccessPaiement({ url }: { url: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-6 card-dark rounded-2xl max-w-md mx-auto"
    >
      <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 glow">
        <span className="text-4xl">🎬</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Inscription sauvegardée !</h3>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Vos informations ont été enregistrées. Vous allez être redirigé vers la page de paiement sécurisé.
      </p>
      <a
        href={url}
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3 rounded-xl transition-colors"
      >
        <span>Procéder au paiement</span>
        <span>→</span>
      </a>
      <p className="text-gray-600 text-xs mt-4">Paiement sécurisé via FedaPay</p>
    </motion.div>
  );
}