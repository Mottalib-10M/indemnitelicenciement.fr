/**
 * Simulateur chômage (ARE) complet, français et anglais. Calcul instantané par le moteur testé
 * `lib/are.ts` ; l'indemnité légale de licenciement vient du moteur du site (`lib/engine.ts`), ce qui
 * permet de déduire la part supra-légale et le différé spécifique sans demander au visiteur de la calculer.
 *
 * Hydratation (RECETTE §17.5) : premier rendu = valeurs par défaut ; les paramètres d'un lien partagé
 * sont appliqués dans un useEffect. L'état n'est écrit dans l'adresse qu'après une interaction.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { calculerARE, PA, type Motif, type TauxCsg } from '../../lib/are';
import { calculateIndemniteLegale } from '../../lib/engine';
import { NumberField, SelectField, Toggle } from './fields';

type Lang = 'fr' | 'en';
const A = PA.are;
const D = A.deductions;
/** Valeurs des paramètres mises en forme selon la langue : jamais écrites en dur (RECETTE §17.4, point 7). */
const n = (x: number, loc: string, d = 2) => new Intl.NumberFormat(loc, { maximumFractionDigits: d }).format(x);
const pc = (x: number, loc: string) => new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(x);
const F = (loc: string) => ({
  csgN: pc(D.csg_rate, loc), csgR: pc(D.csg_reduced_rate, loc), ret: pc(D.retraite_compl_rate, loc), als: pc(D.alsace_moselle_rate, loc),
  div: n(A.deferral.specific_divisor, loc, 1), var: pc(A.rate_variable, loc), flat: pc(A.rate_flat, loc), cap: pc(A.max_ratio_sjr, loc),
  coef: n(A.modulation.coefficient, loc), deg: pc(A.degressivity.reduction, loc),
  rcM: n(A.rupture_conventionnelle.cap_days_drom.under_55 / 30.4, loc, 0), rcM2: n(A.rupture_conventionnelle.cap_days_drom['55_plus'] / 30.4, loc, 0),
});
const FR = F('fr-FR'), EN = F('en-GB');

