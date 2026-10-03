/**
 * Allocation d'aide au retour à l'emploi (ARE), règles au 3 octobre 2026. Fonctions pures.
 *
 * Tous les montants et taux viennent de `data/params-are-2026.json`, chacun relu sur sa source
 * (Unédic, France Travail, service-public.fr, Insee) : aucun nombre réglementaire n'est écrit ici.
 *
 * Ce que le moteur applique, dans l'ordre où France Travail le fait :
 *  1. salaire de référence : salaires bruts de la période, chaque mois plafonné à 4 PASS (16 020 €) ;
 *     SJR = salaires ÷ jours calendaires de la période, soit salaire mensuel × 12 ÷ 365 pour une
 *     période continue (vérifié sur la table Unédic : 75 % du SJR = 32,13 € ↔ 1 303,05 € par mois) ;
 *  2. allocation brute = max(40,4 % SJR + partie fixe, 57 % SJR), plancher 32,13 €, plafond 75 % SJR
 *     (le plafond l'emporte sur le plancher) ;
 *  3. retenues : 3 % du SJR (sans descendre sous 32,13 €), CSG 6,2 % et CRDS 0,5 % sur 98,25 % de
 *     l'allocation brute si elle atteint 61 €, sans ramener l'allocation sous ce seuil ;
 *  4. durée : jours calendaires de la période × 0,75 (modulation conjoncturelle), au moins 182 jours
 *     (152 pour un primo-entrant admis à 5 mois), au plus 548 / 685 / 822 jours selon l'âge, et
 *     456 / 624 jours après une rupture conventionnelle individuelle finissant dès le 1er septembre 2026 ;
 *  5. dégressivité : − 30 % dès le 183e jour indemnisé si l'allocation dépasse 92,57 € et l'âge est
 *     inférieur à 55 ans, sans descendre sous 92,57 € ;
 *  6. différés : congés payés = ICCP ÷ SJR (30 jours au plus) ; spécifique = supra-légal ÷ 111,8
 *     (150 jours, 75 en licenciement économique), entier inférieur ; puis 7 jours d'attente.
 */
import params from '../data/params-are-2026.json';

export const PA = params;
const A = params.are;
const r2 = (x: number) => Math.round(x * 100) / 100;

export type Motif = 'licenciement' | 'economique' | 'rupture_conventionnelle' | 'fin_cdd' | 'demission_legitime' | 'demission';
export type TauxCsg = 'normal' | 'reduit' | 'exonere';
export type RegleMontant = 'variable' | 'fixe57' | 'minimum' | 'plafond75';
export type RegleDuree = 'coefficient' | 'minimum' | 'plafond_age' | 'plafond_rc';

/** Salaire mensuel retenu : chaque mois est plafonné à 4 plafonds mensuels de la Sécurité sociale. */
export const plafondMensuel = () => A.pass_monthly * A.salary_cap_pass;

/** SJR d'une période d'emploi continue : salaire mensuel (plafonné) × 12 ÷ 365. */
export function sjrMensuel(brutMensuel: number): number {
  const m = Math.min(Math.max(0, brutMensuel), plafondMensuel());
  return (m * 12) / A.days_per_year;
}

export function allocationJournaliere(sjr: number): { brute: number; regle: RegleMontant } {
  const variable = A.rate_variable * sjr + A.fixed_part;
  const fixe = A.rate_flat * sjr;
  let brute = Math.max(variable, fixe);
  let regle: RegleMontant = variable >= fixe ? 'variable' : 'fixe57';
  if (brute < A.min_daily) { brute = A.min_daily; regle = 'minimum'; }
  // Le plafond de 75 % du SJR s'applique en dernier : il l'emporte sur l'allocation minimale.
  const plafond = A.max_ratio_sjr * sjr;
  if (brute > plafond) { brute = plafond; regle = 'plafond75'; }
  return { brute: r2(brute), regle };
}

export interface Retenues { retraite: number; csg: number; crds: number; alsace: number; nette: number; exonereCsg: boolean }

