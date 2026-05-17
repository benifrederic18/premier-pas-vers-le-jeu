'use client';

import { useState } from 'react';

const DESTINATAIRES = [
  { value: 'TOUS', label: 'Tous les inscrits' },
  { value: 'PAYES', label: 'Uniquement les payés' },
  { value: 'NON_PAYES', label: 'Uniquement les non-payés' },
];

const VARIABLES = ['{{prenoms}}', '{{nom}}', '{{email}}', '{{telephone}}'];

export default function CommunicationPage() {
  const [destinataires, setDestinataires] = useState('PAYES');
  const [sujet, setSujet] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ envoyes: number; echecs: number; total: number } | null>(null);

  const handleSend = async () => {
    if (!sujet.trim() || !htmlContent.trim()) {
      alert('Veuillez remplir le sujet et le message.');
      return;
    }
    if (!confirm(`Envoyer cet email à tous les inscrits sélectionnés ? Cette action est irréversible.`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/email-groupe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sujet, htmlContent, destinataires }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert('Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Communication</h1>
        <p className="text-gray-500 text-sm mt-1">Envoi d'emails groupés aux participants</p>
      </div>

      <div className="card-dark rounded-2xl p-6 space-y-6">
        {/* Destinataires */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Destinataires</label>
          <div className="space-y-2">
            {DESTINATAIRES.map((d) => (
              <label key={d.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={d.value}
                  checked={destinataires === d.value}
                  onChange={(e) => setDestinataires(e.target.value)}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-gray-300 text-sm">{d.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sujet */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Objet de l'email</label>
          <input
            type="text"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Ex : Rappel important - Formation du 24 juin"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-300">Message (HTML)</label>
            <div className="flex gap-2">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  onClick={() => setHtmlContent((prev) => prev + v)}
                  className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500/20 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={10}
            placeholder={`<p>Bonjour {{prenoms}},</p>\n<p>...</p>`}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
          <p className="text-gray-600 text-xs mt-1">Vous pouvez utiliser du HTML. Les variables {'{{prenoms}}'}, {'{{nom}}'}, etc. seront remplac&eacute;es automatiquement.</p>
        </div>

        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm">
            <p className="text-green-400 font-medium">✓ Email envoyé avec succès</p>
            <p className="text-gray-400 mt-1">{result.envoyes} envoyés · {result.echecs} échecs · {result.total} total</p>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            'Envoyer à tous →'
          )}
        </button>
      </div>
    </div>
  );
}