const T = {
  fr: {
    locale: 'fr-FR', salaire: 'Salaire brut mensuel moyen', salaireHelp: 'Primes comprises, hors indemnités de rupture',
    age: 'Âge à la fin du contrat', mois: 'Mois travaillés sur les 24 derniers mois', moisHelp: (r: number, ref: number) => `${r} mois retenus sur ${ref} (36 dès 55 ans)`,
    motif: 'Fin du contrat', motifs: [['licenciement', 'Licenciement (motif personnel)'], ['economique', 'Licenciement économique'], ['rupture_conventionnelle', 'Rupture conventionnelle'], ['fin_cdd', 'Fin de CDD ou de mission'], ['demission_legitime', 'Démission légitime'], ['demission', 'Démission non légitime']] as Array<[string, string]>,
    anc: 'Ancienneté dans l’entreprise', ancUnit: 'ans', indem: 'Indemnité de rupture perçue', indemHelp: (l: string) => `Indemnité légale calculée : ${l}. Laissez 0 si vous touchez le minimum.`,
    plus: 'Options avancées : congés payés, inscription, CSG, outre-mer', iccp: 'Indemnité de congés payés (ICCP)', iccpHelp: 'Ligne « indemnité compensatrice de congés payés » du solde de tout compte',
    insc: 'Jours entre la fin du contrat et l’inscription', inscHelp: 'Les droits ne sont jamais rétroactifs', primo: 'Première ouverture de droits depuis 20 ans', non: 'Non', oui: 'Oui', primoHelp: '5 mois suffisent (fin de contrat dès le 1er avril 2026)',
    date: 'Date de fin du contrat (rupture conventionnelle)', dates: [['apres', 'À partir du 1er septembre 2026'], ['avant', 'Avant le 1er septembre 2026']] as Array<[string, string]>,
    csg: 'CSG selon votre revenu fiscal', csgs: [['normal', `Taux normal ${FR.csgN}`], ['reduit', `Taux réduit ${FR.csgR}`], ['exonere', 'Exonéré']] as Array<[string, string]>,
    alsace: 'Régime local Alsace-Moselle', alsaceHelp: `${FR.als} de cotisation maladie en plus`, drom: 'Résidence en outre-mer (hors Mayotte)', dromHelp: `Plafond rupture conventionnelle : ${FR.rcM} ou ${FR.rcM2} mois`,
    head: 'Allocation chômage nette par mois', headSub: (b: string, j: string) => `${b} brut, soit ${j} brut par jour`, nonEligible: 'Pas de droit à l’ARE en l’état',
    refusAff: (m: number) => `Il faut 6 mois de travail (130 jours ou 910 heures) sur la période de référence ; ${m} mois saisis. Un primo-entrant peut ouvrir un droit dès 5 mois.`,
    refusDem: 'Une démission non légitime n’ouvre pas de droit. Après 121 jours de chômage non indemnisé, l’instance paritaire peut réexaminer le dossier : versement au plus tôt le 122e jour.',
    brute: 'Allocation brute (30 jours)', retraite: `Retraite complémentaire (${FR.ret} du SJR)`, csgL: 'CSG', crds: 'CRDS', alsaceL: 'Alsace-Moselle', nette: 'Allocation nette',
    regle: { variable: `${FR.var} du SJR + partie fixe`, fixe57: `${FR.flat} du SJR`, minimum: 'allocation minimale', plafond75: `plafond de ${FR.cap} du SJR` },
    sjr: 'Salaire journalier de référence', plafonne: (p: string) => ` (salaire plafonné à ${p} par mois)`, taux: 'Taux de remplacement brut',
    dureeT: 'Durée des droits', jours: 'jours', moisU: 'mois', regleD: { coefficient: `jours de la période × ${FR.coef}`, minimum: 'durée minimale garantie', plafond_age: 'plafond selon l’âge', plafond_rc: 'plafond rupture conventionnelle' },
    prolong: (j: number) => `À 55 ans et plus, prolongation possible de ${j} jours sur demande à France Travail.`,
    degT: 'À partir du 7e mois', degTxt: (x: string) => `Dégressivité de ${FR.deg} : ${x} net par mois`, degNon: 'Pas de dégressivité',
    calT: 'Premier jour indemnisé', calJ: (j: number) => `${j} jours après la fin du contrat`, dc: 'Différé congés payés', ds: `Différé spécifique (supra-légal ÷ ${FR.div})`, att: 'Délai d’attente', supra: 'Part supra-légale retenue',
    total: 'Total net sur toute la durée', totalB: 'Total brut',
    copier: 'Copier le résultat', copie: 'Copié', partager: 'Copier le lien', imprimer: 'Imprimer', maxMsg: (m: string) => `Plafond de saisie : ${m}`,
    hyp: 'Hypothèses : emploi continu sur la période, temps plein, montants en vigueur depuis le 1er juillet 2025 (non revalorisés au 1er juillet 2026). Estimation indicative ; France Travail notifie le montant exact.', methode: 'Méthode et sources',
    methodeHref: '/simulateur-chomage/#methode',
  },
  en: {
    locale: 'en-GB', salaire: 'Average gross monthly salary', salaireHelp: 'Bonuses included, termination payments excluded',
    age: 'Age when the contract ends', mois: 'Months worked in the last 24 months', moisHelp: (r: number, ref: number) => `${r} of ${ref} months counted (36 from age 55)`,
    motif: 'How the job ended', motifs: [['licenciement', 'Dismissal (personal grounds)'], ['economique', 'Economic redundancy'], ['rupture_conventionnelle', 'Mutual termination (rupture conventionnelle)'], ['fin_cdd', 'End of fixed-term or temp contract'], ['demission_legitime', 'Resignation for a legitimate reason'], ['demission', 'Ordinary resignation']] as Array<[string, string]>,
    anc: 'Length of service with the employer', ancUnit: 'yrs', indem: 'Termination payment received', indemHelp: (l: string) => `Statutory severance computed: ${l}. Leave 0 if you get the minimum.`,
    plus: 'Advanced options: holiday pay, registration, CSG, overseas', iccp: 'Payment in lieu of untaken leave (ICCP)', iccpHelp: 'The “indemnité compensatrice de congés payés” line on your final pay slip',
    insc: 'Days between contract end and registration', inscHelp: 'Benefit is never backdated', primo: 'First claim in 20 years', non: 'No', oui: 'Yes', primoHelp: '5 months are enough (contracts ending from 1 April 2026)',
    date: 'Contract end date (mutual termination)', dates: [['apres', 'On or after 1 September 2026'], ['avant', 'Before 1 September 2026']] as Array<[string, string]>,
    csg: 'CSG rate (depends on your tax income)', csgs: [['normal', `Standard rate ${EN.csgN}`], ['reduit', `Reduced rate ${EN.csgR}`], ['exonere', 'Exempt']] as Array<[string, string]>,
    alsace: 'Alsace-Moselle local scheme', alsaceHelp: `An extra ${EN.als} health contribution`, drom: 'Living in an overseas department', dromHelp: `Mutual termination cap: ${EN.rcM} or ${EN.rcM2} months`,
    head: 'Net unemployment benefit per month', headSub: (b: string, j: string) => `${b} gross, i.e. ${j} gross per day`, nonEligible: 'No entitlement to ARE as entered',
    refusAff: (m: number) => `You need 6 months of work (130 days or 910 hours) in the reference period; you entered ${m}. First-time claimants can qualify from 5 months.`,
    refusDem: 'An ordinary resignation gives no entitlement. After 121 days of unpaid unemployment a joint committee can review your case: payment from day 122 at the earliest.',
    brute: 'Gross benefit (30 days)', retraite: `Supplementary pension (${EN.ret} of SJR)`, csgL: 'CSG', crds: 'CRDS', alsaceL: 'Alsace-Moselle', nette: 'Net benefit',
    regle: { variable: `${EN.var} of SJR + fixed part`, fixe57: `${EN.flat} of SJR`, minimum: 'minimum daily benefit', plafond75: `cap at ${EN.cap} of SJR` },
    sjr: 'Daily reference wage (SJR)', plafonne: (p: string) => ` (salary capped at ${p} a month)`, taux: 'Gross replacement rate',
    dureeT: 'Length of entitlement', jours: 'days', moisU: 'months', regleD: { coefficient: `days in the period × ${EN.coef}`, minimum: 'guaranteed minimum', plafond_age: 'age-based cap', plafond_rc: 'mutual termination cap' },
    prolong: (j: number) => `From age 55 you can ask France Travail for up to ${j} extra days.`,
    degT: 'From month 7', degTxt: (x: string) => `${EN.deg} degressivity: ${x} net a month`, degNon: 'No degressivity',
    calT: 'First paid day', calJ: (j: number) => `${j} days after the contract ends`, dc: 'Holiday pay deferral', ds: `Specific deferral (extra-statutory ÷ ${EN.div})`, att: 'Waiting period', supra: 'Extra-statutory part counted',
    total: 'Net total over the whole claim', totalB: 'Gross total',
    copier: 'Copy result', copie: 'Copied', partager: 'Copy link', imprimer: 'Print', maxMsg: (m: string) => `Input limit: ${m}`,
    hyp: 'Assumptions: continuous full-time work over the period, amounts in force since 1 July 2025 (not uprated on 1 July 2026). Estimate only; France Travail notifies the exact figure.', methode: 'Method and sources',
    methodeHref: '/en/unemployment-benefit/#method',
  },
};

