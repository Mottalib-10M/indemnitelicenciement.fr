/**
 * Barèmes 2026, Indemnité de licenciement et droits du salarié
 * Sources (vérifiées le 2026-10-02) : Code du travail ; arrêté fixant le plafond de la Sécurité sociale
 * pour 2026 (4 005 € par mois, 48 060 € par an) ; décret portant relèvement du SMIC au 1er janvier 2026
 * (12,02 € l'heure) ; Unédic pour l'ARE (montants en vigueur depuis le 1er juillet 2025, non revalorisés
 * au 1er juillet 2026 ; durées issues de la convention du 15 novembre 2024, applicables depuis le 1er avril 2025).
 * Jusqu'au 2026-10-01 ce fichier portait le plafond de 2024, le SMIC de novembre 2024 et les durées d'avant 2023.
 */

// =============================================================================
// SMIC et plafonds 2026
// =============================================================================
export const SMIC_BRUT_MENSUEL = 1823.03;
export const SMIC_BRUT_HORAIRE = 12.02;
export const PLAFOND_SS_MENSUEL = 4005;
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
// PREAVIS de licenciement (Code du travail art. L1234-1)
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
// Allocation de Retour à l'Emploi (ARE), France Travail
// =============================================================================
export const ARE = {
  /** Formule 1 : 40.4% du SJR + partie fixe */
  tauxFormule1: 0.404,
  /** Partie fixe journalière (formule 1) */
  partieFixeJournaliere: 13.18,
  /** Formule 2 : 57% du SJR */
  tauxFormule2: 0.57,
  /** Plancher : ARE ne peut pas être < 57% du SJR */
  plancher: 0.57,
  /** Plafond du SJR : le salaire de référence est retenu dans la limite de 4 plafonds mensuels de la Sécurité sociale */
  plafondSJR: (PLAFOND_SS_MENSUEL * 4 * 12) / 365,
  /** Ancien nom, conservé pour les appels existants */
  plafondSJRFixe: (PLAFOND_SS_MENSUEL * 4 * 12) / 365,
  /** Minimum ARE journalier */
  minimumJournalier: 32.13,
  /** Durée maximale avant 55 ans : 548 jours, soit 18 mois */
  dureeMaxStandard: 548,
  /** Durée maximale à 55 et 56 ans : 685 jours, soit 22,5 mois */
  dureeMaxIntermediaire: 685,
  /** Durée maximale à partir de 57 ans : 822 jours, soit 27 mois */
  dureeMaxSenior: 822,
  /** Âges qui ouvrent les durées allongées */
  ageIntermediaire: 55,
  ageSenior: 57,
  /** La durée est égale aux jours de la période de référence multipliés par 0,75, avec un minimum de 182 jours */
  coefficientDuree: 0.75,
  dureeMinimale: 182,
  /** Carence incompressible (jours) */
  carenceIncompressible: 7,
  /** Diviseur pour différé spécifique */
  diviseurDiffereSpecifique: 111.8,
  /** Plafond différé spécifique (jours) */
  plafondDiffereSpecifique: 150,
  /** Période de référence affiliation (mois) */
  periodeReferenceAffiliation: 24,
  /** Durée minimale affiliation (jours), 130 jours ou 910 heures */
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
