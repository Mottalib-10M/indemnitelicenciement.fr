/**
 * Cas de référence de l'ARE : chaque test reprend un exemple ou une borne publiés par l'Unédic,
 * France Travail ou service-public.fr (source en commentaire), relevés le 2026-10-03.
 */
import { describe, expect, it } from 'vitest';
import { allocationJournaliere, arce, calculerARE, cumul, demission, degressivite, differeConges, differeSpecifique, duree, premierJour, retenues, sjrMensuel } from './are';

describe('salaire journalier de référence et allocation brute (fiche Unédic ARE, table des salaires)', () => {
  it('1 303,05 € par mois : 75 % du salaire = allocation minimale 32,13 €', () => {
    const s = sjrMensuel(1303.05); expect(s).toBeCloseTo(42.84, 2);
    expect(allocationJournaliere(s).brute).toBeCloseTo(32.13, 2);
  });
  it('sous 1 303,05 €, le plafond de 75 % du SJR l’emporte sur le minimum', () => {
    const r = allocationJournaliere(sjrMensuel(1000)); expect(r.regle).toBe('plafond75'); expect(r.brute).toBeCloseTo(24.66, 2);
  });
  it('circulaire Unédic : SJR de 30 € → 22,50 €, plafond de 75 %', () => {
    expect(allocationJournaliere(30).brute).toBe(22.5);
  });
  it('1 426,72 € : la formule 40,4 % + 13,18 € rejoint le minimum', () => {
    const r = allocationJournaliere(sjrMensuel(1426.72)); expect(r.brute).toBeCloseTo(32.13, 1);
  });
  it('2 415,01 € : bascule entre la formule variable et 57 %', () => {
    const s = sjrMensuel(2415.01); expect(0.404 * s + 13.18).toBeCloseTo(0.57 * s, 1);
    expect(allocationJournaliere(sjrMensuel(2000)).regle).toBe('variable');
    expect(allocationJournaliere(sjrMensuel(3000)).regle).toBe('fixe57');
  });
  it('3 000 € : SJR 98,63 €, allocation 56,22 € par jour', () => {
    const r = calculerARE({ brutMensuel: 3000, moisTravailles: 24, age: 40 });
    expect(r.sjr).toBeCloseTo(98.63, 2); expect(r.brute).toBeCloseTo(56.22, 2); expect(r.bruteMensuelle).toBeCloseTo(1686.6, 1);
  });
  it('salaire plafonné à 16 020 € par mois (service-public F2064), SJR 526,68 €', () => {
    const r = calculerARE({ brutMensuel: 25000, moisTravailles: 24, age: 40 });
    expect(r.plafonne).toBe(true); expect(r.salaireRetenu).toBe(16020); expect(r.sjr).toBeCloseTo(526.68, 2); expect(r.brute).toBeCloseTo(300.21, 2);
  });
});

describe('retenues (fiche Unédic « Retenues sociales », France Travail)', () => {
  it('exemple 2 Unédic : SJR 70 €, ARE 39,90 € → retraite 2,10 €, pas de CSG, nette 37,80 €', () => {
    const r = retenues(39.9, 70); expect(r.retraite).toBe(2.1); expect(r.csg).toBe(0); expect(r.exonereCsg).toBe(true); expect(r.nette).toBe(37.8);
  });
  it('la participation retraite ne ramène pas l’allocation sous 32,13 €', () => {
    const r = retenues(32.13, 45); expect(r.retraite).toBe(0); expect(r.nette).toBe(32.13);
  });
  it('CSG 6,2 % et CRDS 0,5 % sur 98,25 % de l’allocation brute au-delà de 61 €', () => {
    const r = retenues(100, 175.44);
    expect(r.retraite).toBeCloseTo(5.26, 2); expect(r.csg).toBeCloseTo(6.09, 2); expect(r.crds).toBeCloseTo(0.49, 2);
    expect(r.nette).toBeCloseTo(100 - 5.26 - 6.09 - 0.49, 2);
  });
  it('les prélèvements ne font pas passer l’allocation sous 61 €', () => {
    // 66 € bruts, SJR 80 € : après 2,40 € de retraite il reste 63,60 € ; la CSG est réduite à la marge de 2,60 €.
    const r = retenues(66, 80); expect(r.nette).toBeCloseTo(61, 2); expect(r.csg + r.crds).toBeCloseTo(2.6, 1);
    // 63 € bruts, SJR 110,53 € : la retraite seule ramène sous 61 €, aucune CSG n'est prélevée.
    const s = retenues(63, 110.53); expect(s.csg).toBe(0); expect(s.nette).toBeCloseTo(59.68, 2);
  });
  it('taux réduit 3,8 % et exonération sur demande', () => {
    expect(retenues(100, 175.44, { csg: 'reduit' }).csg).toBeCloseTo(3.73, 2);
    expect(retenues(100, 175.44, { csg: 'exonere' }).csg).toBe(0);
  });
  it('Alsace-Moselle : 1,5 % de plus', () => {
    expect(retenues(100, 175.44, { alsaceMoselle: true }).alsace).toBeCloseTo(1.47, 2);
  });
});

