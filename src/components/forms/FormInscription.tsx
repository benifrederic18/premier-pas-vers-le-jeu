'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Etape1 from './Etape1';
import Etape2 from './Etape2';
import Etape3 from './Etape3';
import SuccessPaiement from './SuccessPaiement';
import MomoPopup from './MomoPopup';

export type FormDataState = {
  nom: string;
  prenoms: string;
  telephone: string;
  email: string;
  age: string;
  dejaForme: boolean | null;
  professionnel: boolean | null;
  motivation: string;
  photoFile: File | null;
  consentement: boolean;
  modeParticipation: 'PRESENTIEL' | 'EN_LIGNE';
  modePaiement: 'COMPLET' | 'TRANCHE';
};

const initialData: FormDataState = {
  nom: '',
  prenoms: '',
  telephone: '',
  email: '',
  age: '',
  dejaForme: null,
  professionnel: null,
  motivation: '',
  photoFile: null,
  consentement: false,
  modeParticipation: 'PRESENTIEL',
  modePaiement: 'COMPLET',
};

interface MomoInfo {
  momoNumero?: string;
  momoNom?: string;
  momoWhatsapp?: string;
  momoActif?: boolean;
}

export default function FormInscription() {
  const [etape, setEtape] = useState(1);
  const [formData, setFormData] = useState<FormDataState>(initialData);
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);

  const [momoInfo, setMomoInfo] = useState<MomoInfo | null>(null);
  const [showMomo, setShowMomo] = useState(false);
  const [montantMomo, setMontantMomo] = useState<number>(30000);

  const [prefilledCode, setPrefilledCode] = useState('');

  useEffect(() => {
    fetch('/api/parametres-publics')
      .then((r) => r.json())
      .then((d) => { if (d) setMomoInfo(d); })
      .catch(() => {});

    // Read code from URL params (e.g. /?code=A3F9B2C1#inscription)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) setPrefilledCode(code.toUpperCase());
  }, []);

  const update = (data: Partial<FormDataState>) => setFormData((prev) => ({ ...prev, ...data }));

  const handleSubmitFinal = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nom', formData.nom);
      fd.append('prenoms', formData.prenoms);
      fd.append('telephone', formData.telephone);
      fd.append('email', formData.email);
      fd.append('age', formData.age);
      fd.append('dejaForme', String(formData.dejaForme));
      fd.append('professionnel', String(formData.professionnel));
      fd.append('motivation', formData.motivation);
      fd.append('modeParticipation', formData.modeParticipation);
      fd.append('modePaiement', formData.modePaiement);
      if (formData.photoFile) fd.append('photo', formData.photoFile);

      const res = await fetch('/api/inscriptions/create', { method: 'POST', body: fd });
      const { inscriptionId, error } = await res.json();
      if (!res.ok) throw new Error(error || 'Erreur lors de la sauvegarde.');

      const payRes = await fetch('/api/paiements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscriptionId, modePaiement: formData.modePaiement }),
      });
      const { checkoutUrl: url, error: payError } = await payRes.json();

      if (!payRes.ok) {
        const montant = formData.modePaiement === 'TRANCHE' ? 15000 : 30000;
        setMontantMomo(montant);
        // Send MoMo instructions email only if MoMo is configured
        if (momoInfo?.momoActif) {
          try {
            await fetch('/api/inscriptions/momo-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inscriptionId, montant }),
            });
          } catch {}
        }
        // Always show the popup — never show a raw error
        setShowMomo(true);
        return;
      }

      setCheckoutUrl(url);
      window.location.href = url;
    } catch {
      const montant = formData.modePaiement === 'TRANCHE' ? 15000 : 30000;
      setMontantMomo(montant);
      // Always show the popup — never show a raw error
      setShowMomo(true);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Informations', 'Profil', 'Options & Photo'];

  if (inscriptionSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="card-dark rounded-2xl p-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎭</div>
          <h2 className="text-2xl font-black text-white mb-3">Inscription validée !</h2>
          <p className="text-gray-400">Votre inscription a été confirmée. Un email de confirmation vous a été envoyé.</p>
        </div>
      </div>
    );
  }

  if (checkoutUrl) return <SuccessPaiement url={checkoutUrl} />;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Banner discret si code détecté dans l'URL */}
      {prefilledCode && (
        <div className="mb-6 p-3 rounded-xl border border-green-500/30 bg-green-500/5 flex items-center gap-3">
          <span className="text-green-400 text-lg">✅</span>
          <div>
            <p className="text-green-300 font-semibold text-sm">Code de paiement détecté</p>
            <p className="text-gray-400 text-xs mt-0.5">Complétez votre profil (étapes 1 et 2), puis validez avec votre code à l'étape 3.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  etape > i + 1
                    ? 'bg-green-500 text-white'
                    : etape === i + 1
                    ? 'bg-orange-500 text-white glow'
                    : 'bg-white/10 text-gray-500'
                }`}
              >
                {etape > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-2 ${etape === i + 1 ? 'text-orange-400' : 'text-gray-600'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 transition-all ${
                  etape > i + 1 ? 'bg-orange-500' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card-dark rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {etape === 1 && (
            <motion.div key="etape1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Etape1 data={formData} update={update} onNext={() => setEtape(2)} />
            </motion.div>
          )}
          {etape === 2 && (
            <motion.div key="etape2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Etape2 data={formData} update={update} onNext={() => setEtape(3)} onBack={() => setEtape(1)} />
            </motion.div>
          )}
          {etape === 3 && (
            <motion.div key="etape3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Etape3
                data={formData}
                update={update}
                onSubmit={handleSubmitFinal}
                onBack={() => setEtape(2)}
                loading={loading}
                prefilledCode={prefilledCode}
                onCodeSuccess={() => setInscriptionSuccess(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MoMo fallback popup — always rendered, adapts content */}
      <MomoPopup
        open={showMomo}
        onClose={() => setShowMomo(false)}
        info={{
          momoActif: momoInfo?.momoActif || false,
          momoNumero: momoInfo?.momoNumero || '',
          momoNom: momoInfo?.momoNom || '',
          momoWhatsapp: momoInfo?.momoWhatsapp || '',
          montant: montantMomo,
          prenoms: formData.prenoms,
          email: formData.email,
        }}
      />

    </div>
  );
}
