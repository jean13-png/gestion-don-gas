# Cahier des Charges Technique Détaillé
## Plateforme Web PIPT — ONG Global Actions Solidarité (GAS)
**Réf :** CdC-PIPT-2026-V2-Agent  
**Date :** Septembre 2026  
**Maître d'ouvrage :** ONG-GAS, Abomey-Calavi, Bénin  
**Développeur :** Agent IA sous supervision  
**Stack :** Next.js 14+ (App Router), Tailwind CSS, Font Awesome

---

## 1. Contexte et objectif

L'ONG-GAS porte le **Projet Informatique Pour Tous (PIPT)** : équiper les écoles béninoises (maternelle, primaire, secondaire) de laboratoires informatiques grâce aux dons de particuliers, entreprises et organisations partenaires.

La plateforme web a trois fonctions principales :

1. Permettre aux donateurs de soumettre un don sans friction et de suivre son traitement en temps réel via une référence unique.
2. Doter l'administration ONG d'un back-office complet pour vérifier les dons sur le terrain, téléverser les preuves photos et générer les attestations officielles PDF.
3. Refléter l'image institutionnelle sérieuse et rigoureuse de l'ONG auprès des partenaires et autorités béninoises.

---

## 2. Stack technique imposée

| Couche | Technologie | Contrainte |
|---|---|---|
| Framework | Next.js 14+ | App Router obligatoire, pas de Pages Router |
| Style | Tailwind CSS | Utility-first, pas de CSS modules ni styled-components |
| Icônes | Font Awesome 6 Free | Seule source d'icônes. Zéro émoji dans l'interface |
| PDF | React-PDF ou PDFKit (côté serveur) | Génération dynamique des fiches de donation |
| Auth | NextAuth.js v5 | JWT, session serveur, hashing Argon2 ou Bcrypt |
| BDD | Prisma ORM | Schéma strict, migrations versionnées |
| Email | Nodemailer ou Resend | Envoi automatique de la référence et de l'attestation PDF |
| Hébergement | Vercel ou VPS | Variables d'environnement via `.env.local` |

### Règles d'architecture Next.js

- Tous les composants dans `src/app/` selon la convention App Router.
- Séparation stricte Server Components / Client Components (`"use client"` uniquement quand nécessaire : formulaires, état local, interactions).
- Les appels BDD se font uniquement dans les Server Components ou Server Actions. Jamais côté client.
- Les Server Actions gèrent les mutations (soumission de don, validation admin, upload photos).
- Les routes API (`src/app/api/`) sont réservées aux webhooks et intégrations externes.

### Structure de dossiers obligatoire

```
src/
  app/
    (public)/           # Layout public (navbar + footer)
      page.tsx          # Accueil
      a-propos/
        page.tsx
      contact/
        page.tsx
      don/
        page.tsx        # Formulaire de soumission
      suivi/
        page.tsx        # Suivi par référence
    (admin)/            # Layout admin (sidebar)
      dashboard/
        page.tsx
      dons/
        page.tsx
        [id]/
          page.tsx
    api/
      auth/[...nextauth]/
        route.ts
  components/
    ui/                 # Composants atomiques réutilisables
    public/             # Composants spécifiques aux pages publiques
    admin/              # Composants du back-office
  lib/
    prisma.ts           # Instance Prisma singleton
    auth.ts             # Config NextAuth
    pdf.ts              # Générateur PDF
    mail.ts             # Envoi e-mail
    reference.ts        # Générateur de référence sécurisée
  types/
    index.ts            # Types TypeScript globaux
```

---

## 3. Charte graphique ONG-GAS (à respecter strictement)

La charte est tirée directement de l'affiche officielle ONG-GAS. Elle ne doit pas être réinterprétée.

### Palette de couleurs

```css
--bleu-ong:       #1A3A6B;   /* Couleur principale, titres, navbar, footer, boutons primaires */
--bleu-clair:     #2A5298;   /* Hover bouton primaire, liens actifs */
--vert-ong:       #00A878;   /* Accent solidarité, CTA secondaire, badges de statut validé */
--vert-pale:      #E6F7F2;   /* Fond des badges verts, indicateurs positifs */
--violet-ong:     #6B3FA0;   /* Couleur complémentaire tirée de l'affiche ONG, étapes d'adhésion */
--gris-fond:      #F4F7FB;   /* Fond général des pages */
--gris-bordure:   #D9E4F0;   /* Bordures, séparateurs */
--texte-principal:#1C2B3A;   /* Corps de texte */
--texte-muted:    #6B7A8D;   /* Texte secondaire, labels, placeholders */
--blanc:          #FFFFFF;   /* Fonds de cartes, navbar */
```

