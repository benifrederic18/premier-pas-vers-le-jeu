'use client';

import { useState, useRef } from 'react';
import type { FormDataState } from './FormInscription';

interface Props {
  data: FormDataState;
  update: (d: Partial<FormDataState>) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function Etape3({ data, update, onSubmit, onBack, loading }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consentement, setConsentement] = useState(data.consentement);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop volumineuse. Maximum 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    update({ photoFile: file });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!consentement) {
      setError('Vous devez accepter la politique de confidentialité pour continuer.');
      return;
    }
    update({ consentement });
    onSubmit();
  };

  const montantAffiche =
    data.modePaiement === 'TRANCHE'
      ? '15 000 FCFA × 2 tranches'
      : '30 000 FCFA';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Options & Photo</h3>
        <p className="text-gray-500 text-sm mt-1">Étape 3 sur 3 — Choisissez vos options</p>
      </div>

      {/* Mode de participation */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Mode de participation</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: 'PRESENTIEL' as const,
              label: '🏛️ Présentiel',
              desc: 'Cotonou, Bénin',
            },
            {
              value: 'EN_LIGNE' as const,
              label: '💻 En ligne',
              desc: 'Partout dans le monde',
            },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ modeParticipation: opt.value })}
              className={`p-4 rounded-xl border text-left transition-all ${
                data.modeParticipation === opt.value
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <p className={`font-semibold text-sm ${data.modeParticipation === opt.value ? 'text-orange-400' : 'text-white'}`}>
                {opt.label}
              </p>
              <p className="text-gray-500 text-xs mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode de paiement */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Mode de paiement</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              value: 'COMPLET' as const,
              label: '✅ Paiement complet',
              price: '30 000 FCFA',
              desc: 'Paiement unique, inscription confirmée immédiatement',
              badge: null,
            },
            {
              value: 'TRANCHE' as const,
              label: '📅 Paiement en 2 fois',
              price: '15 000 × 2',
              desc: 'Payez 15 000 FCFA maintenant, puis 15 000 FCFA plus tard',
              badge: 'Flexible',
            },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ modePaiement: opt.value })}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                data.modePaiement === opt.value
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {opt.badge && (
                <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  {opt.badge}
                </span>
              )}
              <p className={`font-semibold text-sm ${data.modePaiement === opt.value ? 'text-orange-400' : 'text-white'}`}>
                {opt.label}
              </p>
              <p className={`text-lg font-black mt-1 ${data.modePaiement === opt.value ? 'text-orange-300' : 'text-gray-300'}`}>
                {opt.price}
              </p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
        {data.modePaiement === 'TRANCHE' && (
          <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-orange-300 text-xs">
            ℹ️ Vous serez relancé automatiquement pour la 2ème tranche. Votre inscription sera pleinement confirmée après le paiement complet.
          </div>
        )}
      </div>

      {/* Zone d'upload photo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Photo de profil <span className="text-gray-600">(optionnelle)</span>
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all group"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />
          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <img src={preview} alt="Aperçu" className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 glow" />
              <p className="text-green-400 text-sm font-medium">✓ Photo sélectionnée</p>
              <p className="text-gray-600 text-xs">Cliquez pour changer</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm">
                <span className="text-orange-400 font-medium">Cliquez pour uploader</span> ou glissez-déposez
              </p>
              <p className="text-xs">JPG, PNG, WEBP — Max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Récapitulatif */}
      <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
        <p className="text-gray-400 font-medium mb-3">📋 Récapitulatif de votre inscription :</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="text-gray-500">Nom</span>
          <span className="text-white">{data.nom} {data.prenoms}</span>
          <span className="text-gray-500">Email</span>
          <span className="text-white truncate">{data.email}</span>
          <span className="text-gray-500">Téléphone</span>
          <span className="text-white">{data.telephone}</span>
          <span className="text-gray-500">Mode</span>
          <span className="text-white">{data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel'}</span>
          <span className="text-gray-500">Paiement</span>
          <span className="text-orange-400 font-bold">{montantAffiche}</span>
        </div>
      </div>

      {/* Consentement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consentement}
          onChange={(e) => setConsentement(e.target.checked)}
          className="mt-1 w-4 h-4 rounded accent-orange-500"
        />
        <span className="text-sm text-gray-400 leading-relaxed">
          J'accepte la{' '}
          <a href="/politique-confidentialite" className="text-orange-400 hover:underline" target="_blank">
            politique de confidentialité
          </a>{' '}
          et le traitement de mes données personnelles dans le cadre de cette inscription.
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white py-3 rounded-xl transition-all text-sm"
          disabled={loading}
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Traitement...</span>
            </>
          ) : (
            <>
              <span>
                Payer {data.modePaiement === 'TRANCHE' ? '15 000 FCFA' : '30 000 FCFA'}
              </span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
