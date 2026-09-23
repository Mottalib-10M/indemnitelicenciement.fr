import { useState, useCallback } from 'react';
import { simulerLicenciement, type LicenciementInput, type LicenciementResult } from '../lib/engine';

function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function InputField({
  label,
  id,
  type = 'number',
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  help,
}: {
  label: string;
  id: string;
  type?: string;
  value: number | string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  help?: string;
}) {
  // Le champ qu'on remplit garde son texte brut ; sinon on montre les milliers
  // separes. Mettre en forme pendant la frappe reecrirait la saisie.
  const [actif, setActif] = useState(false);
  const formateFr = (v: string | number) => {
    const s = String(v ?? "");
    if (s === "") return s;
    const n = parseFloat(s.replace(/[\s\u00a0\u202f]/g, "").replace(",", "."));
    return Number.isFinite(n) ? Math.round(n).toLocaleString("fr-FR") : s;
  };
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "decimal" : undefined}
          id={id}
          value={type === "number" && !actif ? formateFr(value) : value}
          onChange={(e) => onChange(
            type === "number" ? e.target.value.replace(/[^\d.,]/g, "") : e.target.value
          )}
          onFocus={() => setActif(true)}
          onBlur={() => setActif(false)}
          min={min}
          max={max}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 bg-white"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

