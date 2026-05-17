'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { etape2Schema, Etape2Data } from '@/lib/validations';
import type { FormDataState } from './FormInscription';
import { useState } from 'react';

interface Props {
  data: FormDataState;
  update: (d: Partial<FormDataState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Etape2({ data, update, onNext, onBack }: Props) {
  const [charCount, setCharCount] = useState(data.motivation.length);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Etape2Data>({
    resolver: zodResolver(etape2Schema),
    defaultValues: {
      dejaForme: data.dejaForme ?? undefined,
      professionnel: data.professionnel ?? undefined,
      motivation: data.motivation,
    },
  });

  const dejaForme = watch('dejaForme');
  const professionnel = watch('professionnel');

  const onSubmit = (values: Etape2Data) => {
    update(values);
    onNext();
  };

  const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    error,
  }: {
    label: string;
    name: string;
    value: boolean | undefined;
    onChange: (v: boolean) => void;
    error?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex gap-3">
        {[
          { label: 'Oui', value: true },
          { label: 'Non', value: false },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all ${
              value === opt.value
                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Votre expérience</h3>
        <p className="text-gray-500 text-sm mt-1">Étape 2 sur 3 — Profil artistique</p>
      </div>

      <RadioGroup
        label="Avez-vous déjà participé à une formation similaire ?"
        name="dejaForme"
        value={dejaForme}
        onChange={(v) => setValue('dejaForme', v)}
        error={errors.dejaForme?.message}
      />

      <RadioGroup
        label="Êtes-vous professionnel du secteur ?"
        name="professionnel"
        value={professionnel}
        onChange={(v) => setValue('professionnel', v)}
        error={errors.professionnel?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Votre motivation{' '}
          <span className="text-gray-600 text-xs">({charCount}/500 caractères)</span>
        </label>
        <textarea
          {...register('motivation', {
            onChange: (e) => setCharCount(e.target.value.length),
          })}
          rows={5}
          placeholder="Partagez votre passion pour le cinéma et vos objectifs. Minimum 50 caractères."
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
          maxLength={500}
        />
        {errors.motivation && (
          <p className="text-red-400 text-xs mt-1">{errors.motivation.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white py-3 rounded-xl transition-all text-sm"
        >
          ← Retour
        </button>
        <button
          type="submit"
          className="flex-[2] bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>Continuer</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}