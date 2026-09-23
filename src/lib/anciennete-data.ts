/**
 * Données programmatiques — Pages par ancienneté
 * Génère des pages /indemnite-licenciement-[X]-ans/ pour le SEO
 */

import {
  INDEMNITE_LEGALE,
  PREAVIS,
  SMIC_BRUT_MENSUEL,
} from './baremes-2026';
import { calculateIndemniteLegale, calculatePreavis } from './engine';

// =============================================================================
// Types
// =============================================================================

export interface AncienneteEntry {
  /** Nombre d'années d'ancienneté */
  annees: number;
  /** Slug URL (ex: "5" pour /indemnite-licenciement-5-ans/) */
  slug: string;
  /** Conseils contextuels adaptés à cette ancienneté */
  conseils: string[];
  /** Description du profil type pour cette ancienneté */
  profilType: string;
  /** Titre SEO de la page */
  titreSEO: string;
  /** Meta description */
  metaDescription: string;
}

export interface ExempleCalcul {
  salaireBrut: number;
  salaireLabel: string;
  indemniteLegale: number;
  preavisMois: number;
  indemnitePreavis: number;
  total: number;
}

// =============================================================================
// Données des 20 niveaux d'ancienneté (18 entries as specified)
// =============================================================================

export const ancienneteData: AncienneteEntry[] = [
  {
    annees: 1,
    slug: '1',
    conseils: [
      "Avec seulement 1 an d'ancienneté, vérifiez que vous avez bien dépassé le seuil de 8 mois ininterrompus pour être éligible à l'indemnité légale.",
      "Votre préavis sera de 1 mois si vous êtes non-cadre. Négociez une dispense de préavis si vous avez déjà retrouvé un emploi.",
      "Même avec une faible ancienneté, vous avez droit à l'allocation chômage (ARE) si vous avez travaillé au moins 130 jours sur les 24 derniers mois.",
      "Pensez à vérifier votre convention collective : certaines prévoient des indemnités plus favorables que le minimum légal dès la première année.",
    ],
    profilType: "Salarié en début de parcours dans l'entreprise, souvent en phase d'intégration ou de validation de poste. Profil fréquent chez les jeunes actifs ou les salariés ayant récemment changé d'employeur.",
    titreSEO: "Indemnité de licenciement après 1 an — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 1 an d'ancienneté en 2026. Montant légal, préavis, exemples chiffrés et droits du salarié.",
  },
  {
    annees: 2,
    slug: '2',
    conseils: [
      "À 2 ans d'ancienneté, votre préavis passe à 2 mois (non-cadre), ce qui augmente significativement votre indemnité compensatrice.",
      "Vous franchissez un seuil important : le licenciement sans cause réelle et sérieuse ouvre droit à des dommages et intérêts devant les prud'hommes (barème Macron).",
      "Votre indemnité légale est encore modeste (1/2 mois de salaire). Tentez de négocier une indemnité supra-légale lors de l'entretien préalable.",
      "Vérifiez vos droits à la portabilité de la mutuelle : vous bénéficiez d'un maintien gratuit pouvant aller jusqu'à 12 mois.",
    ],
    profilType: "Salarié ayant passé la période d'essai et acquis une première expérience significative dans l'entreprise. Souvent un profil en consolidation de compétences.",
    titreSEO: "Indemnité de licenciement après 2 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 2 ans d'ancienneté. Exemples de calcul, préavis de 2 mois et droits aux prud'hommes.",
  },
  {
    annees: 3,
    slug: '3',
    conseils: [
      "Avec 3 ans d'ancienneté, votre indemnité légale représente 3/4 de mois de salaire. C'est le moment de bien vérifier votre convention collective.",
      "En cas de licenciement économique, vous pouvez bénéficier du contrat de sécurisation professionnelle (CSP) qui offre une indemnisation plus avantageuse.",
      "Votre durée d'indemnisation chômage sera conséquente : jusqu'à 24 mois si vous avez travaillé en continu.",
      "Pensez à demander un bilan de compétences dans le cadre de votre CPF pour préparer votre reconversion éventuelle.",
    ],
    profilType: "Salarié opérationnel et autonome sur son poste, ayant développé des compétences spécifiques à l'entreprise. Profil courant chez les 25-35 ans en début de carrière.",
    titreSEO: "Indemnité de licenciement après 3 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 3 ans d'ancienneté en 2026. Exemples chiffrés, droits au CSP et allocation chômage.",
  },
  {
    annees: 4,
    slug: '4',
    conseils: [
      "À 4 ans d'ancienneté, votre indemnité légale atteint 1 mois de salaire complet. Un montant qu'il est possible de doubler par la négociation.",
      "Le barème Macron prévoit désormais des indemnités prud'homales plus élevées : entre 1 et 5 mois de salaire en cas de licenciement abusif.",
      "Si vous êtes licencié pour motif économique, renseignez-vous sur le plan de sauvegarde de l'emploi (PSE) si l'entreprise emploie plus de 50 salariés.",
      "Faites le point sur votre compte personnel de formation (CPF) : vous avez accumulé des droits à la formation qui restent acquis après le licenciement.",
    ],
    profilType: "Salarié expérimenté dans l'entreprise, souvent en charge de missions à responsabilité croissante. Peut avoir évolué en interne.",
    titreSEO: "Indemnité de licenciement après 4 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 4 ans. Montant légal d'un mois de salaire, barème prud'homal et conseils de négociation.",
  },
  {
    annees: 5,
    slug: '5',
    conseils: [
      "5 ans d'ancienneté est un jalon important : votre indemnité légale représente 1,25 mois de salaire brut, soit un montant non négligeable.",
      "En cas de licenciement sans cause réelle et sérieuse, le barème Macron prévoit entre 1,5 et 6 mois de salaire de dommages et intérêts.",
      "Vous avez droit à 2 mois de préavis (non-cadre) ou 3 mois (cadre). L'indemnité compensatrice de préavis s'ajoute à l'indemnité de licenciement.",
      "Pensez à négocier : avec 5 ans d'ancienneté, l'employeur a intérêt à trouver un accord amiable pour éviter un contentieux prud'homal.",
    ],
    profilType: "Salarié confirmé avec une bonne connaissance de l'entreprise et de son secteur. Profil fréquent pour les premiers licenciements économiques ou les réorganisations.",
    titreSEO: "Indemnité de licenciement après 5 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 5 ans d'ancienneté. 1,25 mois de salaire minimum, préavis, chômage et barème prud'homal.",
  },
  {
    annees: 6,
    slug: '6',
    conseils: [
      "À 6 ans d'ancienneté, votre indemnité légale atteint 1,5 mois de salaire brut. Vérifiez si votre convention collective ne prévoit pas mieux.",
      "Le plafond du barème Macron pour les dommages et intérêts prud'homaux augmente à 6,5 mois de salaire.",
      "En cas de licenciement économique, vous bénéficiez d'une priorité de réembauche pendant 1 an à compter de la rupture du contrat.",
      "N'oubliez pas de vérifier vos droits à la portabilité de la prévoyance (décès, invalidité, incapacité) en plus de la mutuelle.",
    ],
    profilType: "Salarié fidèle à l'entreprise, ayant potentiellement connu une ou plusieurs évolutions de poste. Souvent en milieu de carrière.",
    titreSEO: "Indemnité de licenciement après 6 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 6 ans d'ancienneté en 2026. 1,5 mois de salaire, droits prud'homaux et priorité de réembauche.",
  },
  {
    annees: 7,
    slug: '7',
    conseils: [
      "Avec 7 ans d'ancienneté, votre indemnité légale représente 1,75 mois de salaire. Un montant qui justifie pleinement une consultation juridique.",
      "Votre ancienneté renforce votre position de négociation : les employeurs préfèrent souvent une rupture conventionnelle à un contentieux.",
      "Si votre licenciement est contestable, les dommages et intérêts aux prud'hommes peuvent atteindre 7 mois de salaire brut.",
      "Pensez à demander une lettre de recommandation à votre employeur : après 7 ans, votre expérience dans l'entreprise est un atout sur le marché.",
    ],
    profilType: "Salarié senior dans l'entreprise, avec une expertise reconnue et des responsabilités établies. Profil courant dans les restructurations.",
    titreSEO: "Indemnité de licenciement après 7 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 7 ans d'ancienneté. 1,75 mois de salaire, négociation et droits prud'homaux jusqu'à 7 mois.",
  },
  {
    annees: 8,
    slug: '8',
    conseils: [
      "8 ans d'ancienneté vous donnent droit à 2 mois de salaire d'indemnité légale. C'est un montant significatif à protéger.",
      "Le barème Macron prévoit entre 3 et 8 mois de salaire de dommages et intérêts en cas de licenciement abusif.",
      "Vérifiez attentivement le motif de licenciement invoqué par l'employeur : après 8 ans, un licenciement mal motivé est facilement contestable.",
      "Demandez un accompagnement par un conseiller en évolution professionnelle (CEP) : ce service est gratuit et peut vous aider à rebondir.",
    ],
    profilType: "Salarié durablement installé dans l'entreprise, avec une ancienneté qui témoigne d'un engagement mutuel. Souvent en poste à responsabilité.",
    titreSEO: "Indemnité de licenciement après 8 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 8 ans. 2 mois de salaire brut, barème Macron et conseils pour contester un licenciement.",
  },
  {
    annees: 9,
    slug: '9',
    conseils: [
      "À 9 ans d'ancienneté, votre indemnité légale atteint 2,25 mois de salaire. Vous approchez du seuil des 10 ans où le taux augmente.",
      "Vérifiez si des mois supplémentaires ne vous feraient pas franchir le cap des 10 ans (taux de 1/3 au lieu de 1/4 par année au-delà).",
      "Votre position est forte pour négocier : ancienneté conséquente, risque prud'homal élevé pour l'employeur, indemnité de préavis de 2 mois minimum.",
      "Conservez précieusement vos bulletins de salaire des 12 derniers mois et des 3 derniers mois : ils sont essentiels pour le calcul du salaire de référence.",
    ],
    profilType: "Salarié très expérimenté, à l'approche du seuil des 10 ans. Souvent dans une position de cadre intermédiaire ou de technicien spécialisé.",
    titreSEO: "Indemnité de licenciement après 9 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 9 ans d'ancienneté. 2,25 mois de salaire, seuil des 10 ans et stratégie de négociation.",
  },
  {
    annees: 10,
    slug: '10',
    conseils: [
      "10 ans d'ancienneté est un seuil majeur : votre indemnité légale atteint 2,5 mois de salaire (1/4 × 10 ans). C'est aussi le point de bascule du barème.",
      "À partir de 10 ans révolus, chaque année supplémentaire est indemnisée à 1/3 de mois de salaire au lieu de 1/4. Un avantage significatif.",
      "Le barème Macron prévoit jusqu'à 10 mois de salaire de dommages et intérêts en cas de licenciement abusif avec 10 ans d'ancienneté.",
      "Faites-vous accompagner par un avocat en droit du travail : avec 10 ans d'ancienneté, les enjeux financiers justifient pleinement les honoraires.",
    ],
    profilType: "Salarié de longue date, profondément ancré dans la culture et les processus de l'entreprise. Souvent cadre, manager ou expert technique reconnu.",
    titreSEO: "Indemnité de licenciement après 10 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 10 ans. 2,5 mois de salaire minimum, seuil du taux majoré (1/3) et barème prud'homal.",
  },
  {
    annees: 12,
    slug: '12',
    conseils: [
      "Avec 12 ans d'ancienneté, votre indemnité légale bénéficie du taux majoré : 2,5 mois (10 premières années) + 0,67 mois (2 ans à 1/3) = 3,17 mois de salaire.",
      "En cas de plan social (PSE), les indemnités supra-légales proposées sont souvent bien supérieures au minimum légal pour cette ancienneté.",
      "Votre durée d'indemnisation chômage (ARE) sera de 24 mois maximum. Préparez votre budget de transition en conséquence.",
      "Envisagez une rupture conventionnelle plutôt qu'un licenciement : les conditions financières peuvent être plus avantageuses et le processus moins conflictuel.",
    ],
    profilType: "Salarié de longue ancienneté, ayant souvent connu plusieurs réorganisations de l'entreprise. Profil managérial ou expert métier avec une forte valeur ajoutée.",
    titreSEO: "Indemnité de licenciement après 12 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 12 ans d'ancienneté. Taux majoré 1/3 au-delà de 10 ans, PSE et rupture conventionnelle.",
  },
  {
    annees: 15,
    slug: '15',
    conseils: [
      "15 ans d'ancienneté : votre indemnité légale atteint environ 4,17 mois de salaire. C'est un montant conséquent qui mérite une attention particulière.",
      "Le barème Macron plafonne les dommages et intérêts à 13 mois de salaire pour 15 ans d'ancienneté. Un argument puissant en négociation.",
      "Si vous avez plus de 53 ans, votre durée d'indemnisation chômage peut aller jusqu'à 30 mois au lieu de 24 mois.",
      "Avec 15 ans dans la même entreprise, une validation des acquis de l'expérience (VAE) peut vous permettre d'obtenir un diplôme reconnu.",
    ],
    profilType: "Salarié très fidèle, ayant construit une partie importante de sa carrière dans l'entreprise. Souvent cadre supérieur, directeur de service ou expert incontournable.",
    titreSEO: "Indemnité de licenciement après 15 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 15 ans. 4,17 mois de salaire minimum, barème Macron, ARE majorée pour les seniors.",
  },
  {
    annees: 18,
    slug: '18',
    conseils: [
      "18 ans d'ancienneté vous donnent droit à environ 5,17 mois de salaire d'indemnité légale. Un montant substantiel à sécuriser.",
      "Le barème Macron prévoit jusqu'à 14,5 mois de salaire de dommages et intérêts pour 18 ans d'ancienneté. Un risque que l'employeur voudra éviter.",
      "Avec une ancienneté aussi importante, la négociation d'un départ est souvent plus avantageuse qu'un contentieux : l'employeur a intérêt à transiger.",
      "Préparez votre projet de reconversion dès l'annonce du licenciement : à ce stade, une transition professionnelle nécessite un accompagnement structuré.",
    ],
    profilType: "Salarié emblématique de l'entreprise, porteur de la mémoire institutionnelle et des savoir-faire critiques. Souvent en fin de carrière ou en reconversion.",
    titreSEO: "Indemnité de licenciement après 18 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 18 ans d'ancienneté. 5,17 mois de salaire, négociation supra-légale et transition professionnelle.",
  },
  {
    annees: 20,
    slug: '20',
    conseils: [
      "20 ans d'ancienneté : votre indemnité légale atteint environ 5,83 mois de salaire brut. Un jalon symbolique et financier majeur.",
      "Le barème Macron plafonne à 15,5 mois de salaire les dommages et intérêts prud'homaux. Un levier puissant pour négocier une indemnité supra-légale.",
      "Vérifiez si votre convention collective prévoit des dispositions spécifiques pour les salariés de longue ancienneté (primes de fidélité, etc.).",
      "Après 20 ans dans une entreprise, la portabilité de vos droits (mutuelle, prévoyance, CPF) est essentielle. Faites un audit complet de vos avantages.",
    ],
    profilType: "Salarié ayant consacré deux décennies à l'entreprise, souvent à un poste stratégique. Son départ représente une perte de compétences significative pour l'employeur.",
    titreSEO: "Indemnité de licenciement après 20 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 20 ans. 5,83 mois de salaire minimum, négociation supra-légale et droits du salarié senior.",
  },
  {
    annees: 22,
    slug: '22',
    conseils: [
      "22 ans d'ancienneté : votre indemnité légale représente environ 6,5 mois de salaire brut. La convention collective peut aller bien au-delà.",
      "En cas de plan de sauvegarde de l'emploi (PSE), les indemnités proposées pour cette ancienneté sont souvent de l'ordre de 1 à 2 mois par année.",
      "Si vous approchez de la retraite, étudiez l'option de la retraite progressive ou du cumul emploi-retraite pour optimiser votre fin de carrière.",
      "Le barème Macron plafonne à 16,5 mois de salaire les dommages et intérêts : une information essentielle pour la négociation.",
    ],
    profilType: "Salarié de très longue ancienneté, souvent dans les dernières étapes de sa carrière. Profil fréquent dans les grandes entreprises et les administrations.",
    titreSEO: "Indemnité de licenciement après 22 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 22 ans d'ancienneté. 6,5 mois de salaire, PSE, retraite progressive et droits du salarié.",
  },
  {
    annees: 25,
    slug: '25',
    conseils: [
      "25 ans d'ancienneté : un quart de siècle dédié à l'entreprise. Votre indemnité légale atteint environ 7,5 mois de salaire brut.",
      "Le barème Macron prévoit jusqu'à 17,5 mois de salaire de dommages et intérêts pour 25 ans d'ancienneté. Un risque financier majeur pour l'employeur.",
      "Avec 25 ans d'ancienneté, vous avez accumulé des droits considérables : CPF, congés d'ancienneté, jours de RTT. Vérifiez leur solde avant votre départ.",
      "Si vous êtes proche de la retraite, vérifiez si un maintien en emploi jusqu'à l'âge de départ ne serait pas plus avantageux qu'un licenciement.",
    ],
    profilType: "Salarié emblématique, véritable pilier de l'entreprise. Son départ nécessite souvent un plan de succession structuré. Profil de direction ou d'expertise rare.",
    titreSEO: "Indemnité de licenciement après 25 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 25 ans. 7,5 mois de salaire minimum, barème Macron 17,5 mois et préparation retraite.",
  },
  {
    annees: 28,
    slug: '28',
    conseils: [
      "28 ans d'ancienneté vous donnent droit à environ 8,5 mois de salaire d'indemnité légale. Un montant qui justifie un accompagnement juridique premium.",
      "À ce niveau d'ancienneté, la négociation d'un package de départ complet (indemnité, outplacement, maintien de la mutuelle) est incontournable.",
      "Le barème Macron plafonne à 19 mois de salaire les dommages et intérêts : un argument de poids face à l'employeur.",
      "Évaluez l'impact fiscal de votre indemnité : au-delà de l'exonération légale, la partie supra-légale peut être soumise à l'impôt sur le revenu.",
    ],
    profilType: "Salarié en fin de carrière, ayant traversé toutes les transformations de l'entreprise. Son départ s'inscrit souvent dans une stratégie de pré-retraite.",
    titreSEO: "Indemnité de licenciement après 28 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 28 ans d'ancienneté. 8,5 mois de salaire, package de départ et optimisation fiscale.",
  },
  {
    annees: 30,
    slug: '30',
    conseils: [
      "30 ans d'ancienneté : votre indemnité légale atteint environ 9,17 mois de salaire brut. Un montant exceptionnel qui reflète votre engagement.",
      "Le barème Macron prévoit le plafond maximal de 20 mois de salaire de dommages et intérêts pour 30 ans et plus d'ancienneté.",
      "Avec 30 ans de carrière, vous êtes probablement proche de la retraite. Étudiez l'option du maintien des droits chômage jusqu'à la liquidation de votre retraite.",
      "Faites réaliser un audit complet de votre situation par un avocat spécialisé : indemnité conventionnelle, droits à la retraite, fiscalité, protection sociale.",
    ],
    profilType: "Salarié historique de l'entreprise, ayant consacré l'essentiel de sa carrière à un même employeur. Son départ est un événement majeur, souvent lié à la retraite.",
    titreSEO: "Indemnité de licenciement après 30 ans — Calcul 2026",
    metaDescription: "Calculez votre indemnité de licenciement après 30 ans. 9,17 mois de salaire minimum, plafond Macron 20 mois et droits à la retraite.",
  },
];

