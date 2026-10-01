/** Mini-simulateurs des guides (RECETTE §9.3), calculés par le moteur de l'indemnité de licenciement. */
import { simulerLicenciement, calculatePreavis, calculateIndemniteLegale, calculateCongesPayes } from './engine';
import type { MiniSpec } from './mini-types';

const eur = (x: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(x));
const dec = (x: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(x);
const salaire = (def = 3000) => ({ id: 's', label: 'Salaire brut mensuel moyen', def, unit: '€', max: 100000 });
const annees = (def = 8) => ({ id: 'a', label: 'Ancienneté en années', def, unit: 'ans', max: 50, decimals: 1 });
const S = (s: number, a: number, o: Partial<Parameters<typeof simulerLicenciement>[0]> = {}) => simulerLicenciement({ salaireBrutMensuel: s, ancienneteAnnees: Math.floor(a), ancienneteMois: Math.round((a % 1) * 12), cadre: false, age: 40, joursCongesAcquis: 10, salaireBrutAnnuel: s * 12, ...o });

const SPECS: Record<string, MiniSpec> = {
  legale: { title: 'Votre indemnité légale de licenciement', cta: 'Simulateur complet', inputs: [salaire(), annees()], run: ({ s, a }) => {
    const r = S(s, a); return { head: ['Indemnité légale', r.eligible ? eur(r.indemniteLegale) : 'pas de droit'], rows: [['Salaire de référence', eur(r.salaireReference)], ['Préavis', `${dec(r.preavisMois)} mois`], ['Total avec préavis et congés', eur(r.totalIndemnites)]], note: r.eligible ? undefined : r.motifNonEligible };
  } },
  total: { title: 'Ce que vous toucherez en quittant l’entreprise', cta: 'Simulateur complet', inputs: [salaire(), annees()], run: ({ s, a }) => {
    const r = S(s, a); return { head: ['Total des indemnités', eur(r.totalIndemnites)], rows: [['Indemnité légale', eur(r.indemniteLegale)], ['Indemnité compensatrice de préavis', eur(r.indemniteCompensatricePreavis)], ['Congés payés non pris (10 jours)', eur(r.indemniteCongesPayes)]] };
  } },
  are: { title: 'Votre allocation chômage après le licenciement', cta: 'Simulateur complet', inputs: [salaire(), annees()], run: ({ s, a }) => {
    const r = S(s, a); return { head: ['ARE brute par mois', eur(r.are.allocationMensuelle)], rows: [['Allocation journalière', eur(r.are.allocationJournaliere)], ['Délai avant le premier versement', `${r.carenceTotaleJours} jours`]] };
  } },
  preavis: { title: 'Votre préavis de licenciement', cta: 'Simulateur complet', inputs: [salaire(), annees(), { id: 'c', label: 'Statut', def: 0, options: [{ value: '0', label: 'Non-cadre' }, { value: '1', label: 'Cadre' }] }], run: ({ s, a, c }) => {
    const m = calculatePreavis(Math.floor(a), c === 1); return { head: ['Durée du préavis légal', `${dec(m)} mois`], rows: [['Indemnité compensatrice si dispense', eur(m * s)], ['Minimum légal, sauf convention plus favorable', 'Code du travail, art. L1234-1']] };
  } },
  fauteGrave: { title: 'Ce qui reste dû en cas de faute grave', cta: 'Simulateur complet', inputs: [salaire(), { id: 'j', label: 'Jours de congés acquis non pris', def: 10, unit: 'jours', max: 60, decimals: 1 }], run: ({ s, j }) => {
    const cp = calculateCongesPayes(s * 12, j); return { head: ['Indemnité de congés payés', eur(cp)], rows: [['Indemnité légale de licenciement', '0 € (faute grave)'], ['Préavis', 'non dû']] };
  } },
  inaptitude: { title: 'Indemnité en cas d’inaptitude', cta: 'Simulateur complet', inputs: [salaire(), annees(), { id: 'o', label: 'Origine de l’inaptitude', def: 0, options: [{ value: '0', label: 'Non professionnelle' }, { value: '1', label: 'Accident du travail ou maladie professionnelle' }] }], run: ({ s, a, o }) => {
    const leg = calculateIndemniteLegale(s, Math.floor(a), Math.round((a % 1) * 12)); const pro = o === 1; const pr = calculatePreavis(Math.floor(a), false);
    return { head: [pro ? 'Indemnité spéciale (double)' : 'Indemnité légale', eur(pro ? 2 * leg : leg)], rows: [['Indemnité égale au préavis', pro ? eur(pr * s) : 'non due'], ['Base : indemnité légale', eur(leg)]] };
  } },
  rupture: { title: 'Le minimum de votre rupture conventionnelle', cta: 'Simulateur complet', inputs: [salaire(), annees()], run: ({ s, a }) => {
    const r = S(s, a); return { head: ['Indemnité spécifique minimale', eur(r.indemniteLegale)], rows: [['Égale au minimum à l’indemnité légale', 'art. L1237-13'], ['ARE brute par mois ensuite', eur(r.are.allocationMensuelle)]] };
  } },
};

export function getSpec(kind: string, _lang?: string): MiniSpec {
  const s = SPECS[kind]; if (!s) throw new Error(`Mini-simulateur inconnu : ${kind}`); return s;
}
