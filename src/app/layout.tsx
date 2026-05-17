import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Premier Pas Vers Le Jeu - Formation Jeu d\'Acteur | Cotonou, Bénin',
  description: 'Formation intensive d\'initiation au métier d\'acteur. 24-27 Juin 2025, Cotonou. 30.000 FCFA. Places limitées à 50 participants.',
  keywords: 'formation acteur, jeu d\'acteur, cinéma, Bénin, Cotonou, cours de théâtre',
  openGraph: {
    title: 'Premier Pas Vers Le Jeu',
    description: 'Formation intensive d\'initiation au métier d\'acteur. 24-27 Juin 2025, Cotonou.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-[#0A0A0A] text-white antialiased">{children}</body>
    </html>
  );
}