// =============================================================================
// Niveaux de salaire pour les exemples de calcul
// =============================================================================

const exempleSalaires = [
  { salaireBrut: 1802, salaireLabel: 'SMIC (~1 802 €)' },
  { salaireBrut: 2500, salaireLabel: '2 500 €' },
  { salaireBrut: 4000, salaireLabel: '4 000 €' },
];

// =============================================================================
// Pages jalons pour le maillage interne
// =============================================================================

/**
 * Anciennetes conservant une page dediee.
 *
 * 1 an : sous le seuil de deux ans, preavis d'un mois.
 * 5 ans : milieu de la premiere tranche, cas le plus frequent.
 * 10 ans : derniere annee au quart de mois, juste avant la bascule.
 * 15 et 20 ans : au-dela du seuil, ou le calcul se dedouble.
 * 25 et 30 ans : carrieres longues, ou l'ecart avec le minimum legal est le
 * plus grand et la convention collective la plus determinante.
 *
 * Retirer une anciennete d'ici demande une redirection dans
 * `astro.config.mjs`, faute de quoi son URL retournerait une 404.
 */
export const ANCIENNETES_AVEC_PAGE = [1, 5, 10, 15, 20, 25, 30];

export const pagesJalons = [1, 5, 10, 15, 20, 25, 30];

