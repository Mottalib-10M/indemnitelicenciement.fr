/**
 * Données programmatiques — Pages par niveau de salaire
 * Génère des pages /indemnite-licenciement-[X]-euros/ pour le SEO
 */

import { SMIC_BRUT_MENSUEL } from './baremes-2026';
import { calculateIndemniteLegale, calculatePreavis } from './engine';

// =============================================================================
// Types
// =============================================================================

export interface SalaireEntry {
  /** Salaire brut mensuel */
  salaireBrut: number;
  /** Slug URL (ex: "2500" pour /indemnite-licenciement-2500-euros/) */
  slug: string;
  /** Label affiché */
  label: string;
  /** Description du profil type pour ce niveau de salaire */
  profilType: string;
  /** Est-ce le SMIC ? */
  isSmic: boolean;
  /** Titre SEO */
  titreSEO: string;
  /** Meta description */
  metaDescription: string;
}

export interface ExempleParAnciennete {
  annees: number;
  indemniteLegale: number;
  preavisMois: number;
  indemnitePreavis: number;
  total: number;
}

// =============================================================================
// 8 niveaux de salaire
// =============================================================================

export const salaireData: SalaireEntry[] = [
  {
    salaireBrut: 1802,
    slug: '1802',
    label: '1 802 € (SMIC)',
    profilType: "Salarié rémunéré au SMIC, profil fréquent dans la restauration, le commerce, le nettoyage, la logistique ou l'aide à la personne. Représente environ 17 % des salariés en France.",
    isSmic: true,
    titreSEO: "Indemnité de licenciement au SMIC (1 802 €) — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement au SMIC (1 802 € brut). Tableau par ancienneté, préavis, allocation chômage et droits du salarié.",
  },
  {
    salaireBrut: 2000,
    slug: '2000',
    label: '2 000 €',
    profilType: "Salarié légèrement au-dessus du SMIC, profil courant chez les employés qualifiés, les agents d'accueil, les vendeurs ou les assistants administratifs.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 2 000 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour un salaire de 2 000 € brut. Tableau complet par ancienneté et estimation du chômage.",
  },
  {
    salaireBrut: 2500,
    slug: '2500',
    label: '2 500 €',
    profilType: "Salarié au salaire médian français, profil typique des techniciens, des secrétaires expérimentés, des commerciaux débutants ou des agents de maîtrise.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 2 500 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour un salaire de 2 500 € brut. Exemples par ancienneté, préavis et allocation chômage ARE.",
  },
  {
    salaireBrut: 3000,
    slug: '3000',
    label: '3 000 €',
    profilType: "Salarié à un niveau de rémunération courant pour les cadres débutants, les techniciens supérieurs, les commerciaux confirmés ou les chefs d'équipe.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 3 000 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour un salaire de 3 000 € brut mensuel. Tableau détaillé par ancienneté et droits complets.",
  },
  {
    salaireBrut: 3500,
    slug: '3500',
    label: '3 500 €',
    profilType: "Salarié dans la tranche supérieure, profil fréquent chez les cadres intermédiaires, les ingénieurs juniors, les responsables d'équipe ou les commerciaux expérimentés.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 3 500 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour 3 500 € brut. Indemnité légale, préavis cadre et estimation ARE par ancienneté.",
  },
  {
    salaireBrut: 4000,
    slug: '4000',
    label: '4 000 €',
    profilType: "Cadre confirmé, ingénieur expérimenté, manager intermédiaire ou consultant senior. Ce niveau de salaire est supérieur au plafond de la Sécurité sociale.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 4 000 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour 4 000 € brut. Tableau par ancienneté, indemnité cadre, préavis 3 mois et chômage.",
  },
  {
    salaireBrut: 5000,
    slug: '5000',
    label: '5 000 €',
    profilType: "Cadre supérieur, directeur de service, ingénieur senior ou manager expérimenté. Rémunération typique des grandes entreprises et de l'industrie.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 5 000 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour 5 000 € brut. Indemnité cadre supérieur, préavis 3 mois et optimisation fiscale.",
  },
  {
    salaireBrut: 6000,
    slug: '6000',
    label: '6 000 €',
    profilType: "Cadre dirigeant, directeur, ingénieur principal ou professionnel hautement qualifié. Rémunération fréquente en Île-de-France et dans les secteurs de la tech et de la finance.",
    isSmic: false,
    titreSEO: "Indemnité de licenciement pour 6 000 € brut — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement pour 6 000 € brut. Cadre dirigeant : indemnité légale, fiscalité et package de départ.",
  },
];

// =============================================================================
// Niveaux d'ancienneté pour les tableaux
// =============================================================================

export const anciennetesTableau = [1, 2, 5, 10, 15, 20, 25];

// =============================================================================
// Fonctions utilitaires
// =============================================================================

/**
 * Génère le tableau d'indemnités par ancienneté pour un salaire donné
 */
export function getTableauParAnciennete(salaireBrut: number): ExempleParAnciennete[] {
  return anciennetesTableau.map((annees) => {
    const indemniteLegale = calculateIndemniteLegale(salaireBrut, annees, 0);
    const preavisMois = calculatePreavis(annees, false);
    const indemnitePreavis = Math.round(salaireBrut * preavisMois * 100) / 100;
    const total = Math.round((indemniteLegale + indemnitePreavis) * 100) / 100;

    return {
      annees,
      indemniteLegale,
      preavisMois,
      indemnitePreavis,
      total,
    };
  });
}

/**
 * Retourne les autres pages salaires pour le maillage interne
 */
export function getAutresSalaires(salaireCourant: number): SalaireEntry[] {
  return salaireData.filter((e) => e.salaireBrut !== salaireCourant);
}

/**
 * Formatte un montant en euros
 */
export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}
