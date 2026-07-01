import { describe, it, expect } from 'vitest';
import {
  calculateIndemniteLegale,
  calculatePreavis,
  calculateCongesPayes,
  calculateARE,
  calculateDiffereSpecifique,
  calculateSalaireReference,
  simulerLicenciement,
} from './engine';

describe('calculateSalaireReference', () => {
  it('retourne la moyenne 12 mois quand elle est plus élevée', () => {
    expect(calculateSalaireReference(3000, 2800)).toBe(3000);
  });

  it('retourne la moyenne 3 mois quand elle est plus élevée', () => {
    expect(calculateSalaireReference(3000, 3500)).toBe(3500);
  });

  it('retourne la moyenne 12 mois quand 3 mois non fourni', () => {
    expect(calculateSalaireReference(3000)).toBe(3000);
  });
});

describe('calculateIndemniteLegale', () => {
  it('calcule pour moins de 10 ans (1/4 mois par année)', () => {
    // 3000€ × 1/4 × 5 ans = 3750€
    expect(calculateIndemniteLegale(3000, 5, 0)).toBe(3750);
  });

  it('calcule pour exactement 10 ans', () => {
    // 3000€ × 1/4 × 10 = 7500€
    expect(calculateIndemniteLegale(3000, 10, 0)).toBe(7500);
  });

  it('calcule pour plus de 10 ans (1/3 au-delà)', () => {
    // 3000€ × 1/4 × 10 + 3000€ × 1/3 × 5 = 7500 + 5000 = 12500€
    expect(calculateIndemniteLegale(3000, 15, 0)).toBe(12500);
  });

  it('gère les années partielles (mois)', () => {
    // 3000€ × 1/4 × 5.5 = 4125€
    expect(calculateIndemniteLegale(3000, 5, 6)).toBe(4125);
  });

  it('gère les années partielles au-delà de 10 ans', () => {
    // 3000€ × 1/4 × 10 + 3000€ × 1/3 × 2.5 = 7500 + 2500 = 10000€
    expect(calculateIndemniteLegale(3000, 12, 6)).toBe(10000);
  });

  it('retourne 0 pour ancienneté insuffisante (< 8 mois)', () => {
    expect(calculateIndemniteLegale(3000, 0, 7)).toBe(0);
    expect(calculateIndemniteLegale(3000, 0, 5)).toBe(0);
  });

  it('calcule correctement à exactement 8 mois', () => {
    // 3000€ × 1/4 × (8/12) = 500€
    expect(calculateIndemniteLegale(3000, 0, 8)).toBe(500);
  });

  it('retourne 0 pour ancienneté zéro', () => {
    expect(calculateIndemniteLegale(3000, 0, 0)).toBe(0);
  });
});

describe('calculatePreavis', () => {
  it('retourne 0 pour moins de 6 mois (non-cadre)', () => {
    expect(calculatePreavis(0, false)).toBe(0);
  });

  it('retourne 1 mois entre 6 mois et 2 ans (non-cadre)', () => {
    expect(calculatePreavis(1, false)).toBe(1);
  });

  it('retourne 2 mois pour 2 ans et plus (non-cadre)', () => {
    expect(calculatePreavis(2, false)).toBe(2);
    expect(calculatePreavis(10, false)).toBe(2);
  });

  it('retourne 3 mois pour un cadre (quelle que soit l\'ancienneté)', () => {
    expect(calculatePreavis(1, true)).toBe(3);
    expect(calculatePreavis(5, true)).toBe(3);
    expect(calculatePreavis(15, true)).toBe(3);
  });
});

describe('calculateCongesPayes', () => {
  it('calcule l\'indemnité compensatrice de congés payés', () => {
    // 36000€ × 10% × 15/30 = 1800€
    expect(calculateCongesPayes(36000, 15)).toBe(1800);
  });

  it('calcule pour tous les jours acquis (30 jours)', () => {
    // 36000€ × 10% × 30/30 = 3600€
    expect(calculateCongesPayes(36000, 30)).toBe(3600);
  });

  it('retourne 0 pour 0 jours acquis', () => {
    expect(calculateCongesPayes(36000, 0)).toBe(0);
  });

  it('retourne 0 pour jours négatifs', () => {
    expect(calculateCongesPayes(36000, -5)).toBe(0);
  });
});

