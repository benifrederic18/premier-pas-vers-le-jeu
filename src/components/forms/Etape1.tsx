'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { etape1Schema } from '@/lib/validations';
import type { FormDataState } from './FormInscription';
import InputField from '../ui/InputField';

interface Props {
  data: FormDataState;
  update: (d: Partial<FormDataState>) => void;
  onNext: () => void;
}

type Etape1Form = {
  nom: string;
  prenoms: string;
  telephone: string;
  email: string;
  age: string;
};

export default function Etape1({ data, update, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Etape1Form>({
    defaultValues: {
      nom: data.nom,
      prenoms: data.prenoms,
      telephone: data.telephone,
      email: data.email,
      age: data.age,
    },
  });

  const onSubmit: SubmitHandler<Etape1Form> = (values) => {
    const parsed = etape1Schema.safeParse({ ...values, age: parseInt(values.age) });
    if (!parsed.success) return;
    update({ ...parsed.data, age: String(parsed.data.age) });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">Parlez-nous de vous</h3>
        <p className="text-gray-500 text-sm mt-1">Étape 1 sur 3 — Informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Nom" error={errors.nom?.message} {...register('nom')} placeholder="Ex : Dupont" />
        <InputField label="Prénoms" error={errors.prenoms?.message} {...register('prenoms')} placeholder="Ex : Jean" />
      </div>

      <InputField
        label="Téléphone WhatsApp"
        error={errors.telephone?.message}
        {...register('telephone')}
        placeholder="+229 01234567"
        type="tel"
        helper="Format : +22901234567 ou 01234567"
      />

      <InputField
        label="Email"
        error={errors.email?.message}
        {...register('email')}
        placeholder="nom@example.com"
        type="email"
      />

      <InputField
        label="Âge"
        error={errors.age?.message}
        {...register('age', { valueAsNumber: true })}
        placeholder="Ex : 24"
        type="number"
        min={16}
        max={65}
      />

      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <span>Continuer</span>
        <span>→</span>
      </button>
    </form>
  );
}