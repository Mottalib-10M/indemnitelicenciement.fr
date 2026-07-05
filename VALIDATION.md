# Validation — Indemnité de Licenciement

## Cas de test avec sources juridiques

### Cas 1 : Salarié non-cadre, 5 ans d'ancienneté, 3 000 € brut/mois

**Source :** Code du travail, art. R1234-2

- **Indemnité légale** : 3 000 × 1/4 × 5 = **3 750 €**
- **Préavis** : 2 mois (ancienneté ≥ 2 ans, art. L1234-1)
- **Indemnité de préavis** : 3 000 × 2 = **6 000 €**
- **Total** (hors congés payés) : **9 750 €**

Vérification :
```
calculateIndemniteLegale(3000, 5, 0) → 3 750 €  ✓
calculatePreavis(5, false) → 2 mois  ✓
```

---

### Cas 2 : Cadre, 15 ans d'ancienneté, 5 000 € brut/mois

**Source :** Code du travail, art. R1234-2 + conventions collectives cadres

- **Indemnité légale** :
  - 10 premières années : 5 000 × 1/4 × 10 = 12 500 €
  - 5 années suivantes : 5 000 × 1/3 × 5 = 8 333,33 €
  - **Total : 20 833,33 €**
- **Préavis** : 3 mois (cadre)
- **Indemnité de préavis** : 5 000 × 3 = **15 000 €**
- **Total** (hors congés payés) : **35 833,33 €**

Vérification :
```
calculateIndemniteLegale(5000, 15, 0) → 20 833,33 €  ✓
calculatePreavis(15, true) → 3 mois  ✓
```

---

### Cas 3 : ARE pour salarié de 40 ans, 3 000 € brut/mois, 730 jours travaillés

**Source :** Convention d'assurance chômage, France Travail

- **SJR** : (3 000 × 12) / 365 = **98,63 €**
- **Formule 1** : 98,63 × 0,404 + 12,95 = **52,80 €/jour**
- **Formule 2** : 98,63 × 0,57 = **56,22 €/jour**
- **ARE retenue** : **56,22 €/jour** (formule 2, la plus avantageuse)
- **ARE mensuelle** : 56,22 × 30 = **1 686,60 €/mois**
- **Durée** : 730 jours (plafond pour < 53 ans)
- **Carence** : 7 jours incompressibles

Vérification :
```
calculateARE(3000, 730, 40).allocationJournaliere → 56,22 €  ✓
calculateARE(3000, 730, 40).dureeJours → 730  ✓
```

---

## Build status

- **Build:** 40 pages, 0 errors
- **Tests:** 32/32 passed
- **Sitemap:** auto-generated (sitemap-index.xml)

## Page inventory (40 pages)

| Category | Count | Details |
|---|---|---|
| Home + legal | 3 | index, mentions-legales, confidentialite |
| Tool pages | 3 | index (calculateur), guide-are, faq |
| Guides index | 1 | /guides/ |
| Guide articles | 8 | indemnite-legale-vs-conventionnelle, licenciement-faute-grave, licenciement-economique, rupture-conventionnelle, preavis-licenciement, fiscalite-indemnites, licenciement-inaptitude, contestation-prud-hommes |
| Seniority pages | 18 | indemnite-licenciement-1-ans through indemnite-licenciement-30-ans |
| Salary pages | 8 | indemnite-licenciement-1802-euros through indemnite-licenciement-6000-euros |

## Components

- LicenciementCalculator.tsx (full calculator with timeline)

## Data files

- baremes-2026.ts — SMIC, severance rates, notice periods, ARE formulas
- anciennete-data.ts — 18 seniority entries with pre-calculated examples
- salaire-data.ts — 8 salary levels with comparison tables

## Quality gates

- [x] Build passes (40 pages, 0 errors)
- [x] Tests pass (32/32)
- [x] Sitemap generated
- [x] Schema.org on every page (WebApplication, FAQPage, BreadcrumbList)
- [x] Analytics: Plausible + GA4 placeholder
- [x] robots.txt present
- [x] llms.txt present
- [x] All guide pages > 1500 words
- [x] Disclaimer in footer
- [x] Mobile-responsive navigation (hamburger menu)
- [x] Internal cross-linking between tools and guides

## Sources juridiques

| Référence | Objet |
|-----------|-------|
| Code du travail, art. L1234-9 | Droit à l'indemnité de licenciement |
| Code du travail, art. R1234-2 | Calcul de l'indemnité légale |
| Code du travail, art. L1234-1 | Durée du préavis |
| Code du travail, art. L3141-28 | Indemnité compensatrice de congés payés |
| Convention d'assurance chômage | Calcul de l'ARE |
| Décret n° 2019-797 | Réforme assurance chômage |
| Ordonnances n° 2017-1387 | Seuil ancienneté 8 mois |
