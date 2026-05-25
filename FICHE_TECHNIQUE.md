# Fiche Technique — Premier Pas Vers Le Jeu
**Plateforme de gestion des inscriptions et paiements**

---

## 1. Vue d'ensemble

Application web complète permettant de gérer les inscriptions à la formation *Premier Pas Vers Le Jeu*. Elle couvre l'inscription des apprenants, le paiement en ligne, les relances automatiques, la communication par email, et l'administration depuis un dashboard sécurisé.

**Stack technique :**
- Framework : Next.js (App Router) + TypeScript
- Base de données : PostgreSQL via Supabase (Prisma ORM)
- Authentification admin : NextAuth v5 (JWT)
- Paiement en ligne : FedaPay
- Emails : Nodemailer + Gmail App Password
- Médias : Cloudinary
- Hébergement : Vercel

---

## 2. Parcours d'inscription (côté public)

### 2.1 Formulaire en 3 étapes

| Étape | Contenu |
|-------|---------|
| **Étape 1** | Nom, prénoms, téléphone, email, âge |
| **Étape 2** | Déjà formé (oui/non), professionnel (oui/non), motivation |
| **Étape 3** | Mode de participation (Présentiel / En ligne), mode de paiement (Complet 30 000 FCFA / 2 tranches 15 000 × 2), photo de profil (optionnelle), consentement |

### 2.2 Modes de paiement

- **Paiement complet** : 30 000 FCFA en une fois via FedaPay → inscription confirmée immédiatement
- **Paiement en 2 tranches** : 15 000 FCFA maintenant + 15 000 FCFA plus tard → relance automatique envoyée après le délai configuré

### 2.3 Échec du paiement en ligne

Si FedaPay échoue ou n'est pas disponible, **une fenêtre popup s'affiche automatiquement** au centre de l'écran (jamais de message d'erreur brut) :

- **MoMo configuré** : affiche le numéro MoMo, le nom du compte, le montant, et un bouton WhatsApp pré-rempli pour envoyer la capture. Un email est aussi envoyé automatiquement à l'apprenant avec les mêmes infos.
- **MoMo non configuré** : affiche "Votre pré-inscription est enregistrée — notre équipe vous contactera pour finaliser votre paiement."

### 2.4 Option "Déjà payé" (code admin)

À l'étape 3, une section accordéon permet à l'apprenant d'entrer un code fourni par l'admin. Ce code valide l'inscription sans passer par FedaPay.

**Deux scénarios gérés automatiquement :**
1. L'apprenant **n'a pas encore rempli le formulaire** (a payé cash/WhatsApp) → l'admin génère un code → **un email est envoyé automatiquement** à l'apprenant avec un lien magique `/?code=XXXXXXXX#inscription` → il remplit ses infos → valide à l'étape 3 → reçoit le mail de confirmation normal
2. L'apprenant **a déjà rempli le formulaire** (paiement bloqué) → l'admin entre son email → **validation directe sans formulaire** → mail de confirmation envoyé instantanément

---

## 3. Système d'emails

### 3.1 Emails automatiques envoyés

| Événement | Destinataire | Template modifiable |
|-----------|-------------|---------------------|
| Inscription payée (FedaPay complet) | Apprenant + Admin | ✅ `CONFIRMATION_INSCRIPTION` |
| 1ère tranche confirmée | Apprenant + Admin | ✅ `TRANCHE1_CONFIRMEE` |
| Relance paiement initial | Apprenant | ✅ `RELANCE_PAIEMENT` |
| Relance 2ème tranche | Apprenant | ✅ `RELANCE_TRANCHE2` |
| Échec paiement → MoMo | Apprenant | ✅ `ECHEC_PAIEMENT_MOMO` |
| Validation par code admin | Apprenant + Admin | ✅ `PAIEMENT_CODE` |
| Invitation lien magique (code) | Apprenant | ✅ `INVITATION_CODE` |

### 3.2 Templates éditables

