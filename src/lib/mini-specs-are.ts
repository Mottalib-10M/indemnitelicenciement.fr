/**
 * Mini-simulateurs des pages chômage (RECETTE §9.3), en français et en anglais. Un sujet, un calcul :
 * chacun appelle le moteur testé `lib/are.ts` (et l'indemnité légale de `lib/engine.ts`), jamais un second calcul.
 */
import { arce, calculerARE, cumul, demission, PA, type MotifDemission } from './are';
import { calculateCongesPayes, calculateIndemniteLegale } from './engine';
import type { MiniSpec } from './mini-types';

type L = 'fr' | 'en';
const loc = (l: L) => (l === 'fr' ? 'fr-FR' : 'en-GB');
const eur = (l: L) => (x: number) => new Intl.NumberFormat(loc(l), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(x));
const num = (l: L) => (x: number) => new Intl.NumberFormat(loc(l), { maximumFractionDigits: 1 }).format(x);
const A = PA.are;
const legale = (s: number, a: number) => calculateIndemniteLegale(s, Math.floor(a), Math.round((a % 1) * 12));

const salaire = (l: L, def = 2800) => ({ id: 's', label: l === 'fr' ? 'Salaire brut mensuel moyen' : 'Average gross monthly salary', def, unit: '€', max: 500000 });
const age = (l: L, def = 40) => ({ id: 'g', label: l === 'fr' ? 'Âge à la fin du contrat' : 'Age when the contract ends', def, unit: l === 'fr' ? 'ans' : 'yrs', max: 70 });
const anc = (l: L, def = 6) => ({ id: 'a', label: l === 'fr' ? 'Ancienneté dans l’entreprise' : 'Length of service', def, unit: l === 'fr' ? 'ans' : 'yrs', max: 60, decimals: 1 });

type Builder = (l: L) => MiniSpec;

