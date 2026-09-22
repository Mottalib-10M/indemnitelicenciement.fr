/**
 * Moteur de calcul — Indemnité de licenciement et droits du salarié
 * Conforme au Code du travail français (barèmes 2026)
 */

import {
  INDEMNITE_LEGALE,
  PREAVIS,
  CONGES_PAYES,
  ARE,
  SMIC_BRUT_MENSUEL,
} from './baremes-2026';

// =============================================================================
// Types
// =============================================================================

export interface LicenciementInput {
  /** Salaire brut mensuel (ou moyenne des 12 derniers mois) */
  salaireBrutMensuel: number;
  /** Moyenne des 3 derniers mois de salaire brut (optionnel, pour le calcul du salaire de référence) */
  salaireBrut3DerniersMois?: number;
  /** Ancienneté en années complètes */
  ancienneteAnnees: number;
  /** Ancienneté en mois supplémentaires (0-11) */
  ancienneteMois: number;
  /** Le salarié est-il cadre ? */
  cadre: boolean;
  /** Âge du salarié */
  age: number;
  /** Indemnité supra-légale éventuelle (négociée) */
  indemniteSupraLegale?: number;
  /** Jours de congés payés acquis non pris */
  joursCongesAcquis?: number;
  /** Salaire brut annuel (pour le calcul des congés payés) */
  salaireBrutAnnuel?: number;
}

export interface AREResult {
  /** Salaire journalier de référence */
  sjr: number;
  /** Montant journalier ARE */
  allocationJournaliere: number;
  /** Montant mensuel ARE (x 30 jours) */
  allocationMensuelle: number;
  /** Durée d'indemnisation en jours */
  dureeJours: number;
  /** Durée d'indemnisation en mois */
  dureeMois: number;
  /** Détail de la formule retenue */
  formuleRetenue: string;
}

export interface LicenciementResult {
  /** Le salarié est-il éligible à l'indemnité légale ? */
  eligible: boolean;
  /** Motif de non-éligibilité */
  motifNonEligible?: string;
  /** Salaire de référence retenu */
  salaireReference: number;
  /** Indemnité légale de licenciement */
  indemniteLegale: number;
  /** Durée du préavis en mois */
  preavisMois: number;
  /** Indemnité compensatrice de préavis */
  indemniteCompensatricePreavis: number;
  /** Indemnité compensatrice de congés payés */
  indemniteCongesPayes: number;
  /** Indemnité supra-légale */
  indemniteSupraLegale: number;
  /** Total brut des indemnités */
  totalIndemnites: number;
  /** Résultat ARE */
  are: AREResult;
  /** Différé spécifique en jours */
  differeSpecifiqueJours: number;
  /** Carence totale en jours */
  carenceTotaleJours: number;
  /** Ancienneté totale en années (avec mois) */
  ancienneteTotale: number;
}

// =============================================================================
// Fonctions de calcul
// =============================================================================

/**
 * Calcule le salaire de référence : le maximum entre la moyenne des 12 derniers
 * mois et la moyenne des 3 derniers mois.
 */
export function calculateSalaireReference(
  salaireMensuel12Mois: number,
  salaire3DerniersMois?: number
): number {
  if (salaire3DerniersMois && salaire3DerniersMois > salaireMensuel12Mois) {
    return salaire3DerniersMois;
  }
  return salaireMensuel12Mois;
}

/**
 * Calcule l'indemnité légale de licenciement.
 * Art. R1234-2 du Code du travail :
 * - 1/4 de mois par année pour les 10 premières années
 * - 1/3 de mois par année au-delà de 10 ans
 */
export function calculateIndemniteLegale(
  salaireMensuel: number,
  ancienneteAnnees: number,
  ancienneteMois: number = 0
): number {
  const ancienneteTotale = ancienneteAnnees + ancienneteMois / 12;
  const ancienneteTotaleMois = ancienneteAnnees * 12 + ancienneteMois;

  // Vérifier l'éligibilité (8 mois minimum)
  if (ancienneteTotaleMois < INDEMNITE_LEGALE.ancienneteMinimumMois) {
    return 0;
  }

  let indemnité = 0;

  if (ancienneteTotale <= 10) {
    indemnité = salaireMensuel * INDEMNITE_LEGALE.tauxJusque10Ans * ancienneteTotale;
  } else {
    // 10 premières années à 1/4
    indemnité = salaireMensuel * INDEMNITE_LEGALE.tauxJusque10Ans * 10;
    // Au-delà de 10 ans à 1/3
    indemnité += salaireMensuel * INDEMNITE_LEGALE.tauxAuDela10Ans * (ancienneteTotale - 10);
  }

  return Math.round(indemnité * 100) / 100;
}

