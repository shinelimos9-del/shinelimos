import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Luxy-style fare breakdown: the quote shows the base fare up front and
// one tap on the car opens the all-inclusive total — base fare + 20%
// chauffeur gratuity + 3% credit card fee (+ any surcharges) = total.
// Reads the backend's price_breakdown (POST /bookings/quote); renders
// nothing when no breakdown is present, so quotes without one are
// unaffected.
//
// Open state: controlled when `open` + `onToggle` are passed (vehicle
// cards — clicking the car opens it; on the booking page a selected car
// stays open), otherwise internal state seeded by `defaultOpen`
// (summaries — the chosen vehicle's breakdown starts open). The toggle
// is a span (not a button) so it can also live inside the booking
// page's vehicle <button> cards; clicks stop propagation so tapping it
// never selects the vehicle.
export default function FareBreakdown({
  breakdown,
  open: controlledOpen,
  defaultOpen = false,
  onToggle,
}: {
  breakdown?: any;
  open?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  if (!breakdown || breakdown.grandTotal == null) return null;

  const money = (n: any) => `$${Number(n || 0).toFixed(2)}`;
  const num = (n: any) => Number(n || 0);

  const rows: { label: string; value: number }[] = [
    { label: "Base fare", value: num(breakdown.subtotal ?? breakdown.grandTotal) },
  ];
  if (num(breakdown.lateNightSurcharge) > 0)
    rows.push({ label: "Late-night surcharge", value: num(breakdown.lateNightSurcharge) });
  if (num(breakdown.holidaySurcharge) > 0)
    rows.push({ label: "Holiday surcharge", value: num(breakdown.holidaySurcharge) });
  if (num(breakdown.additionalStopsFee) > 0)
    rows.push({ label: "Additional stops", value: num(breakdown.additionalStopsFee) });
  if (num(breakdown.childSeatsFee) > 0)
    rows.push({ label: "Child seats", value: num(breakdown.childSeatsFee) });
  if (num(breakdown.waitingTimeFee) > 0)
    rows.push({ label: "Waiting time", value: num(breakdown.waitingTimeFee) });
  if (num(breakdown.tolls) > 0) rows.push({ label: "Tolls", value: num(breakdown.tolls) });
  if (num(breakdown.parking) > 0) rows.push({ label: "Parking", value: num(breakdown.parking) });
  if (num(breakdown.gratuity) > 0)
    rows.push({ label: "Chauffeur gratuity (20%)", value: num(breakdown.gratuity) });
  if (num(breakdown.creditCardFee) > 0)
    rows.push({ label: "Credit card fee (3%)", value: num(breakdown.creditCardFee) });
  if (num(breakdown.discount) > 0)
    rows.push({ label: "Discount", value: -num(breakdown.discount) });

  const toggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (onToggle) onToggle();
    else setInternalOpen((o) => !o);
  };

  return (
    <div className="mt-3">
      <span
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(e);
          }
        }}
        className="flex w-full items-center justify-between text-xs text-gold hover:text-white transition-colors cursor-pointer select-none"
      >
        <span className="underline underline-offset-2">Fare breakdown</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </span>
      {open && (
        <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-1">
              <span className="text-white/70">{r.label}</span>
              <span className="text-white font-mono">
                {r.value < 0 ? `-${money(Math.abs(r.value))}` : money(r.value)}
              </span>
            </div>
          ))}
          {num(breakdown.minimumFareAdjustment) > 0 && (
            <p className="pt-1 text-[11px] text-white/45">
              Includes {money(breakdown.minimumFareAdjustment)} minimum-fare adjustment.
            </p>
          )}
          <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
            <span className="font-semibold text-white">Total</span>
            <span className="font-semibold text-gold font-mono">{money(breakdown.grandTotal)}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
            Tolls are added on top of the fare. Free cancellation up to 24 hours before pickup.
          </p>
        </div>
      )}
    </div>
  );
}
