'use client';

import { useEffect, useState } from 'react';

interface Media {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  url: string;
  miniature: string | null;
  titre: string;
  edition: string | null;
  ordre: number;
  actif: boolean;
}

const emptyForm = {
  type: 'PHOTO' as 'PHOTO' | 'VIDEO',
  url: '',
  miniature: '',
  titre: '',
  edition: '',
  ordre: 0,
  actif: true,
};

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  return null;
}

export default function GaleriePage() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Media | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PHOTO' | 'VIDEO'>('ALL');

  const load = () =>
    fetch('/api/admin/galerie')
      .then((r) => r.json())
      .then(setMedias)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (m: Media) => {
    setEditing(m);
    setForm({ type: m.type, url: m.url, miniature: m.miniature || '', titre: m.titre, edition: m.edition || '', ordre: m.ordre, actif: m.actif });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'ppvlj/galerie');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      setForm((f) => ({
        ...f,
        url: data.url,
        miniature: data.url,
      }));
    }
    setUploading(false);
  };

  const handleUrlChange = (url: string) => {
    const thumb = getYoutubeThumbnail(url);
    setForm((f) => ({ ...f, url, miniature: thumb || f.miniature }));
  };

  const handleSave = async () => {
    if (!form.url || !form.titre) return;
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/galerie/${editing.id}` : '/api/admin/galerie';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce média ?')) return;
    await fetch(`/api/admin/galerie/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActif = async (m: Media) => {
    await fetch(`/api/admin/galerie/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...m, actif: !m.actif }),
    });
    load();
  };

  const filtered = medias.filter((m) => filter === 'ALL' || m.type === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Galerie</h1>
          <p className="text-gray-500 text-sm mt-1">Photos et vidéos des anciennes éditions</p>
        </div>
        <button onClick={openNew} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
          <span>+</span> Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'ALL', label: 'Tout' },
          { value: 'PHOTO', label: '📷 Photos' },
          { value: 'VIDEO', label: '🎬 Vidéos' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${filter === f.value ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-sm self-center">{filtered.length} éléments</span>
      </div>

      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="card-dark rounded-2xl p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">🖼️</p>
          <p>Aucun média pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className={`card-dark rounded-2xl overflow-hidden transition-opacity ${m.actif ? '' : 'opacity-50'}`}>
              <div className="relative aspect-video bg-black/50">
                {m.miniature ? (
                  <img src={m.miniature} alt={m.titre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">{m.type === 'VIDEO' ? '🎬' : '🖼️'}</div>
                )}
                {m.type === 'VIDEO' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white">▶</div>
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${m.type === 'VIDEO' ? 'bg-purple-500/80 text-white' : 'bg-blue-500/80 text-white'}`}>
                  {m.type}
                </span>
              </div>
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate">{m.titre}</p>
                {m.edition && <p className="text-gray-500 text-xs mt-0.5">{m.edition}</p>}
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => toggleActif(m)} className={`flex-1 text-xs py-1 rounded-lg transition-colors ${m.actif ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                    {m.actif ? 'Visible' : 'Masqué'}
                  </button>
                  <button onClick={() => openEdit(m)} className="flex-1 text-xs py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10">
                    Édit.
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="flex-1 text-xs py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                    Supp.
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg mb-5">{editing ? 'Modifier' : 'Ajouter'} un média</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Type</label>
                <div className="flex gap-3">
                  {['PHOTO', 'VIDEO'].map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t as any })}
                      className={`flex-1 py-2.5 rounded-xl border text-sm transition-all ${form.type === t ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                      {t === 'PHOTO' ? '📷 Photo' : '🎬 Vidéo'}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === 'PHOTO' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Upload photo</label>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <span className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors">
                      {uploading ? 'Upload...' : '📁 Choisir une image'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                  </label>
                  {form.url && <img src={form.url} alt="Aperçu" className="w-full h-32 object-cover rounded-xl mb-2" />}
                  <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-orange-500" placeholder="Ou URL directe..." />
                </div>
              )}

              {form.type === 'VIDEO' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Lien YouTube ou URL vidéo *</label>
                  <input value={form.url} onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="https://youtube.com/watch?v=..." />
                  {form.miniature && <img src={form.miniature} alt="Miniature" className="w-full h-24 object-cover rounded-xl mt-2" />}
                  <div className="mt-2">
                    <input value={form.miniature} onChange={(e) => setForm({ ...form, miniature: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-orange-500" placeholder="URL de la miniature (optionnel)" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Titre *</label>
                <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex : Atelier improvisation" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Édition</label>
                  <input value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex : 2024" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Ordre</label>
                  <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
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
              <button onClick={handleSave} disabled={saving || !form.url || !form.titre}
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