Tous les templates sont modifiables depuis **Dashboard → ✉️ Templates emails** sans toucher au code. Variables disponibles : `{{prenoms}}`, `{{nom}}`, `{{email}}`, `{{montant}}`, `{{lienPaiement}}`, `{{momoNumero}}`, etc.

Le système essaie d'abord le template en base de données — si absent ou inactif, il bascule sur le template HTML par défaut.

### 3.3 Relances automatiques (Cron)

La route `/api/cron/relances` envoie automatiquement :
- Les relances de paiement initial (délai configurable dans Paramètres)
- Les relances de 2ème tranche (délai en jours configurable dans Paramètres)

**⚠️ Configuration requise :** cette route doit être appelée régulièrement par un service externe. Deux options :
- **cron-job.org** (gratuit) : créer une tâche pointant vers `https://[votre-domaine]/api/cron/relances` avec le header `Authorization: Bearer [CRON_SECRET]`, toutes les heures
- **Vercel Cron Jobs** : ajouter dans `vercel.json` (plan Pro)

---

## 4. Dashboard administrateur

Accessible sur `/admin` — connexion par email + mot de passe.

### 4.1 Tableau de bord (`/admin`)
- Statistiques : total inscrits, payés, en attente, revenus
- Graphique des inscriptions par jour (30 derniers jours)
- Liste des inscriptions récentes

### 4.2 Inscrits (`/admin/inscriptions`)
- Liste complète avec filtres par statut, mode de participation, recherche par nom/email
- Fiche détaillée de chaque inscrit
- Actions : marquer comme payé manuellement, envoyer un email, voir les logs

### 4.3 Codes de paiement (`/admin/codes-paiement`)
- Générer un code unique pour un apprenant qui a payé directement (cash, MoMo, etc.)
- Le système détecte automatiquement si une inscription existe déjà pour cet email :
  - **Oui** → validation directe, email de confirmation envoyé, rien à faire pour l'apprenant
  - **Non** → code généré + email d'invitation avec lien envoyé automatiquement
- Suivi des codes (utilisés / en attente)

### 4.4 Emails groupés (`/admin/communication`)
Envoyer un email personnalisé à un groupe :
- Tous les inscrits
- Payés uniquement
- En attente de paiement
- 1ère tranche payée (2ème en attente)
- En ligne / Présentiel uniquement

### 4.5 Templates emails (`/admin/templates`)
Modifier l'objet et le corps HTML de chaque email automatique. Boutons d'insertion des variables disponibles. Activation/désactivation par template.

### 4.6 Soutiens & Votes (`/admin/soutiens`)
Créer des pages de soutien publiques pour les participants (`/soutenir/[slug]`). Les visiteurs peuvent :
- Faire un don financier (via FedaPay)
- Voter pour encourager un participant
Chaque campagne affiche le total collecté et le nombre de votes. L'admin peut activer/désactiver et copier le lien de partage.

### 4.7 Galerie (`/admin/galerie`)
Ajouter/supprimer des photos/vidéos affichées sur la page publique. Upload Cloudinary.

### 4.8 Sponsors (`/admin/sponsors`)
Gérer les logos et liens des sponsors affichés sur la page publique.

### 4.9 Équipe (`/admin/equipe`)
Gérer les membres de l'équipe (Visionnaires, Formateurs, Équipe) avec photo, bio, réseaux sociaux.

### 4.10 Demandes partenariat (`/admin/partenaires`)
Consulter et gérer les demandes reçues via le formulaire partenariat/sponsor du site public.

### 4.11 Admins & droits (`/admin/admins`)
- Ajouter/modifier/supprimer des comptes administrateurs
- 3 rôles : **Super Admin** (tous droits), **Admin** (droits configurables), **Lecteur** (consultation seule)
- Droits granulaires : gérer inscriptions, galerie, sponsors, paramètres, statistiques, soutiens, emails
- Bootstrap : si aucun Super Admin n'existe, un bouton permet de se promouvoir

