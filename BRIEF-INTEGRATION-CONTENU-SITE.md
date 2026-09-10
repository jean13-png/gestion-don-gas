# BRIEF D'INTÉGRATION — NOUVEAU CONTENU DU SITE (demandes du PDG)

## Contexte
Plateforme PIPT de l'ONG-GAS (Next.js + Tailwind, Vercel + Neon + Blob).
Le PDG a validé de nouveaux contenus pour la page d'accueil. Ce brief décrit
**exactement** les modifications à faire. Aucun texte n'est à inventer : tout est
fourni ci-dessous.

## Assets à récupérer (fournis en DEUX archives zip, à extraire dans `public/images/`)
| Fichier | Usage |
|---|---|
| `don-enfant.jpg` | Section actions de terrain |
| `don-sacs-scolaires.jpg` | Section actions de terrain |
| `don-tables-bancs.jpg` | Section actions de terrain |
| `don-habits.jpg` | Section actions de terrain |
| `don-informatique.jpg` | Section actions de terrain (don de matériel informatique) |
| `partenaire-remerciement.jpg` | Section remerciements (illustration) |
| `frise-continents.png` | Frise des 6 continents (image unique, 1936×240, transparent) |
| `continents/*.png` | Les 6 continents en images séparées (option, hauteur 220 px) |

⚠️ `partenaire-remerciement.jpg` est fourni séparément (hors zip) : le récupérer
au même endroit et l'ajouter à `public/images/`.

Tous les autres fichiers du site restent inchangés.

---

## 1. HERO — remplacer l'accroche (priorité PDG)

Le PDG exige : le site parle de l'ORGANISATION (santé, éducation), pas uniquement
de l'informatique. Le slogan ci-dessous est la reprise EXACTE du slogan officiel
imprimé sur le t-shirt de l'ONG — ne pas reformuler.

**Eyebrow (au-dessus du H1)** :
```
ONG Global Actions Solidarité — Abomey-Calavi, Bénin
```

**H1 (remplace « L'informatique à l'école devient plus accessible. »)** :
```
Pour la santé, l'éducation et l'amélioration des conditions de vie pour tous.
```