function ResultCard({
  title,
  amount,
  subtitle,
  highlight = false,
}: {
  title: string;
  amount: number;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        highlight
          ? 'border-primary-600 bg-primary-50 shadow-lg'
          : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          highlight ? 'text-primary-700' : 'text-gray-900'
        }`}
      >
        {formatEuros(amount)}
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function LicenciementCalculator() {
  const [salaireBrut, setSalaireBrut] = useState('3000');
  const [salaire3Mois, setSalaire3Mois] = useState('');
  const [ancienneteAnnees, setAncienneteAnnees] = useState('5');
  const [ancienneteMois, setAncienneteMois] = useState('0');
  const [cadre, setCadre] = useState(false);
  const [age, setAge] = useState('35');
  const [supraLegale, setSupraLegale] = useState('0');
  const [joursConges, setJoursConges] = useState('0');
  const [result, setResult] = useState<LicenciementResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalcul = useCallback(() => {
    const input: LicenciementInput = {
      salaireBrutMensuel: parseFloat(salaireBrut) || 0,
      salaireBrut3DerniersMois: salaire3Mois ? parseFloat(salaire3Mois) : undefined,
      ancienneteAnnees: parseInt(ancienneteAnnees) || 0,
      ancienneteMois: parseInt(ancienneteMois) || 0,
      cadre,
      age: parseInt(age) || 30,
      indemniteSupraLegale: parseFloat(supraLegale) || 0,
      joursCongesAcquis: parseInt(joursConges) || 0,
    };

    const res = simulerLicenciement(input);
    setResult(res);
    setShowResults(true);
  }, [salaireBrut, salaire3Mois, ancienneteAnnees, ancienneteMois, cadre, age, supraLegale, joursConges]);

  return (
    <div className="max-w-6xl mx-auto" id="calculateur">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Calculateur d'indemnité de licenciement 2026
          </h2>
          <p className="mt-2 text-primary-100 text-sm md:text-base">
            Estimez vos droits : indemnité légale, préavis, congés payés et allocation chomage (ARE)
          </p>
        </div>

        {/* Form */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputField
              label="Salaire brut mensuel"
              id="salaire-brut"
              value={salaireBrut}
              onChange={setSalaireBrut}
              min={0}
              step="any"
              suffix="EUR/mois"
              help="Moyenne des 12 derniers mois"
            />
            <InputField
              label="Moyenne 3 derniers mois (optionnel)"
              id="salaire-3mois"
              value={salaire3Mois}
              onChange={setSalaire3Mois}
              min={0}
              step="any"
              suffix="EUR/mois"
              help="Si different de la moyenne 12 mois"
            />
            <InputField
              label="Ancienneté (années)"
              id="anciennete-annees"
              value={ancienneteAnnees}
              onChange={setAncienneteAnnees}
              min={0}
              max={50}
              step={1}
              suffix="ans"
            />
            <InputField
              label="Ancienneté (mois supplementaires)"
              id="anciennete-mois"
              value={ancienneteMois}
              onChange={setAncienneteMois}
              min={0}
              max={11}
              step={1}
              suffix="mois"
            />
            <InputField
              label="Age"
              id="age"
              value={age}
              onChange={setAge}
              min={16}
              max={67}
              step={1}
              suffix="ans"
            />
            <InputField
              label="Jours de congés acquis non pris"
              id="jours-conges"
              value={joursConges}
              onChange={setJoursConges}
              min={0}
              max={60}
              step={1}
              suffix="jours"
            />
            <InputField
              label="Indemnité supra-legale (optionnel)"
              id="supra-legale"
              value={supraLegale}
              onChange={setSupraLegale}
              min={0}
              step="any"
              suffix="EUR"
              help="Montant negocie au-dela du legal"
            />

            {/* Cadre toggle */}
            <div className="mb-4 flex items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Statut cadre
                </label>
                <button
                  type="button"
                  onClick={() => setCadre(!cadre)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    cadre ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                  aria-pressed={cadre}
                  aria-label="Statut cadre"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                      cadre ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  {cadre ? 'Cadre — préavis 3 mois' : 'Non-cadre'}
                </p>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalcul}
            className="w-full mt-4 bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-lg shadow-lg hover:shadow-xl cursor-pointer"
          >
            Calculer mes indemnités
          </button>
        </div>

        {/* Results */}
        {showResults && result && (
          <div className="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
            {!result.eligible ? (
              <div className="bg-accent-50 border-2 border-accent-400 rounded-xl p-6 text-center">
                <p className="text-accent-800 font-semibold text-lg">
                  Non eligible a l'indemnité légale
                </p>
                <p className="text-accent-700 mt-2 text-sm">
                  {result.motifNonEligible}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Resultat de votre simulation
                </h3>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl p-6 text-white mb-6 shadow-lg">
                  <p className="text-primary-100 text-sm font-medium">
                    Total estimatif des indemnités
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    {formatEuros(result.totalIndemnites)}
                  </p>
                  <p className="text-primary-200 text-sm mt-2">
                    Salaire de référence retenu : {formatEuros(result.salaireReference)}/mois
                    {' · '}Ancienneté : {result.ancienneteTotale.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ans
                  </p>
                </div>

                {/* Detailed Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <ResultCard
                    title="Indemnité légale de licenciement"
                    amount={result.indemniteLegale}
                    subtitle="Art. R1234-2 Code du travail"
                    highlight
                  />
                  <ResultCard
                    title="Indemnité compensatrice de préavis"
                    amount={result.indemniteCompensatricePreavis}
                    subtitle={`${result.preavisMois} mois de préavis`}
                  />
                  <ResultCard
                    title="Indemnité de congés payés"
                    amount={result.indemniteCongesPayes}
                    subtitle="Méthode du 1/10e"
                  />
                  {result.indemniteSupraLegale > 0 && (
                    <ResultCard
                      title="Indemnité supra-legale"
                      amount={result.indemniteSupraLegale}
                      subtitle="Montant negocie"
                    />
                  )}
                </div>

                {/* ARE Section */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Allocation chomage (ARE)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Montant journalier</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatEuros(result.are.allocationJournaliere)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Montant mensuel estime</p>
                      <p className="text-xl font-bold text-primary-700">
                        {formatEuros(result.are.allocationMensuelle)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durée d'indemnisation</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.are.dureeJours} jours ({result.are.dureeMois} mois)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      SJR : {formatEuros(result.are.sjr)} · Formule : {result.are.formuleRetenue}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Calendrier previsionnel
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-secondary-500 shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong>Jour 0 :</strong> Notification du licenciement
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-accent-500 shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong>Mois 1-{result.preavisMois} :</strong> PREAVIS ({result.preavisMois} mois)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400 shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong>+7 jours :</strong> Carence incompressible France Travail
                      </p>
                    </div>
                    {result.differeSpecifiqueJours > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-accent-600 shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>+{result.differeSpecifiqueJours} jours :</strong> Differe specifique (indemnité supra-legale)
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary-500 shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong>Apres carence :</strong> Debut du versement ARE ({formatEuros(result.are.allocationMensuelle)}/mois pendant {result.are.dureeMois} mois)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 bg-accent-50 border border-accent-200 rounded-lg p-4">
                  <p className="text-xs text-accent-800">
                    <strong>Avertissement :</strong> Cette simulation est indicative et basee sur les baremes legaux 2026.
                    Votre convention collective peut prevoir des dispositions plus favorables.
                    Pour un calcul precis, consultez un avocat en droit du travail ou votre representant syndical.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
