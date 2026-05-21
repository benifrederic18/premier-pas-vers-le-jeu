'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: '📊', exact: true },
      { href: '/admin/inscriptions', label: 'Inscrits', icon: '👥' },
      { href: '/admin/statistiques', label: 'Statistiques', icon: '📈' },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { href: '/admin/sponsors', label: 'Sponsors & Partenaires', icon: '🤝' },
      { href: '/admin/galerie', label: 'Galerie', icon: '🖼️' },
      { href: '/admin/soutiens', label: 'Soutiens', icon: '❤️' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/admin/communication', label: 'Emails groupés', icon: '📧' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/admins', label: 'Administrateurs', icon: '👤' },
      { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : (pathname === href || (href !== '/admin' && pathname.startsWith(href)));

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-20 md:hidden bg-black border border-white/10 p-2 rounded-xl text-gray-400"
      >
        ☰
      </button>

      <aside className={`fixed left-0 top-0 bottom-0 bg-black border-r border-white/5 flex flex-col z-10 transition-all duration-300 ${collapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="font-black gradient-text text-xs leading-tight">PREMIER PAS<br />VERS LE JEU</h1>
            <p className="text-gray-600 text-xs mt-0.5">Administration</p>
          </div>
          <button onClick={() => setCollapsed(true)} className="text-gray-600 hover:text-gray-400 md:hidden">✕</button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-gray-700 text-xs font-bold uppercase tracking-widest px-2 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, (item as any).exact);
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
                      <span className="text-base">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/50 z-9 md:hidden" onClick={() => setCollapsed(true)} />
      )}
    </>
  );
}