const B: Record<string, Builder> = {
  apresLicenciement: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'Quand tombera votre premier versement d’ARE' : 'When your first benefit payment arrives',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [salaire(l), anc(l, 8), { id: 'i', label: fr ? 'Indemnité de licenciement perçue' : 'Severance actually paid', def: 9000, unit: '€', max: 5000000 },
        { id: 'c', label: fr ? 'Jours de congés non pris' : 'Untaken leave days', def: 10, unit: fr ? 'jours' : 'days', max: 60 },
        { id: 'k', label: fr ? 'Motif' : 'Grounds', def: 0, options: [{ value: '0', label: fr ? 'Licenciement pour motif personnel' : 'Personal grounds' }, { value: '1', label: fr ? 'Licenciement économique' : 'Economic redundancy' }] }],
      run: ({ s, a, i, c, k }) => {
        const lg = legale(s, a); const supra = Math.max(0, i - lg); const iccp = calculateCongesPayes(s * 12, c);
        const r = calculerARE({ brutMensuel: s, moisTravailles: 24, age: 40, motif: k === 1 ? 'economique' : 'licenciement', supraLegal: supra, iccp });
        return {
          head: [fr ? 'Premier jour indemnisé' : 'First paid day', fr ? `J + ${r.premierJour}` : `Day ${r.premierJour}`],
          rows: [[fr ? 'Indemnité légale (minimum)' : 'Statutory minimum', e(lg)], [fr ? 'Part supra-légale' : 'Extra-statutory part', e(supra)],
            [fr ? 'Différé spécifique' : 'Specific deferral', `${r.differeSpecifique} ${fr ? 'j' : 'd'}`], [fr ? 'Différé congés payés' : 'Holiday pay deferral', `${r.differeConges} ${fr ? 'j' : 'd'}`],
            [fr ? 'Délai d’attente' : 'Waiting period', `${r.attente} ${fr ? 'j' : 'd'}`]],
          note: fr ? `Compté depuis le lendemain de la fin du contrat, inscription faite à temps. ARE ensuite : ${e(r.netteMensuelle)} net par mois.` : `Counted from the day after the contract ends, assuming you register in time. Then ${e(r.netteMensuelle)} net a month.`,
        };
      },
    };
  },
  rcChomage: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'Votre rupture conventionnelle, de l’indemnité au chômage' : 'Your mutual termination, from payout to benefit',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [salaire(l), anc(l), { id: 'i', label: fr ? 'Indemnité négociée' : 'Negotiated payment', def: 12000, unit: '€', max: 5000000 }, age(l)],
      run: ({ s, a, i, g }) => {
        const lg = legale(s, a) || Math.round(s * 0.25 * a); const supra = Math.max(0, i - lg);
        const r = calculerARE({ brutMensuel: s, moisTravailles: 36, age: g, motif: 'rupture_conventionnelle', supraLegal: supra });
        return {
          head: [fr ? 'Durée maximale de l’ARE' : 'Maximum benefit length', `${r.duree.jours} ${fr ? 'jours' : 'days'}`],
          rows: [[fr ? 'Indemnité minimale (légale)' : 'Legal minimum payment', e(lg)], [fr ? 'Part supra-légale' : 'Extra-statutory part', e(supra)],
            [fr ? 'Report du premier versement' : 'First payment delayed by', `${r.premierJour} ${fr ? 'jours' : 'days'}`], [fr ? 'ARE nette par mois' : 'Net benefit a month', e(r.netteMensuelle)]],
          note: i > 0 && i < lg ? (fr ? 'Indemnité inférieure au minimum légal : la convention ne serait pas homologuée.' : 'Below the legal minimum: the agreement would not be approved.') : (fr ? 'Fin de contrat à partir du 1er septembre 2026.' : 'Contract ending on or after 1 September 2026.'),
        };
      },
    };
  },
  rcVsLicenciement: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'Rupture conventionnelle ou licenciement : ce que coûte le plafond' : 'Mutual termination or dismissal: what the cap costs',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [salaire(l), age(l), { id: 'm', label: fr ? 'Mois travaillés (24 ou 36 derniers)' : 'Months worked (last 24 or 36)', def: 24, unit: fr ? 'mois' : 'mths', max: 600 }],
      run: ({ s, g, m }) => {
        const rc = calculerARE({ brutMensuel: s, moisTravailles: m, age: g, motif: 'rupture_conventionnelle' });
        const li = calculerARE({ brutMensuel: s, moisTravailles: m, age: g, motif: 'licenciement' });
        return {
          head: [fr ? 'ARE nette en moins' : 'Net benefit lost', e(li.totalNet - rc.totalNet)],
          rows: [[fr ? 'Durée après licenciement' : 'Length after dismissal', `${li.duree.jours} ${fr ? 'j' : 'd'}`], [fr ? 'Durée après rupture conventionnelle' : 'Length after mutual termination', `${rc.duree.jours} ${fr ? 'j' : 'd'}`],
            [fr ? 'Total net, licenciement' : 'Net total, dismissal', e(li.totalNet)], [fr ? 'Total net, rupture conventionnelle' : 'Net total, mutual termination', e(rc.totalNet)]],
          note: rc.duree.prolongationSenior > 0 ? (fr ? `Prolongation possible de ${rc.duree.prolongationSenior} jours sur demande.` : `Up to ${rc.duree.prolongationSenior} extra days on request.`) : undefined,
        };
      },
    };
  },
  droits: (l) => {
    const fr = l === 'fr';
    return {
      title: fr ? 'Avez-vous droit au chômage, et pour combien de temps ?' : 'Are you entitled, and for how long?',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [{ id: 'm', label: fr ? 'Mois travaillés sur 24 mois (36 dès 55 ans)' : 'Months worked in 24 months (36 from 55)', def: 14, unit: fr ? 'mois' : 'mths', max: 600, decimals: 1 }, age(l, 30),
        { id: 'p', label: fr ? 'Première indemnisation depuis 20 ans ?' : 'First claim in 20 years?', def: 0, options: [{ value: '0', label: fr ? 'Non' : 'No' }, { value: '1', label: fr ? 'Oui' : 'Yes' }] }],
      run: ({ m, g, p }) => {
        const r = calculerARE({ brutMensuel: 2000, moisTravailles: m, age: g, primoEntrant: p === 1 });
        const d = r.duree;
        const regle = fr ? { coefficient: 'jours × coefficient', minimum: 'durée minimale', plafond_age: 'plafond de l’âge', plafond_rc: 'plafond' } : { coefficient: 'days × coefficient', minimum: 'guaranteed minimum', plafond_age: 'age cap', plafond_rc: 'cap' };
        return {
          head: [fr ? 'Durée des droits' : 'Length of entitlement', d.eligible ? `${d.jours} ${fr ? 'jours' : 'days'}` : (fr ? 'pas de droit' : 'no entitlement')],
          rows: [[fr ? 'Mois retenus' : 'Months counted', num(l)(d.moisRetenus)], [fr ? 'Jours calendaires de la période' : 'Calendar days in the period', String(d.joursPeriode)],
            [fr ? 'Règle appliquée' : 'Rule applied', d.eligible ? regle[d.regle] : '—'], [fr ? 'Soit environ' : 'About', d.eligible ? `${num(l)(d.mois)} ${fr ? 'mois' : 'months'}` : '—']],
          note: d.admisPrimo ? (fr ? 'Ouverture au titre des primo-entrants (5 mois).' : 'Opened under the first-time claimant rule (5 months).') : d.eligible ? undefined : (fr ? `Il faut ${A.affiliation_months} mois (${A.primo.affiliation_months} pour un primo-entrant).` : `You need ${A.affiliation_months} months (${A.primo.affiliation_months} for a first-time claimant).`),
        };
      },
    };
  },
  demission: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'Après une démission : droit immédiat, ou réexamen au 122e jour' : 'After resigning: paid now, or reviewed on day 122',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [{ id: 'q', label: fr ? 'Motif de la démission' : 'Reason for resigning', def: 0, options: [
        { value: '0', label: fr ? 'Convenance personnelle' : 'Personal choice' }, { value: '1', label: fr ? 'Motif légitime (suivi de conjoint, salaires impayés…)' : 'Legitimate reason (following a partner, unpaid wages…)' },
        { value: '2', label: fr ? 'Projet de reconversion validé' : 'Approved career-change project' }, { value: '3', label: fr ? 'Emploi repris puis quitté en moins de 65 jours' : 'New job quit within 65 days' }] },
        { id: 'y', label: fr ? 'Années de travail continu' : 'Years of continuous work', def: 6, unit: fr ? 'ans' : 'yrs', max: 60, decimals: 1 }, salaire(l)],
      run: ({ q, y, s }) => {
        const motif: MotifDemission = (['non_legitime', 'legitime', 'projet', 'reprise_courte'] as const)[q] ?? 'non_legitime';
        const d = demission({ motif, joursTravaillesContinus: Math.round(y * 260) });
        const r = calculerARE({ brutMensuel: s, moisTravailles: 24, age: 40, motif: 'demission_legitime' });
        return {
          head: [fr ? 'Droit à l’ARE' : 'Entitlement', d.droit ? (fr ? 'oui, dès l’inscription' : 'yes, from registration') : (fr ? `réexamen, au plus tôt J + ${d.jourReexamen}` : `review, day ${d.jourReexamen} at the earliest`)],
          rows: [[fr ? 'ARE nette si elle est accordée' : 'Net benefit if granted', `${e(r.netteMensuelle)} ${fr ? '/ mois' : '/ month'}`],
            [fr ? 'Projet de reconversion : seuil' : 'Career-change project: threshold', fr ? `${A.demission.projet_days} jours en ${A.demission.projet_window_months} mois` : `${A.demission.projet_days} days in ${A.demission.projet_window_months} months`]],
          note: motif === 'projet' && !d.droit ? (fr ? 'Moins de 5 ans de travail continu : le projet ne suffit pas.' : 'Under 5 years of continuous work: the project route is closed.') : undefined,
        };
      },
    };
  },
  cumul: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'Reprendre un emploi en gardant une partie de l’ARE' : 'Taking a job while keeping part of your benefit',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [{ ...salaire(l, 3000), label: fr ? 'Ancien salaire brut mensuel' : 'Former gross monthly salary' }, { id: 'n', label: fr ? 'Salaire brut de la nouvelle activité' : 'Gross pay from the new job', def: 1200, unit: '€', max: 500000 }],
      run: ({ s, n }) => {
        const r = calculerARE({ brutMensuel: s, moisTravailles: 24, age: 40 });
        const c = cumul({ brute: r.brute, sjr: r.sjr, salaireActivite: n });
        return {
          head: [fr ? 'ARE brute versée ce mois' : 'Gross benefit paid this month', e(c.verse)],
          rows: [[fr ? 'Jours indemnisés' : 'Days paid', `${c.jours} / ${A.days_per_month}`], [fr ? 'Salaire + ARE (brut)' : 'Pay + benefit (gross)', e(c.total)],
            [fr ? 'Jours reportés en fin de droits' : 'Days carried to the end', String(c.joursReportes)], [fr ? 'Plafond : ancien salaire' : 'Ceiling: former salary', e(c.plafond)]],
          note: c.plafonne ? (fr ? 'Le plafond de l’ancien salaire limite le cumul ce mois-ci.' : 'The former-salary ceiling limits the top-up this month.') : undefined,
        };
      },
    };
  },
  arce: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'ARCE : le capital que vous toucheriez pour créer votre entreprise' : 'ARCE: the lump sum for starting your business',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [salaire(l, 3200), { id: 'm', label: fr ? 'Mois déjà indemnisés' : 'Months already paid', def: 2, unit: fr ? 'mois' : 'mths', max: 60, decimals: 1 }, age(l)],
      run: ({ s, m, g }) => {
        const r = calculerARE({ brutMensuel: s, moisTravailles: 36, age: g });
        const reste = Math.max(0, r.duree.jours - Math.round(m * A.days_per_month));
        const a = arce({ brute: r.brute, joursRestants: reste });
        return {
          head: [fr ? 'ARCE nette' : 'Net ARCE', e(a.net)],
          rows: [[fr ? 'Droits restants' : 'Remaining days', `${reste} ${fr ? 'jours' : 'days'}`], [fr ? 'Deux versements de' : 'Two payments of', e(a.versement)],
            [fr ? 'ARE restante si vous la gardez (brut)' : 'Benefit left if you keep it (gross)', e(a.reliquat)], [fr ? 'Abandonné en prenant le capital' : 'Given up by taking the lump sum', e(a.renonce)]],
          note: fr ? 'Le second versement intervient six mois après le premier, si l’activité continue.' : 'The second payment comes six months later, if the business is still running.',
        };
      },
    };
  },
  degressivite: (l) => {
    const e = eur(l), fr = l === 'fr';
    return {
      title: fr ? 'Votre ARE avant et après le 7e mois' : 'Your benefit before and after month 7',
      cta: fr ? 'Simulateur chômage complet' : 'Full unemployment benefit calculator',
      inputs: [salaire(l, 6500), age(l, 45)],
      run: ({ s, g }) => {
        const r = calculerARE({ brutMensuel: s, moisTravailles: 24, age: g });
        return {
          head: [fr ? 'Nette par mois dès le 7e mois' : 'Net a month from month 7', e(r.netteMensuelleApres)],
          rows: [[fr ? 'Nette les 6 premiers mois' : 'Net for the first 6 months', e(r.netteMensuelle)], [fr ? 'Brute par jour, avant / après' : 'Gross per day, before / after', `${e(r.brute)} / ${e(r.bruteApres)}`],
            [fr ? 'Perte nette par mois' : 'Net loss a month', e(r.netteMensuelle - r.netteMensuelleApres)], [fr ? 'Perte nette sur la durée' : 'Net loss over the claim', e((r.netteMensuelle - r.netteMensuelleApres) / A.days_per_month * Math.max(0, r.duree.jours - (A.degressivity.from_day - 1)))]],
          note: r.degressif ? undefined : (g >= A.degressivity.exempt_age ? (fr ? 'À partir de 55 ans à la fin du contrat, pas de dégressivité.' : 'No degressivity if you are 55 or over when the contract ends.') : (fr ? 'Allocation sous le plancher : pas de dégressivité.' : 'Benefit below the floor: no degressivity.')),
        };
      },
    };
  },
};

export function getAreSpec(kind: string, lang?: string): MiniSpec | undefined {
  const b = B[kind]; return b ? b(lang === 'en' ? 'en' : 'fr') : undefined;
}