### Typographie

- **Famille principale :** `Outfit` (Google Fonts) — titres, labels, boutons, navigation.
- **Famille corps :** `Inter` — texte courant, descriptions, formulaires.
- **Aucune autre famille.** Pas de monospace pour les labels.
- **Casse :** Sentence case partout. Aucun ALL-CAPS décoratif.
- **Taille corps :** 15-16px, `line-height: 1.65`.
- **Titres :** Scale fluide avec `clamp()` : h1 entre 36px et 58px, h2 entre 26px et 38px.

### Règles visuelles strictes (anti-vibe-coding)

Ces règles sont non négociables. Chaque point doit être respecté :

1. **Zéro émoji** dans l'interface. Toutes les icônes viennent de Font Awesome 6.
2. **Zéro dégradé** décoratif (pas de `bg-gradient-to-*` pour habiller des sections).
3. **Zéro card générique identique** : si 3 cartes existent côte à côte, elles doivent avoir une hiérarchie visuelle, pas le même poids et la même ombre molle.
4. **Zéro violet partout** : le `--violet-ong` est utilisé uniquement pour les éléments de la démarche d'adhésion, en référence à l'affiche ONG.
5. **Zéro tiret long décoratif** (`—`) dans les titres ou labels.
6. **Zéro `→` ou `»`** accolé aux boutons et liens.
7. **Zéro animation au scroll** sur chaque section (pas de `fade-in` par section au scroll).
8. **Zéro fond `#111` ou `#0B0B0B`** se faisant passer pour du noir.
9. **Bordures légères réelles** (`border border-[--gris-bordure]`) sur les cartes, pas des ombres portées génériques `shadow-md` sur tout.
10. **Les numéros d'étapes** (1, 2, 3...) n'apparaissent que dans les sections qui décrivent réellement un processus séquentiel.

---

## 4. Schéma de base de données (Prisma)

```prisma
model Donateur {
  id          String   @id @default(cuid())
  nom         String
  prenom      String
  organisme   String?
  email       String
  telephone   String
  createdAt   DateTime @default(now())
  dons        Don[]
}

model Don {
  id            String     @id @default(cuid())
  reference     String     @unique   // Format : GAS-2026-XXXXX
  nature        NatureDon
  description   String
  localisation  String
  statut        StatutDon  @default(SOUMIS)
  donateur      Donateur   @relation(fields: [donateurId], references: [id])
  donateurId    String
  photos        Photo[]
  observations  String?
  ficheUrl      String?    // URL du PDF généré
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  validatedAt   DateTime?
}

model Photo {
  id        String   @id @default(cuid())
  url       String
  don       Don      @relation(fields: [donId], references: [id])
  donId     String
  createdAt DateTime @default(now())
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  nom          String
  createdAt    DateTime @default(now())
}

enum NatureDon {
  MATERIEL_INFORMATIQUE
  EQUIPEMENT_PEDAGOGIQUE
  DON_FINANCIER
  AUTRE
}

enum StatutDon {
  SOUMIS
  EN_VERIFICATION
  INSPECTE
  VALIDE
  FICHE_GENEREE
}
```

---

## 5. Spécifications page par page (espace public)

### 5.1 Page d'accueil `/`

**Objectif :** Convaincre en 10 secondes. Orienter vers l'action (don ou suivi).

**Sections dans l'ordre :**

#### Navbar (composant `<Navbar />`)
- Logo GAS + nom "ONG-GAS / PIPT" à gauche.
- Liens : "Comment ça marche", "Types de dons", "À propos", "Contact".
- Bouton "Faire un don" à droite (fond `--vert-ong`, texte blanc).
- Sticky, fond blanc, bordure basse `--gris-bordure`.
- Sur mobile : menu hamburger (icône Font Awesome `fa-bars`).

#### Section Hero (deux colonnes sur desktop)
- **Colonne gauche :**
  - Badge discret : texte "Bénin · Abomey-Calavi · Projet actif depuis 2025" avec un point vert devant.
  - H1 fort et direct, aligné à gauche. Pas de mot coloré isolé dans le titre.
  - Description courte (2 phrases max, 15 mots max par phrase).
  - Deux boutons : "Soumettre un don" (primaire bleu) et "Suivre ma demande" (secondaire outline bleu).
  - Bande de stats réelles sous les boutons (séparées par une bordure top) : 3 métriques — dons traités, écoles bénéficiaires, vérification terrain.
