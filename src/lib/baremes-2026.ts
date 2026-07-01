/**
 * Barèmes 2026 — Indemnité de licenciement et droits du salarié
 * Sources : Code du travail, Sécurité sociale, France Travail
 */

// =============================================================================
// SMIC et plafonds 2026
// =============================================================================
export const SMIC_BRUT_MENSUEL = 1801.80;
export const SMIC_BRUT_HORAIRE = 11.88;
export const PLAFOND_SS_MENSUEL = 3864;
export const PLAFOND_SS_ANNUEL = PLAFOND_SS_MENSUEL * 12;

// =============================================================================
// Indemnité légale de licenciement (Code du travail art. R1234-2)
// =============================================================================
export const INDEMNITE_LEGALE = {
  /** 1/4 de mois de salaire par année pour les 10 premières années */
  tauxJusque10Ans: 1 / 4,
  /** 1/3 de mois de salaire par année au-delà de 10 ans */
  tauxAuDela10Ans: 1 / 3,
  /** Ancienneté minimum requise en mois (8 mois depuis 2017) */
  ancienneteMinimumMois: 8,
} as const;

// =============================================================================
// Préavis de licenciement (Code du travail art. L1234-1)
// =============================================================================
export const PREAVIS = {
  /** Moins de 6 mois d'ancienneté : selon convention collective ou usage */
  moinsde6Mois: 0,
  /** De 6 mois à moins de 2 ans : 1 mois */
  de6MoisA2Ans: 1,
  /** 2 ans et plus : 2 mois */
  deuxAnsEtPlus: 2,
  /** Cadres : 3 mois (convention collective courante) */
  cadre: 3,
} as const;

// =============================================================================
// Congés payés
// =============================================================================
export const CONGES_PAYES = {
  /** Taux d'indemnité compensatrice (méthode du 1/10e) */
  tauxDixieme: 0.1,
  /** Jours ouvrables acquis par mois travaillé */
  joursParMois: 2.5,
  /** Maximum jours ouvrables annuels */
  maxJoursAnnuels: 30,
} as const;

// =============================================================================
// Allocation de Retour à l'Emploi (ARE) — France Travail
// =============================================================================
export const ARE = {
  /** Formule 1 : 40.4% du SJR + partie fixe */
  tauxFormule1: 0.404,
  /** Partie fixe journalière (formule 1) */
  partieFixeJournaliere: 12.95,
  /** Formule 2 : 57% du SJR */
  tauxFormule2: 0.57,
  /** Plancher : ARE ne peut pas être < 57% du SJR */
  plancher: 0.57,
  /** Plafond SJR : 4 fois le plafond SS journalier */
  plafondSJR: (PLAFOND_SS_MENSUEL * 4 * 12) / 365, // ~approx 508€/j — ou valeur fixe
  /** Plafond SJR fixe arrondi */
  plafondSJRFixe: 943,
  /** Minimum ARE journalier */
  minimumJournalier: 31.59,
  /** Durée max standard (jours) — 24 mois */
  dureeMaxStandard: 730,
  /** Durée max senior >53 ans (jours) — 30 mois (913 jours) */
  dureeMaxSenior: 913,
  /** Âge seuil senior */
  ageSenior: 53,
  /** Carence incompressible (jours) */
  carenceIncompressible: 7,
  /** Diviseur pour différé spécifique */
  diviseurDiffereSpecifique: 102.4,
  /** Plafond différé spécifique (jours) */
  plafondDiffereSpecifique: 150,
  /** Période de référence affiliation (mois) */
  periodeReferenceAffiliation: 24,
  /** Durée minimale affiliation (jours) — 130 jours ou 910 heures */
  dureeMinimaleAffiliation: 130,
} as const;

// =============================================================================
// Fiscalité des indemnités de licenciement
// =============================================================================
export const FISCALITE = {
  /** L'indemnité légale ou conventionnelle est exonérée d'impôt sur le revenu */
  exonerationIndemniteLegale: true,
  /** Plafond exonération : le plus élevé entre 2x rémunération brute annuelle et 50% de l'indemnité ou 6x PASS */
  plafondExonerationPASS: 6 * PLAFOND_SS_ANNUEL,
  /** CSG/CRDS : exonération dans la limite de l'indemnité légale ou conventionnelle */
  csgCrds: {
    tauxCSG: 0.092,
    tauxCRDS: 0.005,
  },
} as const;