/** Retenues sur une allocation journalière brute. CSG/CRDS : assiette 98,25 % de l'allocation brute (France Travail). */
export function retenues(brute: number, sjr: number, o: { csg?: TauxCsg; alsaceMoselle?: boolean } = {}): Retenues {
  const D = A.deductions;
  let retraite = r2(D.retraite_compl_rate * sjr);
  if (brute - retraite < A.min_daily) retraite = r2(Math.max(0, brute - A.min_daily));
  const apres = brute - retraite;
  let csg = 0, crds = 0, alsace = 0;
  const taux = o.csg ?? 'normal';
  const exonere = brute < D.smic_daily_threshold || taux === 'exonere';
  if (!exonere) {
    const base = D.csg_crds_base * brute;
    csg = base * (taux === 'reduit' ? D.csg_reduced_rate : D.csg_rate);
    crds = base * D.crds_rate;
    alsace = o.alsaceMoselle ? base * D.alsace_moselle_rate : 0;
    const total = csg + crds + alsace;
    // Les prélèvements ne peuvent ramener l'allocation sous le SMIC journalier (61 €).
    if (apres - total < D.smic_daily_threshold) {
      const marge = Math.max(0, apres - D.smic_daily_threshold);
      const k = total > 0 ? marge / total : 0;
      csg *= k; crds *= k; alsace *= k;
    }
  }
  csg = r2(csg); crds = r2(crds); alsace = r2(alsace);
  return { retraite, csg, crds, alsace, nette: r2(apres - csg - crds - alsace), exonereCsg: exonere };
}

/** Plafond de durée selon l'âge à la fin du contrat (modulation conjoncturelle en vigueur). */
export function plafondAge(age: number): number {
  const c = A.modulation.active ? A.duration_cap_days : A.duration_cap_days_cfd;
  return age >= A.age_senior_2 ? c['57_plus'] : age >= A.age_senior ? c['55_56'] : c.under_55;
}

/** Plafond propre à la rupture conventionnelle individuelle (fin de contrat dès le 1er septembre 2026). */
export function plafondRupture(age: number, drom = false): number {
  const c = drom ? A.rupture_conventionnelle.cap_days_drom : A.rupture_conventionnelle.cap_days;
  return age >= A.age_senior ? c['55_plus'] : c.under_55;
}

/** Mois de la période de référence : 24, ou 36 dès 55 ans à la fin du contrat. */
export const moisReference = (age: number) => (age >= A.age_senior ? A.reference_months_senior : A.reference_months);

export interface DureeInput {
  /** Mois couverts par un contrat de travail dans la période de référence (le moteur borne à 24 ou 36). */
  moisTravailles: number;
  age: number;
  motif?: Motif;
  /** Fin du contrat à partir du 1er septembre 2026 (seul critère de la règle « rupture conventionnelle »). */
  finApresSeptembre2026?: boolean;
  /** Fin du contrat à partir du 1er avril 2026 (critère de la règle « primo-entrant »). */
  finApresAvril2026?: boolean;
  primoEntrant?: boolean;
  drom?: boolean;
}
export interface DureeResult {
  eligible: boolean; motifRefus?: 'affiliation' | 'demission';
  moisRetenus: number; joursPeriode: number; joursAvantCoefficient: number;
  jours: number; mois: number; regle: RegleDuree; plafond: number; plafondAge: number; minimum: number;
  admisPrimo: boolean; regleRupture: boolean; prolongationSenior: number;
}

export function duree(i: DureeInput): DureeResult {
  const ref = moisReference(i.age);
  const moisRetenus = Math.min(Math.max(0, i.moisTravailles), ref);
  const finAvril = i.finApresAvril2026 ?? true;
  const admisDroitCommun = moisRetenus >= A.affiliation_months;
  const admisPrimo = !admisDroitCommun && !!i.primoEntrant && finAvril && moisRetenus >= A.primo.affiliation_months;
  const demission = i.motif === 'demission';
  const eligible = !demission && (admisDroitCommun || admisPrimo);
  const joursPeriode = Math.round((moisRetenus * A.days_per_year) / 12);
  const pa = plafondAge(i.age);
  const regleRupture = i.motif === 'rupture_conventionnelle' && (i.finApresSeptembre2026 ?? true);
  const pr = regleRupture ? plafondRupture(i.age, i.drom) : Infinity;
  const plafond = Math.min(pa, pr);
  const minimum = admisPrimo ? A.primo.min_duration_days : A.min_duration_days;
  const coef = A.modulation.active ? A.modulation.coefficient : 1;
  const apres = Math.ceil(joursPeriode * coef);
  const borne = Math.max(apres, minimum);
  const jours = eligible ? Math.min(borne, plafond) : 0;
  const regle: RegleDuree = borne > plafond ? (pr < pa ? 'plafond_rc' : 'plafond_age') : apres < minimum ? 'minimum' : 'coefficient';
  // Après une rupture conventionnelle, 55 ans et plus : prolongation possible jusqu'à la durée sans plafond spécifique.
  const prolongationSenior = regleRupture && i.age >= A.age_senior && eligible ? Math.max(0, Math.min(borne, pa) - jours) : 0;
  return {
    eligible, motifRefus: demission ? 'demission' : eligible ? undefined : 'affiliation',
    moisRetenus, joursPeriode, joursAvantCoefficient: joursPeriode, jours, mois: Math.round((jours / A.days_per_month) * 10) / 10,
    regle, plafond, plafondAge: pa, minimum, admisPrimo, regleRupture, prolongationSenior,
  };
}