- **Colonne droite :**
  - Carte blanche avec formulaire de suivi de référence.
  - Input "Référence de suivi" (placeholder : "GAS-2026-XXXXX").
  - Bouton "Consulter le statut" (fond vert).
  - Séparateur "ou" discret.
  - Lien bouton outline "Soumettre un nouveau don".
  - Mention sécurité discrète en bas (icône `fa-shield-halved` + texte).

#### Section "Comment ça marche"
- Titre de section sobre, aligné à gauche, pas de badge ALL-CAPS dessus.
- Deux colonnes : colonne gauche liste les 4 étapes avec numéros dans des cercles bleus reliés par une ligne verticale. Colonne droite : carte visuelle simulant un suivi de dossier (référence fictive + statuts avec points colorés).
- Les 4 étapes sont : Soumission, Référence unique, Inspection terrain, Attestation PDF.

#### Section "Types de dons"
- Fond blanc pour trancher avec le fond gris général.
- 3 panneaux distincts (pas des cartes jumelles). Matériel informatique, Équipement pédagogique, Don financier.
- Chaque panneau a une icône Font Awesome, un titre, une description factuelle et un lien d'action.
- Les 3 panneaux ont une légère différence de traitement visuel (pas les mêmes proportions ou poids) pour éviter l'effet kit SaaS.

#### Section "Impact et transparence"
- Fond `--bleu-ong`. Texte blanc.
- 3 métriques larges : "100% vérification terrain", "48h délai de traitement", "PDF attestation officielle".
- Chiffre en `--vert-ong`, label en blanc, description en blanc 70%.

#### Section "À propos de l'ONG"
- Deux colonnes : panneau d'informations officielles (statut légal, siège, contact, enregistrement) à gauche, texte de mission à droite.
- Les infos officielles ont chacune une icône Font Awesome et deux lignes (label gris + valeur).

#### CTA final
- Fond `--vert-pale`, centré.
- Titre court, une phrase de contexte, deux boutons.

#### Footer
- Fond `--bleu-ong`.
- 3 colonnes : brand + contacts / liens plateforme / liens ONG.
- Ligne de bas avec numéros d'enregistrement officiels.

---

### 5.2 Page formulaire de don `/don`

**Objectif :** Collecter les informations sans friction, générer et transmettre la référence.

**Structure du formulaire (Server Action) :**

Étape unique (pas de multi-step inutile) divisée en deux blocs visuels :

**Bloc 1 — Vos coordonnées**
- Champs : Prénom, Nom, Organisme/Entreprise (optionnel), Email, Téléphone.
- Validation Zod côté serveur.

**Bloc 2 — Votre don**
- Nature du don (select avec options : Matériel informatique, Équipement pédagogique, Don financier, Autre).
- Description précise (textarea).
- Localisation d'enlèvement/dépôt (input texte).
- Note d'information en bas : "Aucune photo n'est requise. Notre équipe se déplace sur site pour vérifier votre don." Icône `fa-circle-info`.

**Bouton de soumission :** "Soumettre ma contribution" — fond bleu, pleine largeur sur mobile.

**Après soumission :** Page de confirmation affichant la référence unique générée (GAS-2026-XXXXX) dans un encadré vert visible, avec mention "Conservez cette référence, elle vous sera aussi envoyée par e-mail."

---

### 5.3 Page suivi `/suivi`

**Objectif :** Permettre à n'importe qui de consulter le statut de son don via sa référence.

- Input centré avec label clair.
- Résultat : carte affichant le nom du donateur, la nature du don, et une timeline verticale des statuts (SOUMIS, EN_VERIFICATION, INSPECTE, VALIDE, FICHE_GENEREE) avec le statut actuel mis en avant.
- Si référence invalide : message d'erreur factuel "Aucun dossier trouvé pour cette référence."

---

## 6. Spécifications back-office admin `/admin`

Accessible uniquement après authentification NextAuth (route protégée par middleware).

### 6.1 Dashboard `/admin/dashboard`

- Métriques en haut : Total dons reçus, En attente de vérification, Validés ce mois, Attestations générées.
- Tableau des dernières demandes avec colonnes : Référence, Donateur, Nature, Date, Statut, Actions.
- Filtres : par statut, par nature, par période.

### 6.2 Détail d'un don `/admin/dons/[id]`