// =============================================================================
// Fonctions utilitaires
// =============================================================================

/**
 * Génère les exemples de calcul pour une ancienneté donnée
 */
export function getExemplesCalcul(annees: number): ExempleCalcul[] {
  return exempleSalaires.map(({ salaireBrut, salaireLabel }) => {
    const indemniteLegale = calculateIndemniteLegale(salaireBrut, annees, 0);
    const preavisMois = calculatePreavis(annees, false);
    const indemnitePreavis = Math.round(salaireBrut * preavisMois * 100) / 100;
    const total = Math.round((indemniteLegale + indemnitePreavis) * 100) / 100;

    return {
      salaireBrut,
      salaireLabel,
      indemniteLegale,
      preavisMois,
      indemnitePreavis,
      total,
    };
  });
}

/**
 * Retourne les pages adjacentes pour le maillage interne
 */
export function getPagesAdjacentes(annees: number): { precedent?: AncienneteEntry; suivant?: AncienneteEntry } {
  const index = ancienneteData.findIndex((e) => e.annees === annees);
  return {
    precedent: index > 0 ? ancienneteData[index - 1] : undefined,
    suivant: index < ancienneteData.length - 1 ? ancienneteData[index + 1] : undefined,
  };
}

/**
 * Retourne les pages jalons (sans la page courante)
 */
export function getPagesJalons(anneesCourante: number): AncienneteEntry[] {
  return ancienneteData.filter(
    (e) => pagesJalons.includes(e.annees) && e.annees !== anneesCourante
  );
}

/**
 * Formatte un montant en euros
 */
export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount);
}