/** Dégressivité : allocation > 92,57 €, moins de 55 ans, droit au-delà de 182 jours. */
export function degressivite(brute: number, age: number, joursDroit: number) {
  const G = A.degressivity;
  const applicable = brute > G.floor_daily && age < G.exempt_age && joursDroit >= G.from_day;
  const apres = applicable ? r2(Math.max(brute * (1 - G.reduction), G.floor_daily)) : brute;
  return { applicable, apres, perteJournaliere: r2(brute - apres), jourDebut: G.from_day };
}

/** Différé congés payés : ICCP ÷ SJR, entier inférieur, 30 jours au plus. */
export const differeConges = (iccp: number, sjr: number) =>
  sjr > 0 ? Math.min(A.deferral.leave_max_days, Math.floor(Math.max(0, iccp) / sjr)) : 0;

/** Différé spécifique : supra-légal ÷ 111,8, entier inférieur, 150 jours (75 en licenciement économique). */
export const differeSpecifique = (supraLegal: number, economique = false) =>
  Math.min(economique ? A.deferral.specific_max_days_economic : A.deferral.specific_max_days,
    Math.floor(Math.max(0, supraLegal) / A.deferral.specific_divisor));

/**
 * Premier jour indemnisé, compté en jours après la fin du contrat. Les différés courent dès le
 * lendemain de la fin du contrat ; le délai d'attente suit, ou part de l'inscription si elle est plus tardive.
 * Exemples Unédic : fin 1er nov., différé 12 j, inscription le 10 → indemnisé le 20 ; inscription le 1er déc. → le 8 déc.
 */
export function premierJour(o: { differes: number; joursAvantInscription?: number; attenteDejaAppliquee?: boolean }) {
  const attente = o.attenteDejaAppliquee ? 0 : A.waiting_days;
  const depart = Math.max(o.differes, Math.max(0, Math.floor(o.joursAvantInscription ?? 0)));
  return { attente, jour: depart + attente };
}

export interface AREInput extends DureeInput {
  brutMensuel: number;
  /** Indemnités de rupture au-delà du minimum légal (le moteur ne les déduit pas lui-même). */
  supraLegal?: number;
  iccp?: number;
  joursAvantInscription?: number;
  csg?: TauxCsg;
  alsaceMoselle?: boolean;
}
export interface AREResult {
  eligible: boolean; motifRefus?: DureeResult['motifRefus'];
  salaireRetenu: number; plafonne: boolean; sjr: number;
  brute: number; regle: RegleMontant; bruteMensuelle: number; tauxRemplacement: number;
  retenues: Retenues; netteMensuelle: number;
  duree: DureeResult;
  degressif: boolean; bruteApres: number; netteApres: number; netteMensuelleApres: number;
  differeConges: number; differeSpecifique: number; attente: number; premierJour: number;
  totalBrut: number; totalNet: number;
}

