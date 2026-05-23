'use client';

import { useEffect, useState } from 'react';

const defaultParams = {
  formationActive: true,
  messageInscriptionFermee: '',
  placesDisponibles: 50,
  tarifFormation: 30000,
  tarifTranche: 15000,
  dateDebut: '2025-06-24',
  dateFin: '2025-06-27',
  delaiRelanceMinutes: 10,
  delaiRelanceTranche2Jours: 7,
  lienWhatsapp: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  emailGmail: '',
  momoNumero: '',
  momoNom: '',
  momoWhatsapp: '',
  momoActif: false,
};

export default function ParametresPage() {
  const [params, setParams] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/parametres')
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setParams({
            ...defaultParams,
            ...d,
            dateDebut: d.dateDebut ? d.dateDebut.split('T')[0] : defaultParams.dateDebut,
            dateFin: d.dateFin ? d.dateFin.split('T')[0] : defaultParams.dateFin,
          });
        } else {
          setParams(defaultParams);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/parametres', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (key: string, val: any) => setParams((p: any) => ({ ...p, [key]: val }));

  if (loading || !params) {
    return <div className="flex items-center justify-center py-20 text-gray-600">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration complète du site</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Statut inscriptions */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Statut des inscriptions</h3>
          <div className="flex gap-4 mb-4">
            {[
              { value: true, label: '✅ Inscriptions ouvertes' },
              { value: false, label: '🔒 Inscriptions fermées' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => set('formationActive', opt.value)}
                className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${
                  params.formationActive === opt.value
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {!params.formationActive && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Message affiché sur le site</label>
              <textarea
                value={params.messageInscriptionFermee || ''}
                onChange={(e) => set('messageInscriptionFermee', e.target.value)}
                rows={3}
                placeholder="Ex : Les inscriptions sont temporairement fermées. Revenez bientôt !"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>
          )}
        </div>

        {/* Tarifs et places */}
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">Tarifs & capacité</h3>
          {[
            { label: 'Places disponibles', key: 'placesDisponibles', suffix: 'participants' },
            { label: 'Tarif paiement complet', key: 'tarifFormation', suffix: 'FCFA' },
            { label: 'Tarif par tranche (×2)', key: 'tarifTranche', suffix: 'FCFA' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{field.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={params[field.key]}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
                <span className="text-gray-500 text-sm">{field.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dates */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Dates de la formation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Date de début</label>
              <input
                type="date"
                value={params.dateDebut}
                onChange={(e) => set('dateDebut', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Date de fin</label>
              <input
                type="date"
                value={params.dateFin}
                onChange={(e) => set('dateFin', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Relances automatiques */}
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">Relances automatiques</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Délai relance paiement initial</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={params.delaiRelanceMinutes}
                onChange={(e) => set('delaiRelanceMinutes', e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
              <span className="text-gray-500 text-sm">minutes</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Délai relance 2ème tranche</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={params.delaiRelanceTranche2Jours}
                onChange={(e) => set('delaiRelanceTranche2Jours', e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
              <span className="text-gray-500 text-sm">jours</span>
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">💬 Lien groupe WhatsApp</h3>
          <p className="text-gray-500 text-xs mb-3">Ce lien est envoyé automatiquement aux participants après paiement complet.</p>
          <input
            type="url"
            value={params.lienWhatsapp || ''}
            onChange={(e) => set('lienWhatsapp', e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Réseaux sociaux */}
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">📱 Réseaux sociaux</h3>
          {[
            { label: 'Facebook', key: 'facebookUrl', icon: '📘', placeholder: 'https://facebook.com/...' },
            { label: 'Instagram', key: 'instagramUrl', icon: '📸', placeholder: 'https://instagram.com/...' },
            { label: 'YouTube', key: 'youtubeUrl', icon: '🎬', placeholder: 'https://youtube.com/...' },
            { label: 'TikTok', key: 'tiktokUrl', icon: '🎵', placeholder: 'https://tiktok.com/@...' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{field.icon} {field.label}</label>
              <input
                type="url"
                value={params[field.key] || ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Email Gmail */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">📧 Email de contact public</h3>
          <input
            type="email"
            value={params.emailGmail || ''}
            onChange={(e) => set('emailGmail', e.target.value)}
            placeholder="contact@exemple.com"
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* MoMo fallback */}
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">📱 Paiement MoMo (fallback)</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.momoActif || false}
                onChange={(e) => set('momoActif', e.target.checked)}
                className="accent-orange-500"
              />
              <span className="text-sm text-gray-400">Activer</span>
            </label>
          </div>
          <p className="text-gray-500 text-xs">Quand le paiement FedaPay échoue, ces infos seront affichées à l'apprenant.</p>
          {[
            { label: 'Numéro MoMo', key: 'momoNumero', placeholder: '229 XX XX XX XX', type: 'text' },
            { label: 'Nom du compte MoMo', key: 'momoNom', placeholder: 'Nom affiché sur le compte', type: 'text' },
            { label: 'WhatsApp (pour capture)', key: 'momoWhatsapp', placeholder: '22900000000 (avec indicatif)', type: 'text' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-400 mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={params[field.key] || ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={!params.momoActif}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-40"
              />
            </div>
          ))}
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm text-center">
            ✓ Paramètres sauvegardés avec succès
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}