- Fiche complète du donateur et du don.
- Section "Inspection terrain" : formulaire de téléversement de photos (validation MIME stricte : jpg/png uniquement, 5 MB max par photo).
- Champ observations.
- Bouton "Valider le don" (change le statut en VALIDE).
- Bouton "Générer l'attestation PDF" (déclenche la Server Action de génération et d'envoi e-mail).

---

## 7. Logique de génération de référence unique

```typescript
// src/lib/reference.ts
import { randomBytes } from 'crypto'

export function generateReference(): string {
  const year = new Date().getFullYear()
  const code = randomBytes(4).toString('hex').toUpperCase().slice(0, 5)
  return `GAS-${year}-${code}`
}
```

---

## 8. Contenu de la fiche PDF générée

La fiche de donation officielle contient :
- En-tête ONG-GAS avec logo et coordonnées officielles.
- Numéro de série unique (= référence du don).
- Informations du donateur.
- Description du don validé.
- Photos prises lors de l'inspection terrain.
- Date de validation.
- Cachet "ONG-GAS PIPT — Don Vérifié" (texte stylisé, pas une image).
- Signature électronique de l'administrateur valideur.

---

## 9. Sécurité

| Point | Mesure |
|---|---|
| Auth admin | NextAuth JWT + Argon2 pour le hash des mots de passe |
| Références | `crypto.randomBytes()` — cryptographiquement sûr |
| Uploads | Validation MIME type serveur + taille max 5 MB + sanitisation nom de fichier |
| Formulaires publics | Rate limiting (5 soumissions / IP / heure) |
| En-têtes HTTP | `next.config.js` avec CSP, X-Frame-Options, X-Content-Type-Options |
| Données personnelles | Accès restreint aux admins authentifiés uniquement |

---

## 10. Qualité du code

### Règles TypeScript
- Typage strict (`"strict": true` dans `tsconfig.json`).
- Aucun `any`. Tous les types dans `src/types/index.ts`.
- Types Prisma générés utilisés directement.

### Règles de composants
- Chaque composant dans son propre fichier.
- Props typées avec des interfaces nommées (pas de types inline).
- Les composants serveur ne reçoivent pas de fonctions en props.
- Nommage : PascalCase pour les composants, camelCase pour les fonctions utilitaires.

### Règles Tailwind
- Pas de classes arbitraires `[#hex]` pour les couleurs principales : déclarer les tokens dans `tailwind.config.ts`.
- Breakpoints : `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- Responsive mobile-first sur tous les composants.

```typescript
// tailwind.config.ts — tokens à déclarer
extend: {
  colors: {
    'ong-bleu':       '#1A3A6B',
    'ong-bleu-clair': '#2A5298',
    'ong-vert':       '#00A878',
    'ong-vert-pale':  '#E6F7F2',
    'ong-violet':     '#6B3FA0',
    'ong-fond':       '#F4F7FB',
    'ong-bordure':    '#D9E4F0',
    'ong-texte':      '#1C2B3A',
    'ong-muted':      '#6B7A8D',
  },
  fontFamily: {
    display: ['Outfit', 'sans-serif'],
    body:    ['Inter', 'sans-serif'],
  },
}
```

---

## 11. Variables d'environnement requises

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
EMAIL_HOST="smtp...."
EMAIL_PORT=587
EMAIL_USER="..."
EMAIL_PASS="..."
EMAIL_FROM="noreply@pipt-ong-gas.bj"
UPLOAD_DIR="./public/uploads"
```

---

## 12. Ordre de développement recommandé

L'agent IA doit respecter cet ordre pour garantir une base solide avant les couches suivantes :

1. Configuration initiale (Tailwind tokens, fonts, layout public de base).
2. Page d'accueil publique complète (statique d'abord, sans BDD).
3. Schéma Prisma + migrations.
4. Formulaire de soumission de don avec Server Action + génération de référence + envoi e-mail.
5. Page de suivi par référence.
6. Pages "À propos" et "Contact".
7. Authentification admin (NextAuth).
8. Dashboard admin + liste des dons.
9. Page détail don + upload photos + validation.
10. Génération PDF + envoi automatique.
11. Sécurité (rate limiting, en-têtes HTTP, audit).
12. Tests et déploiement.

---

## 13. Ce que l'agent NE doit PAS faire

- Ne pas utiliser `create-react-app` ou Pages Router.
- Ne pas installer de bibliothèques de composants UI (Shadcn, Material UI, Chakra, etc.). Tout est construit avec Tailwind.
- Ne pas placer de logique BDD dans les composants client.
- Ne pas utiliser de `localStorage` pour gérer des états sensibles.
- Ne pas générer de dégradés décoratifs ni d'animations par section au scroll.
- Ne pas utiliser d'émojis dans l'interface (icônes Font Awesome uniquement).
- Ne pas créer de fichiers CSS séparés : uniquement Tailwind utilities.
- Ne pas inventer des données : utiliser les données réelles de l'ONG-GAS fournies dans ce document.

---

*Cahier des Charges établi dans le cadre du Projet PIPT — ONG Global Actions Solidarité, Bénin. Document à transmettre à l'agent IA développeur.*