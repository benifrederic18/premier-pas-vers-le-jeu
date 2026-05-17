'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊' },
  { href: '/admin/inscriptions', label: 'Inscrits', icon: '👥' },
  { href: '/admin/communication', label: 'Communication', icon: '📧' },
  { href: '/admin/statistiques', label: 'Statistiques', icon: '📈' },
  { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-white/5 flex flex-col z-10">
      <div className="p-6 border-b border-white/5">
        <h1 className="font-black gradient-text text-sm leading-tight">PREMIER PAS<br />VERS LE JEU</h1>
        <p className="text-gray-600 text-xs mt-1">Administration</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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
  );
}