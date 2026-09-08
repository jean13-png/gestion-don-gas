# Assets — Fiche de réception de don (ONG-GAS · Projet PIPT)

Dossier unique contenant **tous les éléments** nécessaires à la génération PDF
de la « Fiche de réception de don ». À extraire dans `public/` du projet Next.js :

```
public/
└── fiche-don/
    ├── bandeau-titre.png
    ├── fond-central.jpg
    ├── fond-colonne-creme.png
    ├── fond-colonne-lilas.png
    ├── icone-mail.png
    ├── icone-telephone.png
    ├── logo-ong-gas.jpg
    └── fonts/            (12 fichiers .ttf)
```

## Images (7) — extraites à l'octet près du PDF modèle officiel (aucun réencodage)

| Fichier | Dimensions px | Rôle dans la fiche |
|---|---|---|
| `logo-ong-gas.jpg` | 206×239 | Logo ONG-GAS — placé **2 fois** : en-tête gauche (31,4 ; 11) et en-tête droit (489,8 ; 14,9) |
| `icone-mail.png` | 46×42 | Icône enveloppe, en-tête (176,9 ; 34,4) |
| `icone-telephone.png` | 44×41 | Icône téléphone, en-tête (232,4 ; 46,2) |
| `fond-central.jpg` | 379×378 | Fond pâle central derrière les colonnes (56,7 ; 180,5 → 538,5 ; 661,1) |
| `bandeau-titre.png` | 802×106 | Bandeau « FICHE DE RECEPTION DE DON » (153,4 ; 110,6 → 441,8 ; 148,6) |
| `fond-colonne-creme.png` | 281×500 | Fond de colonne crème (colonnes 1 et 3) |
| `fond-colonne-lilas.png` | 281×500 | Fond de colonne lilas (colonnes 2 et 4) |

## Polices (`fonts/`, 12 fichiers)

**8 sous-ensembles (subsets)** extraits du PDF modèle — pour le **texte statique**
(fidélité glyphique maximale) :

`TimesNewRoman-subset.ttf` · `TimesNewRoman-Bold-subset.ttf` · `Calibri-subset.ttf` ·
`Calibri-Bold-subset.ttf` · `Calibri-BoldItalic-subset.ttf` · `Georgia-subset.ttf` ·
`Georgia-Bold-subset.ttf` · `BerlinSansFB-subset.ttf`

**4 polices complètes libres** (substituts métriquement compatibles) — pour les
**données dynamiques** (les subsets ne contiennent pas tous les glyphes : pas de
chiffres en Times Bold, par ex.) :

`LiberationSerif-Regular.ttf` / `LiberationSerif-Bold.ttf` (≈ Times New Roman) ·
`Carlito-Regular.ttf` / `Carlito-Bold.ttf` (≈ Calibri)

## Intégration Next.js

1. Extraire ce zip dans `public/` → `public/fiche-don/`
2. Copier le générateur `lib/pdf/fiche-reception-don.ts` (projet `pipt-pdf`)
3. **Rien d'autre à configurer** : le générateur résout automatiquement les
   chemins — `public/fiche-don/` en priorité, sinon `lib/pdf/{assets,fonts}`
   (exécution autonome / tests).
4. API : `genererFicheReceptionDon(data: DonFicheData): Promise<Buffer>`

Références : `SPEC-GENERATION-FICHE-RECEPTION-DE-DON.md` (coordonnées complètes,
mapping des champs, test de superposition). Validation actuelle : 86/86 blocs de
texte à ≤ 1,5 pt, 11/11 images exactes, 74 % de pixels identiques à 300 dpi.

## Licences

- **Images** : extraites du document officiel ONG-GAS (usage projet PIPT).
- **Liberation Serif, Carlito** : SIL Open Font License (libres, intégrables).
- **Subsets** : polices embarquées dans le PDF de l'ONG (usage interne projet ;
  les fichiers TTF complets officiels — `times.ttf`, `calibri.ttf`, `BRLNSR.TTF`… —
  restent à demander à l'ONG pour un usage 100 % conforme).