**Sous-titre (remplace le paragraphe actuel)** :
```
À travers ses projets, dont le Projet Informatique Pour Tous, l'ONG-GAS agit
auprès des enfants, des écoles et des familles du Bénin : dons de matériel
scolaire et informatique, équipements, et appui aux communautés.

Les boutons « Faire un don » et « Découvrir le projet » restent inchangés.

---

## 2. NOUVELLE SECTION « Nos actions de terrain » (après la section
« Un projet pour les écoles maternelles, primaires et secondaires »)

**Titre de section** : `Nos actions de terrain`
**Introduction** :
```
Chaque don change concrètement le quotidien des enfants, des écoles et des
familles que nous accompagnons.
```

**Grille responsive** (1 col mobile / 2-3 cols desktop, composition équilibrée
pour 5 visuels) des 5 images, chacune avec un titre court :

| Image | Titre (caption) |
|---|---|
| `don-enfant.jpg` | La joie des enfants bénéficiaires |
| `don-sacs-scolaires.jpg` | Des sacs scolaires pour bien démarrer l'année |
| `don-tables-bancs.jpg` | Des salles de classe équipées |
| `don-habits.jpg` | Des vêtements pour les enfants |
| `don-informatique.jpg` | Du matériel informatique pour les écoles |

Contraintes : `<img>` ou `next/image` avec `alt` descriptif + `loading="lazy"` ;
ratio d'image uniforme (object-fit cover) ; léger arrondi ; PAS d'effet hover
flashy (contraste texte contrastes et sobriété de la charte actuelle).

---

## 3. NOUVELLE SECTION « Nos sincères remerciements » (partenaires)
### 3a. Fonctionnalité complète (nouvelle table + admin)

**Table `partenaires` (Neon, via l'ORM du projet)** :
```ts
modele Partenaire {
  id               String   @id @default(cuid())
  nom              String                    // ex. "Société XYZ"
  logoUrl          String                    // URL Vercel Blob (public)
  siteWeb          String?                   // optionnel
  consentementLogo Boolean                  // OBLIGATOIRE : vrai = partenaire
                                             // autorise l'affichage de son logo
  ordre            Int      @default(0)     // tri d'affichage
  visible          Boolean  @default(true)
  createdAt        DateTime @default(now())
}
```

**Back-office `/admin/partenaires`** (accès admin connecté uniquement) :
- liste des partenaires (logo miniature, nom, site web, ordre, visibilité) ;
- création : nom + upload du logo (PNG/JPG ≤ 1 Mo → Vercel Blob public, conversion
  `sharp` en webp qualité 85, max 400 px de large) + site web optionnel ;
- **case obligatoire** « Le partenaire autorise l'affichage de son logo » —
  refuser l'enregistrement si décochée ;
- actions : monter/descendre (ordre), masquer/afficher, supprimer.

**Routes API protégées** `/api/admin/partenaires` :
- `POST` : créer (multipart : nom, logo, siteWeb?, consentement) ;
- `PATCH` : ordre / visibilité ;
- `DELETE` : supprimer (+ `del()` du blob associé si @vercel/blob le permet).

### 3b. Affichage sur la page d'accueil

**Placement** : après la section de suivi (« Suivre ma demande »), avant le footer.

**Titre de section** : `Nos sincères remerciements`
**Introduction** :
```
Nos sincères remerciements aux entreprises et organisations qui soutiennent nos
actions sur le terrain. Leur confiance nous permet d'aller plus loin, chaque
jour, pour les enfants et les familles du Bénin.
```

**Contenu** :
- illustration à droite (ou au-dessus) : `partenaire-remerciement.jpg` ;
- grille des logos des partenaires `visible = true` ET `consentementLogo = true`,
  triés par `ordre` : hauteur uniforme (~64 px), filtre `grayscale(100%)` léger
  qui redevient couleur au survol, chaque logo cliquable vers `siteWeb` s'il
  existe (attribut `rel="noopener noreferrer"` + `target="_blank"`) ;
- **si aucun partenaire n'est visible, la section entière ne s'affiche pas** ;
- en dessous de la grille, la frise des six continents (`continents-six.svg`,
 voir §4) avec la légende :
```
Une solidarité sans frontières.
```

---

## 4. FRISE DES SIX CONTINENTS (fichiers `frise-continents.png` + `continents/*.png`)

- Images réelles des continents (formes géographiques exactes, issues d'une carte
  du monde à 6 continents — vue francophone : Amérique du Nord, Amérique du Sud,
  Europe, Afrique, Asie, Océanie), reproduites d'après l'arrière du t-shirt
  officiel de l'ONG (demande explicite du PDG).
- Chaque continent est coloré dans la palette officielle du logo ONG-GAS :
  Amérique du Nord bleu #4278E1, Amérique du Sud cyan #03C4E1, Europe rouge
  #880609, Afrique vert #3C6239, Asie olive #678A08, Océanie acier #377280.
- Format léger : fond transparent, hauteur uniforme (220 px), 18–53 Ko par image.
- Placement : dans la section « Nos sincères remerciements » (voir §3b), sous la
  grille des logos ;
- rendu responsive (width 100%, max-width ~960 px), centré, `alt="Les six
  continents"` ;

---

## 5. Tests d'acceptation

1. Accueil : le H1 affiche « Pour la santé, l'éducation et l'amélioration des
   conditions de vie pour tous. » ✓
2. Section « Nos actions de terrain » : 4 images visibles, lazy-load, légendes
   correctes ✓
3. `/admin/partenaires` inaccessible sans session admin ✓
4. Création d'un partenaire SANS la case de consentement → refusée ✓
5. Création AVEC consentement → logo visible dans la section remerciements ✓
6. Partenaire masqué → disparaît de l'accueil ✓
7. Aucun partenaire → section entière masquée ✓
8. Frise des 6 continents affichée, responsive ✓
9. Aucune régression : formulaire de don, suivi, dashboard admin, génération PDF ✓
10. Build Vercel OK ✓

## 6. Contraintes strictes

- Ne pas toucher au workflow des dons, à l'auth, ni à la génération de fiche PDF.
- Charte graphique existante conservée (couleurs, typographies, espacements).
- Tous les textes fournis sont à utiliser TELS QUELS (à l'exception de la coquille
  signalée au §1).
- Aucune collecte de données partenaires sans consentement enregistré.