describe('durée (fiches Unédic ARE et rupture conventionnelle)', () => {
  it('24 mois avant 55 ans : 730 × 0,75 → 548 jours', () => {
    expect(duree({ moisTravailles: 24, age: 40 }).jours).toBe(548);
  });
  it('48 mois saisis, 24 retenus : la loi borne, pas le champ', () => {
    const d = duree({ moisTravailles: 48, age: 40 }); expect(d.moisRetenus).toBe(24); expect(d.jours).toBe(548);
  });
  it('55 ou 56 ans : plafond 685 jours ; 57 ans et plus : 822 jours', () => {
    expect(duree({ moisTravailles: 36, age: 55 })).toMatchObject({ jours: 685, regle: 'plafond_age' });
    expect(duree({ moisTravailles: 36, age: 58 }).jours).toBe(822);
  });
  it('6 mois : durée minimale de 182 jours', () => {
    expect(duree({ moisTravailles: 6, age: 30 })).toMatchObject({ jours: 182, regle: 'minimum', eligible: true });
  });
  it('5 mois : pas de droit, sauf primo-entrant (fin de contrat dès le 1er avril 2026) → 152 jours', () => {
    expect(duree({ moisTravailles: 5, age: 25 }).eligible).toBe(false);
    expect(duree({ moisTravailles: 5, age: 25, primoEntrant: true })).toMatchObject({ eligible: true, jours: 152, admisPrimo: true });
    expect(duree({ moisTravailles: 5, age: 25, primoEntrant: true, finApresAvril2026: false }).eligible).toBe(false);
  });
  it('rupture conventionnelle finissant dès le 1er septembre 2026 : 456 jours avant 55 ans, 548 avant cette date', () => {
    expect(duree({ moisTravailles: 24, age: 40, motif: 'rupture_conventionnelle' })).toMatchObject({ jours: 456, regle: 'plafond_rc' });
    expect(duree({ moisTravailles: 24, age: 40, motif: 'rupture_conventionnelle', finApresSeptembre2026: false }).jours).toBe(548);
  });
  it('rupture conventionnelle, 55 ans et plus : 624 jours, prolongation de 61 (55-56 ans) ou 198 jours (57 ans et plus)', () => {
    expect(duree({ moisTravailles: 36, age: 55, motif: 'rupture_conventionnelle' })).toMatchObject({ jours: 624, prolongationSenior: 61 });
    expect(duree({ moisTravailles: 36, age: 60, motif: 'rupture_conventionnelle' })).toMatchObject({ jours: 624, prolongationSenior: 198 });
  });
  it('rupture conventionnelle en outre-mer : 608 jours avant 55 ans', () => {
    expect(duree({ moisTravailles: 36, age: 54, motif: 'rupture_conventionnelle', drom: true }).jours).toBe(548);
    expect(duree({ moisTravailles: 24, age: 40, motif: 'rupture_conventionnelle', drom: true }).jours).toBe(548);
  });
  it('démission non légitime : pas de droit', () => {
    expect(duree({ moisTravailles: 24, age: 40, motif: 'demission' })).toMatchObject({ eligible: false, motifRefus: 'demission' });
  });
});

describe('dégressivité (fiche Unédic ARE : − 30 % au 7e mois, plancher 92,57 €, avant 55 ans)', () => {
  it('allocation de 114 € : ramenée au plancher de 92,57 €', () => {
    expect(degressivite(114, 45, 548)).toMatchObject({ applicable: true, apres: 92.57 });
  });
  it('allocation de 200 € : 140 €', () => {
    expect(degressivite(200, 45, 548).apres).toBe(140);
  });
  it('55 ans : exonéré ; allocation sous 92,57 € : rien', () => {
    expect(degressivite(200, 55, 685).applicable).toBe(false);
    expect(degressivite(90, 40, 548).applicable).toBe(false);
  });
});

