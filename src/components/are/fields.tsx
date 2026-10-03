/**
 * Champs du simulateur chômage (RECETTE §4.1, §10.3, §17.1, §17.2) :
 * texte brut pendant la frappe, milliers séparés au blur, plafond appliqué au nombre dérivé et
 * signalé (role="status"), sélection au focus juste après le rendu, hauteur unique de 48 px,
 * libellé / champ / aide alignés d'une colonne à l'autre (grid-rows-subgrid).
 */
import { type ChangeEvent, type ReactNode, useLayoutEffect, useRef, useState } from 'react';

export function parseNombre(input: string): number {
  const cleaned = input.replace(/[^\d.,-]/g, '');
  const lastComma = cleaned.lastIndexOf(','), lastDot = cleaned.lastIndexOf('.');
  let s = cleaned;
  if (lastComma > lastDot) s = cleaned.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) s = cleaned.replace(/\./g, '');
  else s = cleaned.replace(/,/g, '');
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}

const champ = 'h-12 w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500';

export function NumberField({ id, label, value, onChange, unit, max = 1e9, decimals = 0, locale, help, maxMsg }: {
  id: string; label: string; value: number; onChange: (v: number) => void; unit?: string; max?: number; decimals?: number; locale: string; help?: ReactNode; maxMsg: (m: string) => string;
}) {
  const [focused, setFocused] = useState(false); const [raw, setRaw] = useState(''); const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null); const selectPending = useRef(false); const guard = useRef(false);
  useLayoutEffect(() => { if (selectPending.current) { selectPending.current = false; input.current?.select(); } });
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(n);
  const display = focused ? raw : fmt(value);
  return (
    <div className="grid grid-rows-subgrid row-span-3 gap-1">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800">{label}</label>
      <div className="relative">
        <input ref={input} id={id} type="text" inputMode="decimal" value={display}
          onMouseUp={(e) => { if (guard.current) { guard.current = false; e.preventDefault(); } }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.value.replace(/[^0-9.,\s-]/g, ''); setRaw(f); const n = parseNombre(f); setOver(n > max); onChange(Math.min(n, max)); }}
          onFocus={() => { setRaw(value === 0 ? '' : String(value)); setFocused(true); selectPending.current = true; guard.current = true; }}
          onBlur={() => { guard.current = false; setFocused(false); if (value > max) onChange(max); }}
          aria-describedby={`${id}-help`}
          className={`${champ} tabular-nums px-4 pr-16 text-right text-lg`} />
        {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600" aria-hidden="true">{unit}</span>}
      </div>
      <p id={`${id}-help`} className="text-xs text-gray-600" role={over ? 'status' : undefined}>
        {over ? <span className="font-medium text-amber-800">{maxMsg(`${fmt(max)}${unit ? ` ${unit}` : ''}`)}</span> : help}
      </p>
    </div>
  );
}

export function SelectField({ id, label, value, onChange, options, help }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]>; help?: ReactNode;
}) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 gap-1">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${champ} px-3`} aria-describedby={help ? `${id}-help` : undefined}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <p id={`${id}-help`} className="text-xs text-gray-600">{help}</p>
    </div>
  );
}

export function Toggle({ id, label, value, onChange, labels, help }: {
  id: string; label: string; value: boolean; onChange: (v: boolean) => void; labels: [string, string]; help?: ReactNode;
}) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 gap-1">
      <span id={`${id}-l`} className="block text-sm font-semibold text-gray-800">{label}</span>
      <div role="group" aria-labelledby={`${id}-l`} className="grid h-12 grid-flow-col auto-cols-fr overflow-hidden rounded-lg border border-gray-300 bg-white">
        {[false, true].map((v, k) => (
          <button key={k} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
            className={`h-full whitespace-nowrap px-2 text-sm font-medium ${value === v ? 'bg-primary-600 text-white' : 'text-gray-800 hover:bg-gray-50'}`}>
            {labels[k]}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-600">{help}</p>
    </div>
  );
}
