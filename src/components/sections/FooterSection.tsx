export default function FooterSection() {
  return (
    <footer className="bg-black border-t border-white/5 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-orange-500 font-black text-lg mb-3">PREMIER PAS VERS LE JEU</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Formation intensive d&apos;initiation au métier d&apos;acteur. Cotonou, Bénin.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <div className="space-y-2 text-gray-500 text-sm">
              <p>📞 01 44 82 85 09</p>
              <p>📞 95 95 91 00</p>
              <p>📍 Cotonou, Bénin</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Formation</h4>
            <div className="space-y-2 text-gray-500 text-sm">
              <p>📅 24 au 27 Juin 2025</p>
              <p>💰 30.000 FCFA</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2025 Premier Pas Vers Le Jeu. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="/politique-confidentialite" className="hover:text-gray-400 transition-colors">
              Politique de confidentialité
            </a>
            <a href="/mentions-legales" className="hover:text-gray-400 transition-colors">
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}