export function calculerARE(i: AREInput): AREResult {
  const salaireRetenu = Math.min(Math.max(0, i.brutMensuel), plafondMensuel());
  const sjr = sjrMensuel(i.brutMensuel);
  const { brute, regle } = allocationJournaliere(sjr);
  const ret = retenues(brute, sjr, { csg: i.csg, alsaceMoselle: i.alsaceMoselle });
  const d = duree(i);
  const g = degressivite(brute, i.age, d.jours);
  const retApres = g.applicable ? retenues(g.apres, sjr, { csg: i.csg, alsaceMoselle: i.alsaceMoselle }) : ret;
  const dc = differeConges(i.iccp ?? 0, sjr);
  const ds = differeSpecifique(i.supraLegal ?? 0, i.motif === 'economique');
  const p = premierJour({ differes: dc + ds, joursAvantInscription: i.joursAvantInscription });
  const pleins = g.applicable ? g.jourDebut - 1 : d.jours;
  const reduits = d.jours - pleins;
  return {
    eligible: d.eligible, motifRefus: d.motifRefus,
    salaireRetenu, plafonne: i.brutMensuel > plafondMensuel(), sjr: r2(sjr),
    brute, regle, bruteMensuelle: r2(brute * A.days_per_month), tauxRemplacement: salaireRetenu > 0 ? (brute * A.days_per_month) / salaireRetenu : 0,
    retenues: ret, netteMensuelle: r2(ret.nette * A.days_per_month),
    duree: d,
    degressif: g.applicable, bruteApres: g.apres, netteApres: retApres.nette, netteMensuelleApres: r2(retApres.nette * A.days_per_month),
    differeConges: dc, differeSpecifique: ds, attente: p.attente, premierJour: p.jour,
    totalBrut: d.eligible ? Math.round(pleins * brute + reduits * g.apres) : 0,
    totalNet: d.eligible ? Math.round(pleins * ret.nette + reduits * retApres.nette) : 0,
  };
}

/** Cumul ARE et salaire (Unédic) : J = [ARE mensuelle − 70 % du brut] ÷ ARE journalière, arrondi ; total ≤ SJR × 30,42. */
export function cumul(o: { brute: number; sjr: number; salaireActivite: number }) {
  const C = A.cumul;
  const mensuelle = o.brute * A.days_per_month;
  const s = Math.max(0, o.salaireActivite);
  let jours = o.brute > 0 ? Math.max(0, Math.round((mensuelle - C.deduction_rate * s) / o.brute)) : 0;
  const plafond = r2(o.sjr * C.ceiling_days);
  let plafonne = false;
  if (s + jours * o.brute > plafond) {
    jours = o.brute > 0 ? Math.max(0, Math.floor((plafond - s) / o.brute)) : 0;
    plafonne = true;
  }
  jours = Math.min(jours, A.days_per_month);
  const verse = r2(jours * o.brute);
  return { jours, verse, total: r2(s + verse), plafond, plafonne, joursReportes: A.days_per_month - jours, gainVsChomage: r2(s + verse - mensuelle) };
}

/** ARCE : 60 % du reliquat de droits, moins 3 % de retraite complémentaire, en deux versements à six mois d'écart. */
export function arce(o: { brute: number; joursRestants: number }) {
  const R = A.arce;
  const reliquat = r2(Math.max(0, o.brute) * Math.max(0, o.joursRestants));
  const capital = r2(reliquat * R.rate);
  const retenue = r2(capital * R.retenue);
  const net = r2(capital - retenue);
  return { reliquat, capital, retenue, net, versement: r2(net / R.payments), renonce: r2(reliquat - capital), plafondCumulJours: Math.floor(Math.max(0, o.joursRestants) * A.cumul.creator_cap_share) };
}

/** Démission : droit selon le motif ; sinon réexamen par l'instance paritaire après 121 jours (versement au 122e). */
export type MotifDemission = 'non_legitime' | 'legitime' | 'projet' | 'reprise_courte';
export function demission(o: { motif: MotifDemission; joursTravaillesContinus?: number }) {
  const D = A.demission;
  if (o.motif === 'legitime') return { droit: true, regle: 'legitime' as const, jourReexamen: 0 };
  if (o.motif === 'reprise_courte') return { droit: true, regle: 'reprise_courte' as const, jourReexamen: 0 };
  if (o.motif === 'projet') {
    const ok = (o.joursTravaillesContinus ?? 0) >= D.projet_days;
    return { droit: ok, regle: ok ? ('projet' as const) : ('projet_insuffisant' as const), jourReexamen: ok ? 0 : D.review_after_days + 1 };
  }
  return { droit: false, regle: 'reexamen' as const, jourReexamen: D.review_after_days + 1 };
}