interface S { s: number; a: number; m: number; mo: Motif; an: number; ind: number; cp: number; ins: number; pr: boolean; dt: 'apres' | 'avant'; csg: TauxCsg; al: boolean; dr: boolean }
const DEF: S = { s: 2800, a: 40, m: 24, mo: 'licenciement', an: 6, ind: 0, cp: 0, ins: 0, pr: false, dt: 'apres', csg: 'normal', al: false, dr: false };

function Bar({ label, value, max, fmt, tone }: { label: string; value: number; max: number; fmt: (n: number) => string; tone: 'plus' | 'moins' | 'total' }) {
  const w = max > 0 ? Math.max(2, Math.round((Math.abs(value) / max) * 100)) : 0;
  const color = tone === 'moins' ? 'bg-secondary-500' : tone === 'total' ? 'bg-primary-700' : 'bg-primary-400';
  return (
    <div className="py-1.5">
      <div className="flex justify-between gap-3 text-sm"><span className="text-gray-700">{label}</span><span className="tabular-nums font-semibold text-gray-900">{tone === 'moins' && value > 0 ? '− ' : ''}{fmt(value)}</span></div>
      <div className="mt-1 h-1.5 rounded bg-gray-100"><div className={`h-1.5 rounded ${color}`} style={{ width: `${w}%` }} /></div>
    </div>
  );
}