/**
 * Calcule la durée du préavis de licenciement en mois.
 * Art. L1234-1 du Code du travail.
 */
export function calculatePreavis(
  ancienneteAnnees: number,
  cadre: boolean = false
): number {
  if (cadre) {
    return PREAVIS.cadre;
  }

  const ancienneteMois = ancienneteAnnees * 12;

  if (ancienneteMois < 6) {
    return PREAVIS.moinsde6Mois;
  } else if (ancienneteAnnees < 2) {
    return PREAVIS.de6MoisA2Ans;
  } else {
    return PREAVIS.deuxAnsEtPlus;
  }
}

/**
 * Calcule l'indemnité compensatrice de congés payés.
 * Méthode du 1/10e : 10% de la rémunération brute totale.
 */
export function calculateCongesPayes(
  salaireBrutAnnuel: number,
  joursAcquis: number
): number {
  if (joursAcquis <= 0) return 0;

  // Méthode du 1/10e
  const indemniteDixieme =
    (salaireBrutAnnuel * CONGES_PAYES.tauxDixieme * joursAcquis) /
    CONGES_PAYES.maxJoursAnnuels;

  return Math.round(indemniteDixieme * 100) / 100;
}

/**
 * Calcule l'Allocation de Retour à l'Emploi (ARE).
 * On retient la formule la plus avantageuse pour le salarié.
 */
