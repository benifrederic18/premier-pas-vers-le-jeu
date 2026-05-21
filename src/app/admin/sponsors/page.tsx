'use client';

import { useEffect, useState } from 'react';

interface Sponsor {
  id: string;
  nom: string;
  logoUrl: string;
  siteWeb: string | null;
  description: string | null;
  type: 'SPONSOR' | 'PARTENAIRE';
  ordre: number;
  actif: boolean;
}

const emptyForm = {
  nom: '',
  logoUrl: '',
  siteWeb: '',
  description: '',
  type: 'PARTENAIRE' as 'SPONSOR' | 'PARTENAIRE',
  ordre: 0,
  actif: true,
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch('/api/admin/sponsors')
      .then((r) => r.json())
      .then(setSponsors)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: Sponsor) => {
    setEditing(s);
    setForm({ nom: s.nom, logoUrl: s.logoUrl, siteWeb: s.siteWeb || '', description: s.description || '', type: s.type, ordre: s.ordre, actif: s.actif });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'ppvlj/sponsors');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, logoUrl: data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.nom || !form.logoUrl) return;
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/sponsors/${editing.id}` : '/api/admin/sponsors';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce sponsor/partenaire ?')) return;
    await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActif = async (s: Sponsor) => {
    await fetch(`/api/admin/sponsors/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, actif: !s.actif }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Sponsors & Partenaires</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les logos affichés sur le site</p>
        </div>
        <button onClick={openNew} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          <span>+</span> Ajouter
        </button>
      </div>

      {/* Demandes reçues */}
      <DemandesPartenariat />

      {/* Liste */}
      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : sponsors.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">🤝</p>
          <p>Aucun sponsor ou partenaire pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((s) => (
            <div key={s.id} className={`card-dark rounded-2xl p-4 flex flex-col gap-3 transition-opacity ${s.actif ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-3">
                <img src={s.logoUrl} alt={s.nom} className="w-16 h-16 object-contain rounded-xl bg-white/5 p-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{s.nom}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.type === 'SPONSOR' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {s.type === 'SPONSOR' ? 'Sponsor' : 'Partenaire'}
                  </span>
                </div>
              </div>
              {s.description && <p className="text-gray-500 text-xs line-clamp-2">{s.description}</p>}
              {s.siteWeb && <a href={s.siteWeb} target="_blank" className="text-orange-400 text-xs hover:underline truncate">{s.siteWeb}</a>}
              <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                <button onClick={() => toggleActif(s)} className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${s.actif ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                  {s.actif ? '✓ Visible' : 'Masqué'}
                </button>
                <button onClick={() => openEdit(s)} className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
                  Modifier
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-white font-bold text-lg mb-5">{editing ? 'Modifier' : 'Ajouter'} un sponsor/partenaire</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nom *</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Nom de l'organisation" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Logo *</label>
                {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="w-20 h-20 object-contain rounded-xl bg-white/5 p-1 mb-2" />}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors">
                    {uploading ? 'Upload...' : '📁 Choisir un fichier'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                  {form.logoUrl && <span className="text-green-400 text-xs">✓ Chargé</span>}
                </label>
                <div className="mt-2">
                  <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-orange-500" placeholder="Ou coller une URL..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    <option value="PARTENAIRE">Partenaire</option>
                    <option value="SPONSOR">Sponsor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Ordre d'affichage</label>
                  <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Site web</label>
                <input value={form.siteWeb} onChange={(e) => setForm({ ...form, siteWeb: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="accent-orange-500" />
                <span className="text-sm text-gray-400">Visible sur le site</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition-all">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || !form.nom || !form.logoUrl}
                className="flex-[2] bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DemandesPartenariat() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = () =>
    fetch('/api/admin/partenaires?traite=false')
      .then((r) => r.json())
      .then(setDemandes)
      .catch(() => {});

  useEffect(() => { load(); }, []);

  const marquerTraite = async (id: string) => {
    await fetch('/api/admin/partenaires', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, traite: true }) });
    load();
  };

  if (demandes.length === 0) return null;

  return (
    <div className="card-dark rounded-2xl p-4 mb-6 border border-orange-500/20">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <span className="text-orange-400 font-semibold text-sm">🔔 {demandes.length} nouvelle(s) demande(s) de partenariat</span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {demandes.map((d) => (
            <div key={d.id} className="bg-white/5 rounded-xl p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white font-medium">{d.nom} — <span className="text-gray-400">{d.organisation}</span></p>
                  <p className="text-gray-500 text-xs mt-0.5">{d.email} · {d.telephone}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{d.message}</p>
                </div>
                <button onClick={() => marquerTraite(d.id)} className="shrink-0 bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-lg hover:bg-green-500/20">
                  ✓ Traité
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
