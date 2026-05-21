'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

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
      { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-white/5 flex flex-col z-10 overflow-y-auto">
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
  );
}