export function calculateARE(
  salaireBrutMensuel: number,
  ancienneteJours: number,
  age: number
): AREResult {
  // Salaire journalier de référence
  const salaireBrutAnnuel = salaireBrutMensuel * 12;
  let sjr = salaireBrutAnnuel / 365;

  // Plafonnement du SJR
  if (sjr > ARE.plafondSJRFixe) {
    sjr = ARE.plafondSJRFixe;
  }

  // Formule 1 : 40.4% du SJR + 12.95€
  const formule1 = sjr * ARE.tauxFormule1 + ARE.partieFixeJournaliere;

  // Formule 2 : 57% du SJR
  const formule2 = sjr * ARE.tauxFormule2;

  // On retient le montant le plus élevé
  let allocationJournaliere: number;
  let formuleRetenue: string;

  if (formule1 >= formule2) {
    allocationJournaliere = formule1;
    formuleRetenue = `40,4% du SJR (${sjr.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€) + 12,95€ = ${formule1.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
  } else {
    allocationJournaliere = formule2;
    formuleRetenue = `57% du SJR (${sjr.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€) = ${formule2.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
  }

  // Plancher
  if (allocationJournaliere < ARE.minimumJournalier) {
    allocationJournaliere = ARE.minimumJournalier;
  }

  // Plafond : 75% du SJR
  const plafond75 = sjr * 0.75;
  if (allocationJournaliere > plafond75) {
    allocationJournaliere = plafond75;
  }

  allocationJournaliere = Math.round(allocationJournaliere * 100) / 100;

  // Durée d'indemnisation
  const dureeMax =
    age >= ARE.ageSenior ? ARE.dureeMaxSenior : ARE.dureeMaxStandard;

  // Durée = jours travaillés dans la période de référence, plafonnée
  let dureeJours = Math.min(ancienneteJours, dureeMax);

  // Minimum 130 jours d'affiliation
  if (ancienneteJours < ARE.dureeMinimaleAffiliation) {
    dureeJours = 0;
  }

  const allocationMensuelle = Math.round(allocationJournaliere * 30 * 100) / 100;

  return {
    sjr: Math.round(sjr * 100) / 100,
    allocationJournaliere,
    allocationMensuelle,
    dureeJours,
    dureeMois: Math.round((dureeJours / 30.44) * 10) / 10,
    formuleRetenue,
  };
}

/**
 * Calcule le différé spécifique d'indemnisation.
 * = Indemnités supra-légales / 102.4, plafonné à 150 jours.
 */
export function calculateDiffereSpecifique(
  indemniteSupraLegale: number
): number {
  if (indemniteSupraLegale <= 0) return 0;

  const differe = Math.ceil(
    indemniteSupraLegale / ARE.diviseurDiffereSpecifique
  );

  return Math.min(differe, ARE.plafondDiffereSpecifique);
}

/**
 * Simulation complète d'un licenciement.
 * Rassemble tous les calculs en un seul résultat.
 */
export function simulerLicenciement(
  input: LicenciementInput
): LicenciementResult {
  const ancienneteTotale =
    input.ancienneteAnnees + input.ancienneteMois / 12;
  const ancienneteTotaleMois =
    input.ancienneteAnnees * 12 + input.ancienneteMois;

  // Éligibilité
  if (ancienneteTotaleMois < INDEMNITE_LEGALE.ancienneteMinimumMois) {
    const salaireRef = calculateSalaireReference(
      input.salaireBrutMensuel,
      input.salaireBrut3DerniersMois
    );

    return {
      eligible: false,
      motifNonEligible: `Ancienneté insuffisante : ${ancienneteTotaleMois} mois (minimum requis : ${INDEMNITE_LEGALE.ancienneteMinimumMois} mois)`,
      salaireReference: salaireRef,
      indemniteLegale: 0,
      preavisMois: 0,
      indemniteCompensatricePreavis: 0,
      indemniteCongesPayes: 0,
      indemniteSupraLegale: input.indemniteSupraLegale ?? 0,
      totalIndemnites: input.indemniteSupraLegale ?? 0,
      are: calculateARE(
        input.salaireBrutMensuel,
        Math.round(ancienneteTotale * 365.25),
        input.age
      ),
      differeSpecifiqueJours: calculateDiffereSpecifique(
        input.indemniteSupraLegale ?? 0
      ),
      carenceTotaleJours: ARE.carenceIncompressible,
      ancienneteTotale,
    };
  }

  // Salaire de référence
  const salaireReference = calculateSalaireReference(
    input.salaireBrutMensuel,
    input.salaireBrut3DerniersMois
  );

  // Indemnité légale
  const indemniteLegale = calculateIndemniteLegale(
    salaireReference,
    input.ancienneteAnnees,
    input.ancienneteMois
  );

  // PREAVIS
  const preavisMois = calculatePreavis(input.ancienneteAnnees, input.cadre);
  const indemniteCompensatricePreavis =
    Math.round(salaireReference * preavisMois * 100) / 100;

  // Congés payés
  const salaireBrutAnnuel =
    input.salaireBrutAnnuel ?? input.salaireBrutMensuel * 12;
  const joursConges = input.joursCongesAcquis ?? 0;
  const indemniteCongesPayes = calculateCongesPayes(
    salaireBrutAnnuel,
    joursConges
  );

  // Supra-légale
  const indemniteSupraLegale = input.indemniteSupraLegale ?? 0;

  // Total
  const totalIndemnites =
    Math.round(
      (indemniteLegale +
        indemniteCompensatricePreavis +
        indemniteCongesPayes +
        indemniteSupraLegale) *
        100
    ) / 100;

  // ARE
  const ancienneteJours = Math.round(ancienneteTotale * 365.25);
  const are = calculateARE(input.salaireBrutMensuel, ancienneteJours, input.age);

  // Différé spécifique
  const differeSpecifiqueJours =
    calculateDiffereSpecifique(indemniteSupraLegale);

  // Carence totale
  const carenceTotaleJours = ARE.carenceIncompressible + differeSpecifiqueJours;

  return {
    eligible: true,
    salaireReference,
    indemniteLegale,
    preavisMois,
    indemniteCompensatricePreavis,
    indemniteCongesPayes,
    indemniteSupraLegale,
    totalIndemnites,
    are,
    differeSpecifiqueJours,
    carenceTotaleJours,
    ancienneteTotale,
  };
}
