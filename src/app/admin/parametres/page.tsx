'use client';

import { useEffect, useState } from 'react';

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
            ...d,
            dateDebut: d.dateDebut ? d.dateDebut.split('T')[0] : '',
            dateFin: d.dateFin ? d.dateFin.split('T')[0] : '',
          });
        } else {
          setParams({
            formationActive: true,
            placesDisponibles: 50,
            tarifFormation: 30000,
            dateDebut: '2025-06-24',
            dateFin: '2025-06-27',
            delaiRelanceMinutes: 10,
          });
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

  if (loading || !params) {
    return <div className="flex items-center justify-center py-20 text-gray-600">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration de la formation</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Statut */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Statut de la formation</h3>
          <div className="flex gap-4">
            {[
              { value: true, label: '✅ Inscriptions ouvertes' },
              { value: false, label: '🔒 Inscriptions fermées' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setParams({ ...params, formationActive: opt.value })}
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
        </div>

        {/* Chiffres */}
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">Configuration</h3>
          {[
            { label: 'Places disponibles', key: 'placesDisponibles', type: 'number', suffix: 'participants' },
            { label: 'Tarif de la formation', key: 'tarifFormation', type: 'number', suffix: 'FCFA' },
            { label: 'Délai de relance automatique', key: 'delaiRelanceMinutes', type: 'number', suffix: 'minutes' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{field.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type={field.type}
                  value={params[field.key]}
                  onChange={(e) => setParams({ ...params, [field.key]: e.target.value })}
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
                onChange={(e) => setParams({ ...params, dateDebut: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Date de fin</label>
              <input
                type="date"
                value={params.dateFin}
                onChange={(e) => setParams({ ...params, dateFin: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
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