export default function AreSimulator({ lang = 'fr' }: { lang?: Lang }) {
  const t = T[lang];
  const [v, setV] = useState<S>(DEF);
  const touched = useRef(false);
  const [copied, setCopied] = useState('');
  const eur = (n: number) => new Intl.NumberFormat(t.locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
  const num = (n: number) => new Intl.NumberFormat(t.locale, { maximumFractionDigits: 0 }).format(n);
  const pct = (n: number) => new Intl.NumberFormat(t.locale, { style: 'percent', maximumFractionDigits: 1 }).format(n);

  // Lien partagé : appliqué après le premier rendu, jamais pendant (RECETTE §17.5).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search); if (!q.has('s')) return;
    const n = (k: string, d: number) => { const x = Number(q.get(k)); return Number.isFinite(x) && q.has(k) ? x : d; };
    setV({ s: n('s', DEF.s), a: n('a', DEF.a), m: n('m', DEF.m), mo: (q.get('mo') as Motif) || DEF.mo, an: n('an', DEF.an), ind: n('ind', 0), cp: n('cp', 0), ins: n('ins', 0), pr: q.get('pr') === '1', dt: q.get('dt') === 'avant' ? 'avant' : 'apres', csg: (q.get('csg') as TauxCsg) || 'normal', al: q.get('al') === '1', dr: q.get('dr') === '1' });
  }, []);
  useEffect(() => {
    if (!touched.current) return;
    const q = new URLSearchParams({ s: String(v.s), a: String(v.a), m: String(v.m), mo: v.mo, an: String(v.an), ind: String(v.ind), cp: String(v.cp), ins: String(v.ins), pr: v.pr ? '1' : '0', dt: v.dt, csg: v.csg, al: v.al ? '1' : '0', dr: v.dr ? '1' : '0' });
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  }, [v]);
  const set = <K extends keyof S>(k: K) => (x: S[K]) => { touched.current = true; setV((o) => ({ ...o, [k]: x })); };

  const legale = useMemo(() => {
    const ans = Math.floor(v.an), mois = Math.round((v.an - ans) * 12);
    const l = calculateIndemniteLegale(v.s, ans, mois);
    // En rupture conventionnelle, l'indemnité spécifique est due au prorata même avant 8 mois.
    if (l === 0 && v.mo === 'rupture_conventionnelle') return Math.round(v.s * 0.25 * v.an * 100) / 100;
    return l;
  }, [v.s, v.an, v.mo]);
  const supra = Math.max(0, v.ind - legale);
  const r = useMemo(() => calculerARE({
    brutMensuel: v.s, moisTravailles: v.m, age: v.a, motif: v.mo, finApresSeptembre2026: v.dt === 'apres', primoEntrant: v.pr, drom: v.dr,
    supraLegal: supra, iccp: v.cp, joursAvantInscription: v.ins, csg: v.csg, alsaceMoselle: v.al,
  }), [v, supra]);
  const ref = v.a >= A.age_senior ? A.reference_months_senior : A.reference_months;
  const M = A.days_per_month;
  const resume = r.eligible
    ? `${t.head} : ${eur(r.netteMensuelle)} · ${t.dureeT} : ${num(r.duree.jours)} ${t.jours} · ${t.calT} : ${t.calJ(r.premierJour)}`
    : t.nonEligible;
  const copy = async (what: 'r' | 'l') => {
    try { await navigator.clipboard.writeText(what === 'r' ? resume : window.location.href); setCopied(what); setTimeout(() => setCopied(''), 1500); } catch { /* presse-papiers refusé */ }
  };

  return (
    <div data-chrome className="not-prose rounded-xl border border-gray-200 bg-white" id="simulateur">
      <form className="p-5 md:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <NumberField id="are-s" label={t.salaire} value={v.s} onChange={set('s')} unit="€" max={500000} locale={t.locale} help={t.salaireHelp} maxMsg={t.maxMsg} />
          <NumberField id="are-a" label={t.age} value={v.a} onChange={set('a')} unit={lang === 'fr' ? 'ans' : 'yrs'} max={70} locale={t.locale} maxMsg={t.maxMsg} />
          <NumberField id="are-m" label={t.mois} value={v.m} onChange={set('m')} unit={t.moisU} max={600} locale={t.locale} help={t.moisHelp(Math.min(v.m, ref), ref)} maxMsg={t.maxMsg} />
          <SelectField id="are-mo" label={t.motif} value={v.mo} onChange={(x) => set('mo')(x as Motif)} options={t.motifs} />
          <NumberField id="are-an" label={t.anc} value={v.an} onChange={set('an')} unit={t.ancUnit} max={60} decimals={1} locale={t.locale} maxMsg={t.maxMsg} />
          <NumberField id="are-ind" label={t.indem} value={v.ind} onChange={set('ind')} unit="€" max={5000000} locale={t.locale} help={t.indemHelp(eur(legale))} maxMsg={t.maxMsg} />
        </div>
        <details className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-primary-700">{t.plus}</summary>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <NumberField id="are-cp" label={t.iccp} value={v.cp} onChange={set('cp')} unit="€" max={1000000} locale={t.locale} help={t.iccpHelp} maxMsg={t.maxMsg} />
            <NumberField id="are-ins" label={t.insc} value={v.ins} onChange={set('ins')} unit={t.jours} max={365} locale={t.locale} help={t.inscHelp} maxMsg={t.maxMsg} />
            <Toggle id="are-pr" label={t.primo} value={v.pr} onChange={set('pr')} labels={[t.non, t.oui]} help={t.primoHelp} />
            <SelectField id="are-dt" label={t.date} value={v.dt} onChange={(x) => set('dt')(x as S['dt'])} options={t.dates} />
            <SelectField id="are-csg" label={t.csg} value={v.csg} onChange={(x) => set('csg')(x as TauxCsg)} options={t.csgs} />
            <Toggle id="are-al" label={t.alsace} value={v.al} onChange={set('al')} labels={[t.non, t.oui]} help={t.alsaceHelp} />
            <Toggle id="are-dr" label={t.drom} value={v.dr} onChange={set('dr')} labels={[t.non, t.oui]} help={t.dromHelp} />
          </div>
        </details>
      </form>

      <div aria-live="polite" className="border-t border-gray-200 bg-primary-50/60 p-5 md:p-6">
        {!r.eligible ? (
          <div>
            <p className="text-sm font-semibold text-gray-700">{t.nonEligible}</p>
            <p className="mt-2 text-base text-gray-800">{r.motifRefus === 'demission' ? t.refusDem : t.refusAff(v.m)}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-700">{t.head}</p>
              <p className="tabular-nums mt-1 text-4xl font-bold text-primary-700">{eur(r.netteMensuelle)}</p>
              <p className="mt-1 text-sm text-gray-700">{t.headSub(eur(r.bruteMensuelle), eur(r.brute))} · {t.regle[r.regle]}</p>
              <div className="mt-4">
                <Bar label={t.brute} value={r.bruteMensuelle} max={r.bruteMensuelle} fmt={eur} tone="plus" />
                <Bar label={t.retraite} value={r.retenues.retraite * M} max={r.bruteMensuelle} fmt={eur} tone="moins" />
                <Bar label={t.csgL} value={r.retenues.csg * M} max={r.bruteMensuelle} fmt={eur} tone="moins" />
                <Bar label={t.crds} value={r.retenues.crds * M} max={r.bruteMensuelle} fmt={eur} tone="moins" />
                {v.al && <Bar label={t.alsaceL} value={r.retenues.alsace * M} max={r.bruteMensuelle} fmt={eur} tone="moins" />}
                <Bar label={t.nette} value={r.netteMensuelle} max={r.bruteMensuelle} fmt={eur} tone="total" />
              </div>
              <p className="mt-3 text-sm text-gray-700">{t.sjr} : <span className="tabular-nums font-semibold">{eur(r.sjr)}</span>{r.plafonne ? t.plafonne(eur(r.salaireRetenu)) : ''} · {t.taux} : {pct(r.tauxRemplacement)}</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-700">{t.dureeT}</p>
                <p className="tabular-nums mt-1 text-2xl font-bold text-gray-900">{num(r.duree.jours)} {t.jours} <span className="text-base font-medium text-gray-700">({new Intl.NumberFormat(t.locale, { maximumFractionDigits: 1 }).format(r.duree.mois)} {t.moisU})</span></p>
                <p className="mt-1 text-gray-700">{t.regleD[r.duree.regle]}</p>
                {r.duree.prolongationSenior > 0 && <p className="mt-1 text-gray-700">{t.prolong(r.duree.prolongationSenior)}</p>}
                <p className="mt-2 text-gray-700"><span className="font-semibold">{t.degT} : </span>{r.degressif ? t.degTxt(eur(r.netteMensuelleApres)) : t.degNon}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-700">{t.calT}</p>
                <p className="tabular-nums mt-1 text-2xl font-bold text-gray-900">{t.calJ(r.premierJour)}</p>
                <table className="mt-2 w-full"><tbody>
                  <tr className="border-t border-gray-100"><td className="py-1 text-gray-700">{t.supra}</td><td className="tabular-nums py-1 text-right">{eur(supra)}</td></tr>
                  <tr className="border-t border-gray-100"><td className="py-1 text-gray-700">{t.ds}</td><td className="tabular-nums py-1 text-right">{num(r.differeSpecifique)} {t.jours}</td></tr>
                  <tr className="border-t border-gray-100"><td className="py-1 text-gray-700">{t.dc}</td><td className="tabular-nums py-1 text-right">{num(r.differeConges)} {t.jours}</td></tr>
                  <tr className="border-t border-gray-100"><td className="py-1 text-gray-700">{t.att}</td><td className="tabular-nums py-1 text-right">{num(r.attente)} {t.jours}</td></tr>
                </tbody></table>
              </div>
              <p className="text-gray-800"><span className="font-semibold">{t.total} : </span><span className="tabular-nums">{eur(r.totalNet)}</span> · {t.totalB} : <span className="tabular-nums">{eur(r.totalBrut)}</span></p>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={() => copy('r')} className="rounded-lg border border-primary-600 px-3 py-2 font-medium text-primary-700 hover:bg-white">{copied === 'r' ? t.copie : t.copier}</button>
          <button type="button" onClick={() => copy('l')} className="rounded-lg border border-primary-600 px-3 py-2 font-medium text-primary-700 hover:bg-white">{copied === 'l' ? t.copie : t.partager}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-primary-600 px-3 py-2 font-medium text-primary-700 hover:bg-white">{t.imprimer}</button>
        </div>
        <details className="mt-4 text-xs text-gray-700">
          <summary className="cursor-pointer">{lang === 'fr' ? 'Hypothèses du calcul' : 'Calculation assumptions'}</summary>
          <p className="mt-1">{t.hyp} <a href={t.methodeHref} className="text-primary-700 underline">{t.methode}</a></p>
        </details>
      </div>
    </div>
  );
}
