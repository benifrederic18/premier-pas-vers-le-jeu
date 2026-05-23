'use client';

import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  nom: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'LECTEUR';
  droits: Record<string, boolean> | null;
  actif: boolean;
  createdAt: string;
}

const DROITS_LABELS: Record<string, string> = {
  gererInscriptions: 'Gérer les inscriptions',
  gererSponsors: 'Gérer sponsors & partenaires',
  gererGalerie: 'Gérer la galerie',
  gererParametres: 'Gérer les paramètres',
  voirStatistiques: 'Voir les statistiques',
  gererSoutiens: 'Gérer les soutiens',
  envoyerEmails: 'Envoyer des emails',
};

const emptyForm = {
  nom: '',
  email: '',
  password: '',
  role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'LECTEUR',
  actif: true,
  droits: {} as Record<string, boolean>,
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentRole, setCurrentRole] = useState<string>('ADMIN');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleBootstrap = async () => {
    if (!confirm('Vous promouvoir Super Admin ? (Uniquement si aucun Super Admin n\'existe encore)')) return;
    setBootstrapping(true);
    const res = await fetch('/api/admin/bootstrap', { method: 'POST' });
    const data = await res.json();
    setBootstrapping(false);
    if (res.ok) {
      alert('✅ Vous êtes maintenant Super Admin. Déconnectez-vous et reconnectez-vous pour actualiser vos droits.');
    } else {
      alert(data.error || 'Erreur lors de la promotion.');
    }
  };

  const load = () =>
    fetch('/api/admin/admins')
      .then((r) => r.json())
      .then((d) => {
        setAdmins(d.admins ?? []);
        if (d.currentRole) setCurrentRole(d.currentRole);
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (a: AdminUser) => {
    setEditing(a);
    setForm({ nom: a.nom, email: a.email, password: '', role: a.role, actif: a.actif, droits: (a.droits as Record<string, boolean>) || {} });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.email) return;
    if (!editing && !form.password) { setError('Le mot de passe est obligatoire pour un nouvel admin.'); return; }
    setSaving(true);
    setError('');
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/admins/${editing.id}` : '/api/admin/admins';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Erreur'); return; }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet administrateur ?')) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const roleColors = { SUPER_ADMIN: 'bg-orange-500/20 text-orange-400', ADMIN: 'bg-blue-500/20 text-blue-400', LECTEUR: 'bg-gray-500/20 text-gray-400' };
  const roleLabels = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', LECTEUR: 'Lecteur' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Administrateurs</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les comptes et les droits d'accès</p>
        </div>
        {isSuperAdmin && (
          <button onClick={openNew} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
            <span>+</span> Ajouter un admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="card-dark rounded-2xl p-4 mb-6 border border-orange-500/20">
          <p className="text-orange-300 text-sm mb-3">⚠️ Seul un Super Admin peut gérer les administrateurs.</p>
          <p className="text-gray-500 text-xs mb-3">Si vous êtes le premier utilisateur et qu'aucun Super Admin n'existe, vous pouvez vous promouvoir :</p>
          <button
            onClick={handleBootstrap}
            disabled={bootstrapping}
            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {bootstrapping ? 'En cours...' : '⭐ Me promouvoir Super Admin'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-10 text-center">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {admins.map((a) => (
            <div key={a.id} className={`card-dark rounded-2xl p-4 flex items-center gap-4 transition-opacity ${a.actif ? '' : 'opacity-50'}`}>
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg shrink-0">
                {a.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm">{a.nom}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[a.role]}`}>{roleLabels[a.role]}</span>
                  {!a.actif && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Inactif</span>}
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{a.email}</p>
                {a.droits && Object.keys(a.droits).filter((k) => (a.droits as any)[k]).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {Object.entries(a.droits).filter(([, v]) => v).map(([k]) => (
                      <span key={k} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded">{DROITS_LABELS[k] || k}</span>
                    ))}
                  </div>
                )}
              </div>
              {isSuperAdmin && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(a)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                    Suppr.
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg mb-5">{editing ? 'Modifier' : 'Ajouter'} un administrateur</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">{error}</div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Nom *</label>
                  <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Rôle</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                    <option value="ADMIN">Admin</option>
                    <option value="LECTEUR">Lecteur</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Mot de passe {editing ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
              </div>

              {form.role === 'ADMIN' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Droits spécifiques</label>
                  <div className="space-y-2">
                    {Object.entries(DROITS_LABELS).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.droits[key] || false}
                          onChange={(e) => setForm({ ...form, droits: { ...form.droits, [key]: e.target.checked } })}
                          className="accent-orange-500"
                        />
                        <span className="text-sm text-gray-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="accent-orange-500" />
                <span className="text-sm text-gray-400">Compte actif</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || !form.nom || !form.email}
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