### 4.12 Paramètres (`/admin/parametres`)
| Section | Champs |
|---------|--------|
| Général | Nom du site, email contact, lien WhatsApp groupe, formation active (oui/non), message si fermée |
| Paiement | Prix complet, prix tranche 1 & 2, montant minimum tranche |
| MoMo | Activer/désactiver, numéro MoMo, nom du compte, numéro WhatsApp |
| Relances | Délai relance initiale (minutes), délai relance 2ème tranche (jours) |
| Gmail | Email Gmail, App Password Gmail |
| Logs emails | Historique de tous les emails envoyés avec statut |

---

## 5. Variables d'environnement (Vercel)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL Supabase PgBouncer port 6543 (runtime) |
| `DIRECT_URL` | URL Supabase port 5432 (migrations uniquement) |
| `NEXTAUTH_SECRET` | Clé secrète NextAuth (générer avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL de production (ex: `https://premier-pas-vers-le-jeu.vercel.app`) |
| `GMAIL_USER` | Adresse Gmail utilisée pour l'envoi |
| `GMAIL_APP_PASSWORD` | App Password Gmail (pas le mot de passe principal) |
| `EMAIL_ADMIN` | Email qui reçoit les notifications admin |
| `FEDAPAY_SECRET_KEY` | Clé secrète FedaPay (production) |
| `FEDAPAY_WEBHOOK_SECRET` | Secret pour vérifier les webhooks FedaPay |
| `CRON_SECRET` | Clé secrète pour protéger la route `/api/cron/relances` |
| `NEXT_PUBLIC_BASE_URL` | URL publique du site (ex: `https://premier-pas-vers-le-jeu.vercel.app`) |
| `NEXT_PUBLIC_SITE_NAME` | Nom du site affiché dans les emails |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |

---

## 6. Checklist avant lancement

- [ ] Configurer FedaPay (clé production + URL webhook `[domaine]/api/paiements/callback`)
- [ ] Tester un paiement complet end-to-end (inscription → FedaPay → email de confirmation)
- [ ] Tester le paiement en 2 tranches
- [ ] Vérifier que les emails arrivent (confirmation, relance, MoMo)
- [ ] Configurer le service cron (cron-job.org ou Vercel Cron) avec `CRON_SECRET`
- [ ] Renseigner les infos MoMo dans Paramètres si souhaité
- [ ] Créer le compte Super Admin via `/admin/admins`
- [ ] Vérifier les templates emails depuis `/admin/templates`
- [ ] Configurer le lien WhatsApp groupe dans Paramètres

---

## 7. Fonctionnalités à venir

| # | Fonctionnalité | Priorité |
|---|---------------|----------|
| 1 | **Migration Gmail → Resend.com** — Gmail est limité à ~500 emails/jour. Resend offre 3 000/mois gratuits avec meilleure délivrabilité | 🔴 Haute |
| 2 | **Rate limiting sur le formulaire** — protéger l'API d'inscription contre le spam et les soumissions en masse | 🔴 Haute |
| 3 | **Page de succès FedaPay** — page dédiée `/paiement/succes` après retour de FedaPay avec confirmation visuelle claire | 🟠 Moyenne |
| 4 | **Export CSV des inscrits** — télécharger la liste complète depuis le dashboard pour Excel / Google Sheets | 🟠 Moyenne |
| 5 | **Compteur de places** — afficher "X places restantes sur 50" sur le formulaire d'inscription (urgence + transparence) | 🟠 Moyenne |
| 6 | **Configuration cron depuis le dashboard** — activer/désactiver les relances et voir les logs directement dans Paramètres, sans passer par cron-job.org manuellement | 🟡 Basse |
| 7 | **QR code de présence** — chaque inscrit reçoit un QR code unique dans son email de confirmation, scannable le jour J pour marquer la présence | 🟡 Basse |
| 8 | **Multi-sessions** — gérer plusieurs éditions de la formation (juillet, août, etc.) avec leurs propres inscriptions, dates et tarifs, depuis le même dashboard | 🟡 Basse |

---

*Document généré le 25/05/2026 — Premier Pas Vers Le Jeu*
