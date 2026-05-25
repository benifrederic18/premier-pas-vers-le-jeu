# Guide d'utilisation — Premier Pas Vers Le Jeu
**Pour les administrateurs — aucune connaissance technique requise**

---

## Bienvenue

Ce guide vous explique comment utiliser votre plateforme d'inscription en ligne. Tout se gère depuis votre **tableau de bord** (dashboard), accessible depuis n'importe quel navigateur web, sans installer quoi que ce soit.

---

## Se connecter au tableau de bord

1. Ouvrez votre navigateur et allez sur :
   **`https://premier-pas-vers-le-jeu.vercel.app/admin`**
2. Entrez votre **email** et votre **mot de passe**
3. Cliquez sur **Se connecter**

> Vous êtes maintenant sur votre tableau de bord. La barre de navigation à gauche (sur ordinateur) ou en bas de l'écran (sur mobile) vous permet d'accéder à toutes les sections.

---

## Ce que voit l'apprenant sur le site

Lorsqu'un apprenant visite votre site et clique pour s'inscrire, il passe par **3 étapes** :

1. **Ses informations** : nom, prénom, téléphone, email, âge
2. **Son profil** : s'il a déjà été formé, s'il est professionnel, sa motivation
3. **Ses options** : il choisit entre présentiel ou en ligne, et entre payer en une fois (30 000 FCFA) ou en deux fois (15 000 + 15 000 FCFA). Il peut aussi ajouter sa photo.

Après avoir validé, il est redirigé vers **FedaPay** pour payer en ligne. Une fois le paiement confirmé, il reçoit automatiquement un **email de confirmation** dans sa boîte mail.

---

## Section par section

---

### 📊 Tableau de bord (page d'accueil)

Dès la connexion, vous voyez un résumé de la situation :

- **Nombre total d'inscrits**
- **Nombre de paiements confirmés**
- **Nombre de personnes en attente de paiement**
- **Revenus totaux encaissés**
- Un graphique des inscriptions jour par jour

---

### 👥 Inscrits

C'est la liste complète de toutes les personnes qui ont rempli le formulaire.

**Filtrer la liste :**
- Par statut : *Payé*, *En attente*, *Tranche 1 payée*, *Échec paiement*
- Par mode : *Présentiel* ou *En ligne*
- Par recherche : tapez un nom ou un email

**Sur chaque fiche inscrit, vous pouvez :**
- Voir toutes ses informations
- Voir l'historique de ses paiements
- Lui envoyer un email manuellement

---

### 🔑 Codes de paiement

Cette section sert pour les personnes qui ont **payé directement** (cash, MoMo, virement) sans passer par le site.

#### Comment ça marche ?

1. Cliquez sur **"Valider / Générer le code"**
2. Entrez le **nom**, l'**email** et le **montant payé** de l'apprenant
3. Cliquez sur **Valider**

Le système fait automatiquement la bonne chose selon la situation :

**Cas 1 — L'apprenant a déjà rempli le formulaire** (son paiement a été bloqué et il a payé directement après) :
> Son inscription est **validée immédiatement**. Il reçoit son email de confirmation. Rien d'autre à faire.