describe('différés et délai d’attente (fiches Unédic)', () => {
  it('différé spécifique : 1 372 € ÷ 111,8 = 12 jours (entier inférieur)', () => {
    expect(differeSpecifique(1372)).toBe(12);
  });
  it('plafonds de 150 jours, 75 en licenciement économique', () => {
    expect(differeSpecifique(50000)).toBe(150); expect(differeSpecifique(50000, true)).toBe(75);
  });
  it('différé congés payés : 646 € ÷ SJR 38 € = 17 jours, 30 au plus', () => {
    expect(differeConges(646, 38)).toBe(17); expect(differeConges(5000, 38)).toBe(30);
  });
  it('Nadia : fin le 1er novembre, inscrite le 10, différé de 12 jours → indemnisée le 20 (J+19)', () => {
    expect(premierJour({ differes: 12, joursAvantInscription: 9 }).jour).toBe(19);
  });
  it('Julien : inscrit le 1er décembre, après les différés → indemnisé le 8 décembre (J+37)', () => {
    expect(premierJour({ differes: 12, joursAvantInscription: 30 }).jour).toBe(37);
  });
  it('Cyril : ICCP 646 €, SJR 38 € → 17 + 7 = 24 jours', () => {
    expect(premierJour({ differes: differeConges(646, 38), joursAvantInscription: 4 }).jour).toBe(24);
  });
});

describe('cumul ARE et salaire (fiche Unédic Cumul ARE-Rémunération)', () => {
  it('ARE 57 €, SJR 100 €, reprise à 2 100 € : 4 jours, 228 €, plafond 3 042 €, 26 jours reportés', () => {
    expect(cumul({ brute: 57, sjr: 100, salaireActivite: 2100 })).toMatchObject({ jours: 4, verse: 228, plafond: 3042, joursReportes: 26 });
  });
  it('le plafond de l’ancien salaire limite le cumul', () => {
    const c = cumul({ brute: 57, sjr: 100, salaireActivite: 3000 }); expect(c.total).toBeLessThanOrEqual(3042); expect(c.jours).toBe(0);
  });
});

describe('ARCE (fiche Unédic ARCE, exemple : 40 € × 518 jours)', () => {
  it('capital 12 432 €, net 12 059 € après 3 %, deux versements d’environ 6 029,50 €', () => {
    const a = arce({ brute: 40, joursRestants: 518 });
    expect(a.capital).toBe(12432); expect(a.net).toBeCloseTo(12059, 0); expect(a.versement).toBeCloseTo(6029.5, 0);
  });
});

describe('démission (fiche Unédic Démission)', () => {
  it('non légitime : réexamen possible, versement au plus tôt le 122e jour', () => {
    expect(demission({ motif: 'non_legitime' })).toMatchObject({ droit: false, jourReexamen: 122 });
  });
  it('projet professionnel : 1 300 jours continus exigés', () => {
    expect(demission({ motif: 'projet', joursTravaillesContinus: 1300 }).droit).toBe(true);
    expect(demission({ motif: 'projet', joursTravaillesContinus: 1000 }).droit).toBe(false);
  });
});

describe('calcul complet', () => {
  it('3 000 €, 40 ans, 24 mois : 548 jours, pas de dégressivité, total net cohérent', () => {
    const r = calculerARE({ brutMensuel: 3000, moisTravailles: 24, age: 40 });
    expect(r.duree.jours).toBe(548); expect(r.degressif).toBe(false);
    expect(r.totalNet).toBe(Math.round(548 * r.retenues.nette));
  });
  it('6 000 €, 45 ans : dégressif à partir du 183e jour', () => {
    const r = calculerARE({ brutMensuel: 6000, moisTravailles: 24, age: 45 });
    expect(r.degressif).toBe(true); expect(r.bruteApres).toBeLessThan(r.brute);
    expect(r.totalBrut).toBe(Math.round(182 * r.brute + 366 * r.bruteApres));
  });
  it('supra-légal de 15 000 € et ICCP : différés additionnés puis 7 jours', () => {
    const r = calculerARE({ brutMensuel: 3000, moisTravailles: 24, age: 40, supraLegal: 15000, iccp: 1000 });
    expect(r.differeSpecifique).toBe(134); expect(r.differeConges).toBe(10); expect(r.premierJour).toBe(151);
  });
});
