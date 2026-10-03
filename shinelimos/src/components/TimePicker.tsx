import { useState, useRef, useEffect } from "react";

export function formatTimeWithAmPm(timeStr?: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) {
    // If it already has AM/PM, ensure standard spacing and uppercase
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = match[2];
      const ampm = (match[3] || (h >= 12 ? "PM" : "AM")).toUpperCase();
      const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return `${displayH}:${m} ${ampm}`;
    }
    return trimmed;
  }
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    let hh = parseInt(parts[0], 10);
    const mm = parts[1].slice(0, 2).padStart(2, "0");
    if (isNaN(hh)) return trimmed;
    const isPm = hh >= 12;
    if (hh > 12) hh -= 12;
    if (hh === 0) hh = 12;
    return `${hh}:${mm} ${isPm ? "PM" : "AM"}`;
  }
  return trimmed;
}

export default function TimePicker({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parseValue = (val: string) => {
    let h = 12;
    let m = 0;
    let isPm = false;
    if (val) {
      const clean = val.trim();
      const match12 = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match12) {
        let parsedH = parseInt(match12[1], 10);
        m = parseInt(match12[2], 10) || 0;
        const meridian = match12[3] ? match12[3].toUpperCase() : null;
        if (meridian === "PM") {
          isPm = true;
          if (parsedH > 12) parsedH = 12;
        } else if (meridian === "AM") {
          isPm = false;
          if (parsedH === 0) parsedH = 12;
        } else {
          if (parsedH >= 12) {
            isPm = true;
            if (parsedH > 12) parsedH -= 12;
          }
          if (parsedH === 0) parsedH = 12;
        }
        h = parsedH;
      }
    }
    return { h, m, isPm, hasValue: Boolean(val) };
  };

  const parsed = parseValue(value);
  const [selH, setSelH] = useState<number>(parsed.h);
  const [selM, setSelM] = useState<number>(parsed.m);
  const [selPm, setSelPm] = useState<boolean>(parsed.isPm);

  useEffect(() => {
    const updated = parseValue(value);
    setSelH(updated.h);
    setSelM(updated.m);
    setSelPm(updated.isPm);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emitTime = (hour: number, minute: number, pm: boolean) => {
    const safeH = hour || 12;
    const safeM = (minute !== null && minute !== undefined && !isNaN(minute)) ? minute : 0;
    const formatted = `${safeH}:${safeM.toString().padStart(2, "0")} ${pm ? "PM" : "AM"}`;
    onChange(formatted);
  };

  const handleH = (newH: number, newPm: boolean) => {
    setSelH(newH);
    setSelPm(newPm);
    emitTime(newH, selM, newPm);
  };

  const handleM = (newM: number) => {
    setSelM(newM);
    emitTime(selH, newM, selPm);
    setOpen(false);
  };

  const displayVal = value ? formatTimeWithAmPm(value) : "";

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className={`${className} cursor-pointer flex items-center select-none`} 
        onClick={() => setOpen(!open)}
      >
        {displayVal || <span className="text-white/30">Select Time (e.g. 10:00 AM)</span>}
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 glass rounded-xl border border-white/20 shadow-2xl p-0 overflow-hidden w-[340px] max-w-[90vw] animate-in fade-in zoom-in-95" style={{ background: "rgba(20,20,20,0.98)" }}>
          <div className="flex border-b border-white/10 bg-black/80 text-[10px] uppercase tracking-widest text-gold text-center py-2 px-3 justify-between items-center">
            <span className="font-semibold text-white/90">
              Selected: <span className="text-gold font-mono">{selH}:{selM.toString().padStart(2, "0")} {selPm ? "PM" : "AM"}</span>
            </span>
            <span className="text-[9px] text-white/40 tracking-normal">Pick Hour & Minute</span>
          </div>
          
          <div className="flex">
            {/* Hours Section */}
            <div className="flex-[2] border-r border-white/10 flex flex-col">
              {/* AM */}
              <div className="flex flex-1 border-b border-white/10">
                <div className="w-10 flex items-center justify-center font-bold text-white/60 text-[11px] border-r border-white/10 bg-white/5">
                  AM
                </div>
                <div className="flex-1 grid grid-cols-6 gap-0.5 p-1">
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => (
                    <button
                      key={`am-${hour}`}
                      type="button"
                      onClick={() => handleH(hour, false)}
                      className={`h-8 text-[12px] flex items-center justify-center rounded transition-colors ${
                        selH === hour && !selPm ? "bg-gold text-black font-bold shadow-md" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              {/* PM */}
              <div className="flex flex-1 bg-black/40">
                <div className="w-10 flex items-center justify-center font-bold text-gold/80 text-[11px] border-r border-white/10 bg-gold/5">
                  PM
                </div>
                <div className="flex-1 grid grid-cols-6 gap-0.5 p-1">
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => (
                    <button
                      key={`pm-${hour}`}
                      type="button"
                      onClick={() => handleH(hour, true)}
                      className={`h-8 text-[12px] flex items-center justify-center rounded transition-colors ${
                        selH === hour && selPm ? "bg-gold text-black font-bold shadow-md" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes Section */}
            <div className="flex-1 p-1 grid grid-cols-3 gap-0.5 bg-black/20">
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(min => (
                <button
                  key={`m-${min}`}
                  type="button"
                  onClick={() => handleM(min)}
                  className={`h-8 text-[12px] flex items-center justify-center rounded transition-colors ${
                    selM === min ? "bg-gold text-black font-bold shadow-md" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {min.toString().padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