**Cas 2 — L'apprenant n'a pas encore rempli le formulaire** (il a payé avant même de s'inscrire sur le site) :
> Un code est généré et un **email lui est envoyé automatiquement** avec un lien. Il clique, remplit ses informations en 3 étapes, entre son code à l'étape 3, et reçoit son email de confirmation.

> Dans les deux cas, vous recevez aussi une notification par email.

---

### 📧 Emails groupés

Permet d'envoyer un email à un groupe de personnes en une seule fois.

**Comment faire :**
1. Choisissez le groupe destinataire dans la liste déroulante :
   - *Tous les inscrits*
   - *Payés uniquement*
   - *En attente de paiement*
   - *1ère tranche payée (2ème en attente)*
   - *Présentiel uniquement* / *En ligne uniquement*
2. Rédigez votre **objet** et votre **message**
3. Cliquez sur **Envoyer**

---

### ✉️ Templates emails

Tous les emails automatiques envoyés par la plateforme sont **personnalisables** ici, sans toucher au code.

**Liste des emails modifiables :**
- Email de confirmation après paiement
- Email de confirmation de la 1ère tranche
- Email de relance (paiement non finalisé)
- Email de relance pour la 2ème tranche
- Email en cas d'échec du paiement (instructions MoMo)
- Email de confirmation via code admin
- Email d'invitation avec lien magique

**Comment modifier un template :**
1. Cliquez sur le template à modifier dans la liste à gauche
2. Modifiez l'**objet** de l'email
3. Modifiez le **contenu** du message
4. Utilisez les boutons de variables pour insérer automatiquement le prénom, montant, etc. (ex: cliquer sur `{{prenoms}}` insère le prénom de l'apprenant dans le texte)
5. Cliquez sur **Enregistrer**

> Si vous désactivez un template, la plateforme utilisera un message par défaut à la place.

---

### 🏆 Soutiens & Votes

Cette section permet de créer des **pages de soutien publiques** pour vos apprenants. Les amis, famille et fans peuvent voter ou faire un don pour encourager un participant.

**Créer une page de soutien :**
1. Cliquez sur **"Créer une campagne"**
2. Choisissez un apprenant dans la liste (parmi les inscrits payés)
3. Donnez un titre et une description à la campagne
4. Définissez un objectif de collecte (optionnel)
5. Cliquez sur **Créer**

**Partager :**
- Chaque campagne a un lien unique (ex: `votre-site.com/soutenir/nom-apprenant`)
- Cliquez sur **Copier le lien** pour le partager sur les réseaux sociaux

**Désactiver :** si vous ne souhaitez plus qu'une campagne soit visible, cliquez sur **Désactiver**. Les données sont conservées.

---

### 🖼️ Galerie

Ajoutez des photos et vidéos qui s'affichent sur la page publique du site.

- Cliquez sur **Ajouter une photo/vidéo**
- Chargez votre fichier ou collez un lien vidéo
- Réorganisez l'ordre si besoin
- Activez ou désactivez chaque élément individuellement

---

### 🤝 Sponsors

Gérez les logos des sponsors affichés sur le site.

- Ajoutez le nom, le logo et le lien du site de chaque sponsor
- Activez/désactivez leur affichage

---

### 🌟 Équipe

Gérez les profils de l'équipe affichés sur le site.

- **Visionnaires** : les fondateurs / porteurs de projet
- **Formateurs** : les intervenants de la formation
- **Équipe** : les membres de l'équipe organisatrice

Pour chaque personne : nom, rôle, photo, biographie courte, liens réseaux sociaux.

---

### 📩 Demandes partenariat

Consultez les demandes envoyées via le formulaire de contact partenariat/sponsor de votre site. Chaque demande affiche le nom, l'organisation, l'email, le téléphone et le message.

---

### 🔐 Admins & droits

Gérez les personnes qui ont accès au tableau de bord.

**3 niveaux d'accès :**

| Rôle | Ce qu'il peut faire |
|------|---------------------|
| **Super Admin** | Tout faire, y compris gérer les autres admins |
| **Admin** | Les sections que vous lui autorisez (inscriptions, galerie, emails, etc.) |
| **Lecteur** | Consulter sans modifier |

**Ajouter un admin :**
1. Cliquez sur **"+ Ajouter un admin"**
2. Renseignez son nom, email, mot de passe et rôle
3. Si c'est un Admin, cochez les sections auxquelles il a accès
4. Cliquez sur **Sauvegarder**

> La personne peut se connecter immédiatement avec ses identifiants.

---

### ⚙️ Paramètres

La section centrale pour configurer le comportement de la plateforme.

#### Général
- **Nom du site** : affiché dans les emails
- **Email de contact** : visible sur le site
- **Lien WhatsApp groupe** : envoyé dans l'email de confirmation pour que les apprenants rejoignent le groupe
- **Formation active** : si vous décochez cette option, le formulaire d'inscription se ferme et affiche un message personnalisable

#### Paiement en ligne (MoMo)
Si votre paiement FedaPay échoue ou n'est pas disponible, activez le MoMo pour que les apprenants sachent comment payer directement :
- **Activer le paiement MoMo** : oui/non
- **Numéro MoMo** : le numéro sur lequel envoyer l'argent
- **Nom du compte** : le nom affiché sur le compte MoMo
- **Numéro WhatsApp** : le numéro où envoyer la capture d'écran du paiement

> Une fois activé, quand un paiement en ligne échoue, un popup s'affiche automatiquement avec toutes ces informations, et un email est envoyé à l'apprenant.

#### Relances automatiques
- **Délai avant relance initiale** : combien de minutes après l'inscription sans paiement avant d'envoyer un email de relance (ex: 60 minutes)
- **Délai avant relance 2ème tranche** : combien de jours après la 1ère tranche avant de relancer pour la 2ème (ex: 7 jours)

#### Email (Gmail)
- Entrez votre adresse Gmail et votre mot de passe d'application pour que la plateforme puisse envoyer des emails en votre nom

---

## Les emails automatiques — résumé

Voici tous les emails que la plateforme envoie **sans que vous ayez rien à faire** :

| Quand | À qui |
|-------|-------|
| Inscription payée complètement | Apprenant ✅ + Vous (admin) ✅ |
| 1ère tranche payée | Apprenant ✅ + Vous (admin) ✅ |
| Paiement toujours pas fait après le délai | Apprenant ✅ |
| 2ème tranche toujours pas payée après le délai | Apprenant ✅ |
| Paiement FedaPay échoué (instructions MoMo) | Apprenant ✅ |
| Inscription validée par code admin | Apprenant ✅ + Vous (admin) ✅ |
| Lien magique envoyé (apprenant sans formulaire) | Apprenant ✅ |

---

## En cas de problème

### "Un apprenant dit ne pas avoir reçu son email de confirmation"
1. Allez dans **Inscrits**, recherchez son nom
2. Vérifiez son statut (doit être **Payé**)
3. Allez dans **Paramètres → Logs emails** pour voir si l'email a bien été envoyé
4. Si l'email est en échec, renvoyez-le manuellement depuis sa fiche

### "Un apprenant a payé directement mais n'est pas dans la liste"
Allez dans **Codes de paiement** → cliquez sur **Valider / Générer le code** → entrez son email et le montant payé. La plateforme s'occupe du reste.

### "Le formulaire d'inscription ne doit plus être visible"
Allez dans **Paramètres → Général** → décochez **"Formation active"** → personnalisez le message affiché → sauvegardez.

---

## Fonctionnalités à venir

Ces améliorations sont prévues pour les prochaines versions :

- **Export Excel** de la liste des inscrits (téléchargement en un clic)
- **Compteur de places** sur le formulaire ("12 places restantes sur 50")
- **QR code de présence** — chaque apprenant reçoit un QR code unique dans son email, que vous scannez le jour J pour valider sa présence
- **Amélioration du service d'envoi d'emails** pour pouvoir envoyer sans limite de volume
- **Gestion multi-sessions** — gérer plusieurs éditions de la formation depuis le même tableau de bord

---

*Guide rédigé pour la plateforme Premier Pas Vers Le Jeu — Mai 2026*