describe('calculateARE', () => {
  it('calcule l\'ARE et retient la formule la plus avantageuse', () => {
    const result = calculateARE(3000, 730, 40);
    expect(result.sjr).toBeGreaterThan(0);
    expect(result.allocationJournaliere).toBeGreaterThan(0);
    expect(result.allocationMensuelle).toBeGreaterThan(0);
    expect(result.dureeJours).toBe(730);
  });

  it('applique la durée max standard pour moins de 53 ans', () => {
    const result = calculateARE(3000, 800, 40);
    expect(result.dureeJours).toBe(730); // plafonné
  });

  it('applique la durée max senior pour 53 ans et plus', () => {
    const result = calculateARE(3000, 1000, 55);
    expect(result.dureeJours).toBe(913); // plafonné senior
  });

  it('retourne 0 jours si affiliation insuffisante', () => {
    const result = calculateARE(3000, 100, 40);
    expect(result.dureeJours).toBe(0);
  });

  it('choisit la formule 1 (40.4% + 12.95€) pour salaires moyens', () => {
    // Pour un salaire moyen, la formule 1 est souvent plus avantageuse
    const result = calculateARE(2000, 500, 35);
    expect(result.formuleRetenue).toContain('40,4%');
  });

  it('le SJR est plafonné pour les hauts salaires', () => {
    const result = calculateARE(15000, 500, 35);
    expect(result.sjr).toBeLessThanOrEqual(943);
  });
});

describe('calculateDiffereSpecifique', () => {
  it('calcule le différé spécifique', () => {
    // 10240€ / 102.4 = 100 jours
    expect(calculateDiffereSpecifique(10240)).toBe(100);
  });

  it('plafonne à 150 jours', () => {
    expect(calculateDiffereSpecifique(100000)).toBe(150);
  });

  it('retourne 0 pour indemnité nulle', () => {
    expect(calculateDiffereSpecifique(0)).toBe(0);
  });

  it('retourne 0 pour indemnité négative', () => {
    expect(calculateDiffereSpecifique(-1000)).toBe(0);
  });
});

describe('simulerLicenciement', () => {
  it('effectue une simulation complète', () => {
    const result = simulerLicenciement({
      salaireBrutMensuel: 3000,
      ancienneteAnnees: 5,
      ancienneteMois: 0,
      cadre: false,
      age: 40,
      joursCongesAcquis: 10,
    });

    expect(result.eligible).toBe(true);
    expect(result.indemniteLegale).toBe(3750);
    expect(result.preavisMois).toBe(2);
    expect(result.indemniteCompensatricePreavis).toBe(6000);
    expect(result.indemniteCongesPayes).toBeGreaterThan(0);
    expect(result.totalIndemnites).toBeGreaterThan(0);
    expect(result.are.allocationJournaliere).toBeGreaterThan(0);
  });

  it('retourne non éligible pour ancienneté insuffisante', () => {
    const result = simulerLicenciement({
      salaireBrutMensuel: 3000,
      ancienneteAnnees: 0,
      ancienneteMois: 5,
      cadre: false,
      age: 30,
    });

    expect(result.eligible).toBe(false);
    expect(result.indemniteLegale).toBe(0);
    expect(result.motifNonEligible).toContain('Ancienneté insuffisante');
  });

  it('utilise le salaire de référence le plus favorable', () => {
    const result = simulerLicenciement({
      salaireBrutMensuel: 3000,
      salaireBrut3DerniersMois: 3500,
      ancienneteAnnees: 5,
      ancienneteMois: 0,
      cadre: false,
      age: 40,
    });

    expect(result.salaireReference).toBe(3500);
    // 3500 × 1/4 × 5 = 4375
    expect(result.indemniteLegale).toBe(4375);
  });
});
