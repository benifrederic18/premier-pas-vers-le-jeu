'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Tableau de bord',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: '📊' },
      { href: '/admin/inscriptions', label: 'Inscrits', icon: '👥' },
      { href: '/admin/statistiques', label: 'Statistiques', icon: '📈' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/admin/communication', label: 'Emails groupés', icon: '📧' },
      { href: '/admin/soutiens', label: 'Soutiens & Votes', icon: '🏆' },
      { href: '/admin/codes-paiement', label: 'Codes paiement', icon: '🔑' },
    ],
  },
  {
    label: 'Contenu du site',
    items: [
      { href: '/admin/equipe', label: 'Équipe', icon: '🌟' },
      { href: '/admin/galerie', label: 'Galerie', icon: '🖼️' },
      { href: '/admin/sponsors', label: 'Sponsors', icon: '🤝' },
      { href: '/admin/partenaires', label: 'Demandes partenariat', icon: '📩' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/admins', label: 'Admins & droits', icon: '🔐' },
      { href: '/admin/templates', label: 'Templates emails', icon: '✉️' },
      { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
    ],
  },
];

// Flat list for the mobile bottom bar (5 most important)
const bottomNav = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/inscriptions', label: 'Inscrits', icon: '👥' },
  { href: '/admin/communication', label: 'Emails', icon: '📧' },
  { href: '/admin/codes-paiement', label: 'Codes', icon: '🔑' },
  { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-white/5 flex-col z-10 overflow-y-auto">
        <div className="p-6 border-b border-white/5 shrink-0">
          <h1 className="font-black gradient-text text-sm leading-tight">PREMIER PAS<br />VERS LE JEU</h1>
          <p className="text-gray-600 text-xs mt-1">Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-gray-700 text-xs uppercase tracking-widest font-semibold mb-2 px-3">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-black border-b border-white/5 flex items-center justify-between px-4 h-14">
        <h1 className="font-black gradient-text text-xs leading-tight">PREMIER PAS VERS LE JEU</h1>
        <button
          onClick={() => setOpen(true)}
          className="text-gray-400 hover:text-white p-2"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-[#0a0a0a] border-r border-white/5 flex flex-col h-full overflow-y-auto">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h1 className="font-black gradient-text text-sm">PREMIER PAS VERS LE JEU</h1>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-gray-700 text-xs uppercase tracking-widest font-semibold mb-1.5 px-3">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                            active
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : 'text-gray-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5">
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
              >
                <span>🚪</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile bottom navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-black border-t border-white/5 flex items-center justify-around h-16 px-1">
        {bottomNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all flex-1 ${
                active ? 'text-orange-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
