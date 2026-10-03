/**
 * Valeurs réglementaires mises en forme pour le texte des pages chômage. Une valeur tirée des
 * paramètres ne s'écrit jamais en dur dans une page (RECETTE §17.4, point 7) : les pages lisent ceci.
 * Les montants officiels gardent leurs décimales (§4.1) ; les résultats calculés s'affichent en entiers.
 */
import { calculerARE, PA } from './are';

const A = PA.are;
const D = A.deductions;

function make(locale: 'fr-FR' | 'en-GB') {
  const eur2 = (x: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(x) ? 0 : 2, maximumFractionDigits: 2 }).format(x);
  const eur0 = (x: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(x));
  const pc = (x: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(x);
  const n = (x: number, d = 2) => new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(x);
  return {
    eur0, eur2, pc, n,
    min: eur2(A.min_daily), fixe: eur2(A.fixed_part), var: pc(A.rate_variable), flat: pc(A.rate_flat), cap75: pc(A.max_ratio_sjr),
    plafondSalaire: eur0(A.pass_monthly * A.salary_cap_pass), pass: eur0(A.pass_monthly),
    coef: n(A.modulation.coefficient), chomage: pc(A.modulation.unemployment_rate_t2_2026 / 100), seuilCfd: pc(A.modulation.trigger_rate / 100), hausseCfd: n(A.modulation.trigger_quarterly_rise, 1),
    cap55: n(A.duration_cap_days.under_55, 0), cap5556: n(A.duration_cap_days['55_56'], 0), cap57: n(A.duration_cap_days['57_plus'], 0),
    cfd55: n(A.duration_cap_days_cfd.under_55, 0), cfd5556: n(A.duration_cap_days_cfd['55_56'], 0), cfd57: n(A.duration_cap_days_cfd['57_plus'], 0),
    minDuree: n(A.min_duration_days, 0), minPrimo: n(A.primo.min_duration_days, 0),
    rc55: n(A.rupture_conventionnelle.cap_days.under_55, 0), rc55p: n(A.rupture_conventionnelle.cap_days['55_plus'], 0),
    rcDrom: n(A.rupture_conventionnelle.cap_days_drom.under_55, 0), rcDromP: n(A.rupture_conventionnelle.cap_days_drom['55_plus'], 0),
    rcExt5556: n(A.rupture_conventionnelle.extension_days['55_56'], 0), rcExt57: n(A.rupture_conventionnelle.extension_days['57_plus'], 0),
    degPlancher: eur2(A.degressivity.floor_daily), degTaux: pc(A.degressivity.reduction), degJour: n(A.degressivity.from_day, 0), degAge: n(A.degressivity.exempt_age, 0),
    div: n(A.deferral.specific_divisor, 1), dsMax: n(A.deferral.specific_max_days, 0), dsMaxEco: n(A.deferral.specific_max_days_economic, 0), dcMax: n(A.deferral.leave_max_days, 0),
    attente: n(A.waiting_days, 0), ret: pc(D.retraite_compl_rate), csg: pc(D.csg_rate), csgR: pc(D.csg_reduced_rate), crds: pc(D.crds_rate), assiette: pc(D.csg_crds_base),
    seuilCsg: eur2(D.smic_daily_threshold), alsace: pc(D.alsace_moselle_rate),
    cumulTaux: pc(A.cumul.deduction_rate), cumulJours: n(A.cumul.ceiling_days), createur: pc(A.cumul.creator_cap_share),
    arceTaux: pc(A.arce.rate), arceRet: pc(A.arce.retenue), arceDelai: n(A.arce.second_after_months, 0),
    dem65: n(A.demission.min_days_after_resignation, 0), dem121: n(A.demission.review_after_days, 0), dem122: n(A.demission.review_after_days + 1, 0),
    projetJours: n(A.demission.projet_days, 0), projetMois: n(A.demission.projet_window_months, 0),
    aff: n(A.affiliation_days, 0), affH: n(A.affiliation_hours, 0), affM: n(A.affiliation_months, 0), primoJ: n(A.primo.affiliation_days, 0), primoH: n(A.primo.affiliation_hours, 0), primoM: n(A.primo.affiliation_months, 0),
    ref: n(A.reference_months, 0), refS: n(A.reference_months_senior, 0), age55: n(A.age_senior, 0), age57: n(A.age_senior_2, 0),
    bascule: eur0((A.fixed_part / (A.rate_flat - A.rate_variable)) * A.days_per_year / 12),
    seuilDeg: eur0(A.degressivity.floor_daily / A.rate_flat * A.days_per_year / 12),
    inscription: n(A.registration_deadline_months, 0), jpm: n(A.days_per_month, 0),
  };
}
export const V = { fr: make('fr-FR'), en: make('en-GB') };

/** Exemples chiffrés produits par le moteur, pour les tableaux des pages. */
export function exemple(brut: number, age = 40, mois = 24, extra: Partial<Parameters<typeof calculerARE>[0]> = {}) {
  return calculerARE({ brutMensuel: brut, moisTravailles: mois, age, ...extra });
}
