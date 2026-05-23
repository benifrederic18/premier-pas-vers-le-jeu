'use client';

import { useEffect, useState } from 'react';

interface Template {
  id: string;
  cle: string;
  nom: string;
  sujet: string;
  corps: string;
  actif: boolean;
  updatedAt: string;
}

const VARIABLES_COMMUNES = ['{{prenoms}}', '{{nom}}', '{{email}}', '{{montant}}'];
const VARIABLES_SPEC: Record<string, string[]> = {
  RELANCE_PAIEMENT: ['{{lienPaiement}}'],
  RELANCE_TRANCHE2: ['{{lienTranche2}}'],
  LIEN_WHATSAPP: ['{{lienWhatsapp}}'],
  ECHEC_PAIEMENT_MOMO: ['{{momoNumero}}', '{{momoNom}}', '{{momoWhatsapp}}'],
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ sujet: '', corps: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () =>
    fetch('/api/admin/templates')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTemplates(d))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ sujet: t.sujet, corps: t.corps });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch('/api/admin/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, sujet: form.sujet, corps: form.corps }),
    });
    if (res.ok) {
      setSaved(true);
      load();
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const insertVar = (v: string) => {
    setForm((f) => ({ ...f, corps: f.corps + v }));
  };

  const vars = editing ? [...VARIABLES_COMMUNES, ...(VARIABLES_SPEC[editing.cle] || [])] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Templates emails</h1>
        <p className="text-gray-500 text-sm mt-1">Personnalisez tous les messages envoyés automatiquement</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Liste des templates */}
        <div className="md:col-span-1">
          {loading ? (
            <div className="text-gray-500 text-center py-8">Chargement...</div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openEdit(t)}
                  className={`w-full text-left card-dark rounded-xl p-4 transition-all ${
                    editing?.id === t.id
                      ? 'border border-orange-500/40 bg-orange-500/5'
                      : 'border border-transparent hover:border-white/10'
                  }`}
                >
                  <p className="text-white text-sm font-semibold">{t.nom}</p>
                  <p className="text-gray-600 text-xs mt-0.5 truncate">{t.sujet}</p>
                  <p className="text-gray-700 text-xs mt-1 font-mono">{t.cle}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Éditeur */}
        <div className="md:col-span-2">
          {!editing ? (
            <div className="card-dark rounded-2xl p-10 text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <p className="text-4xl mb-3">✉️</p>
                <p>Sélectionnez un template à modifier</p>
              </div>
            </div>
          ) : (
            <div className="card-dark rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold">{editing.nom}</h2>
                  <p className="text-gray-600 text-xs font-mono mt-0.5">{editing.cle}</p>
                </div>
                {saved && <span className="text-green-400 text-sm">✓ Sauvegardé</span>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Objet de l'email</label>
                <input
                  value={form.sujet}
                  onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-400">Corps du message (HTML)</label>
                  <div className="flex flex-wrap gap-1">
                    {vars.map((v) => (
                      <button
                        key={v}
                        onClick={() => insertVar(v)}
                        className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded hover:bg-orange-500/20"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={form.corps}
                  onChange={(e) => setForm({ ...form, corps: e.target.value })}
                  rows={14}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-orange-500 resize-none"
                />
                <p className="text-gray-600 text-xs mt-1">HTML supporté. Les variables entre {'{{'}crochets{'}}'} sont remplacées automatiquement.</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder ce template'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
