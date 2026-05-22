'use client';

import { useEffect, useState } from 'react';

interface Membre {
  id: string;
  nom: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  type: 'VISIONNAIRE' | 'EQUIPE' | 'FORMATEUR';
  ordre: number;
  actif: boolean;
  reseaux: any;
}

const emptyForm = {
  nom: '',
  role: '',
  bio: '',
  photoUrl: '',
  type: 'EQUIPE' as 'VISIONNAIRE' | 'EQUIPE' | 'FORMATEUR',
  ordre: 0,
  actif: true,
  reseaux: { instagram: '', facebook: '', linkedin: '' } as Record<string, string>,
};

const typeLabels = {
  VISIONNAIRE: { label: '🌟 Visionnaire', color: 'text-yellow-400 bg-yellow-400/10' },
  FORMATEUR: { label: '🎭 Formateur', color: 'text-blue-400 bg-blue-400/10' },
  EQUIPE: { label: '👥 Équipe', color: 'text-green-400 bg-green-400/10' },
};

export default function EquipePage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Membre | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch('/api/admin/equipe')
      .then((r) => r.json())
      .then(setMembres)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (m: Membre) => {
    setEditing(m);
    setForm({
      nom: m.nom, role: m.role, bio: m.bio || '', photoUrl: m.photoUrl || '',
      type: m.type, ordre: m.ordre, actif: m.actif,
      reseaux: m.reseaux || { instagram: '', facebook: '', linkedin: '' },
    });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'ppvlj/equipe');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, photoUrl: data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.nom || !form.role) return;
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/equipe/${editing.id}` : '/api/admin/equipe';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce membre ?')) return;
    await fetch(`/api/admin/equipe/${id}`, { method: 'DELETE' });
    load();
  };

  const grouped = {
    VISIONNAIRE: membres.filter((m) => m.type === 'VISIONNAIRE'),
    FORMATEUR: membres.filter((m) => m.type === 'FORMATEUR'),
    EQUIPE: membres.filter((m) => m.type === 'EQUIPE'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Équipe & Visionnaire</h1>
          <p className="text-gray-500 text-sm mt-1">Présentez les personnes derrière la formation</p>
        </div>
        <button onClick={openNew} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <span>+</span> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : membres.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">👥</p>
          <p>Aucun membre ajouté. Commencez par le visionnaire !</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(['VISIONNAIRE', 'FORMATEUR', 'EQUIPE'] as const).map((type) => {
            const list = grouped[type];
            if (list.length === 0) return null;
            return (
              <div key={type}>
                <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">{typeLabels[type].label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((m) => (
                    <div key={m.id} className={`card-dark rounded-2xl p-4 flex gap-4 transition-opacity ${m.actif ? '' : 'opacity-50'}`}>
                      <div className="shrink-0">
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.nom} className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/30" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">👤</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{m.nom}</p>
                        <p className="text-orange-400 text-xs">{m.role}</p>
                        {m.bio && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{m.bio}</p>}
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => openEdit(m)} className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(m.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                            Suppr.
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg mb-5">{editing ? 'Modifier' : 'Ajouter'} un membre</h2>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Rôle dans la structure</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['VISIONNAIRE', 'FORMATEUR', 'EQUIPE'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className={`py-2 rounded-xl border text-xs transition-all ${form.type === t ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                      {typeLabels[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Photo</label>
                {form.photoUrl && <img src={form.photoUrl} alt="Photo" className="w-16 h-16 rounded-full object-cover border-2 border-orange-500/30 mb-2" />}
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <span className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors">
                    {uploading ? 'Upload...' : '📁 Choisir une photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-orange-500" placeholder="Ou URL directe..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nom complet *</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex : Jean Dupont" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Titre / Fonction *</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex : Directeur artistique" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Biographie</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Courte présentation..." />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Réseaux sociaux</label>
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                ].map((r) => (
                  <div key={r.key} className="mb-2">
                    <input value={form.reseaux[r.key] || ''} onChange={(e) => setForm({ ...form, reseaux: { ...form.reseaux, [r.key]: e.target.value } })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-orange-500" placeholder={r.placeholder} />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1.5">Ordre d'affichage</label>
                  <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-5">
                  <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="accent-orange-500" />
                  <span className="text-sm text-gray-400">Visible</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition-all">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || !form.nom || !form.role}
                className="flex-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
