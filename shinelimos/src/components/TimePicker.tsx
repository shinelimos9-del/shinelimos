import { useState, useRef, useEffect } from "react";

export default function TimePicker({ value, onChange, className }: { value: string, onChange: (v: string) => void, className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse value ("HH:MM")
  let h = 12;
  let m = 0;
  let isPm = false;
  if (value) {
    const parts = value.split(":");
    if (parts.length === 2) {
      let hh = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
      if (hh >= 12) {
        isPm = true;
        if (hh > 12) hh -= 12;
      }
      if (hh === 0) hh = 12;
      h = hh;
    }
  }

  const [selH, setSelH] = useState<number | null>(value ? h : null);
  const [selM, setSelM] = useState<number | null>(value ? m : null);
  const [selPm, setSelPm] = useState<boolean>(value ? isPm : false);

  const updateTime = (newH: number | null, newM: number | null, newPm: boolean) => {
    if (newH !== null && newM !== null) {
      let hh = newH;
      if (newPm && hh !== 12) hh += 12;
      if (!newPm && hh === 12) hh = 0;
      const sh = hh.toString().padStart(2, "0");
      const sm = newM.toString().padStart(2, "0");
      onChange(`${sh}:${sm}`);
      // Only close if both are fully selected
      if (selH !== null && newM !== null) {
        // Optional: auto-close
        // setOpen(false); 
      }
    }
  };

  const handleH = (newH: number, newPm: boolean) => {
    setSelH(newH);
    setSelPm(newPm);
    updateTime(newH, selM !== null ? selM : 0, newPm);
  };

  const handleM = (newM: number) => {
    setSelM(newM);
    updateTime(selH !== null ? selH : 12, newM, selPm);
    setOpen(false); // Close after selecting minute, as that usually completes the action
  };

  const displayVal = value ? `${selH}:${selM?.toString().padStart(2, "0")} ${selPm ? "PM" : "AM"}` : "";

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className={`${className} cursor-pointer flex items-center`} 
        onClick={() => setOpen(!open)}
      >
        {displayVal || <span className="text-white/30">Select Time</span>}
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 glass rounded-xl border border-white/20 shadow-2xl p-0 overflow-hidden w-[340px] max-w-[90vw] animate-in fade-in zoom-in-95" style={{ background: "rgba(20,20,20,0.95)" }}>
          <div className="flex border-b border-white/10 bg-black/60 text-[10px] uppercase tracking-widest text-gold text-center">
            <div className="flex-2 py-2.5 border-r border-white/10">Hour</div>
            <div className="flex-1 py-2.5">Minute</div>
          </div>
          
          <div className="flex">
            {/* Hours Section */}
            <div className="flex-2 border-r border-white/10 flex flex-col">
              {/* AM */}
              <div className="flex flex-1 border-b border-white/10">
                <div className="w-10 flex items-center justify-center font-bold text-white/50 text-[11px] border-r border-white/10 bg-white/5">
                  AM
                </div>
                <div className="flex-1 grid grid-cols-6 gap-0 p-1">
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => (
                    <button
                      key={`am-${hour}`}
                      type="button"
                      onClick={() => handleH(hour, false)}
                      className={`h-8 text-[13px] flex items-center justify-center rounded transition-colors ${
                        selH === hour && !selPm ? "bg-gold text-black font-bold" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              {/* PM */}
              <div className="flex flex-1 bg-black/40">
                <div className="w-10 flex items-center justify-center font-bold text-white/50 text-[11px] border-r border-white/10 bg-white/5">
                  PM
                </div>
                <div className="flex-1 grid grid-cols-6 gap-0 p-1">
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => (
                    <button
                      key={`pm-${hour}`}
                      type="button"
                      onClick={() => handleH(hour, true)}
                      className={`h-8 text-[13px] flex items-center justify-center rounded transition-colors ${
                        selH === hour && selPm ? "bg-gold text-black font-bold" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes Section */}
            <div className="flex-1 p-1 grid grid-cols-3 gap-0">
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(min => (
                <button
                  key={`m-${min}`}
                  type="button"
                  onClick={() => handleM(min)}
                  className={`h-8 text-[13px] flex items-center justify-center rounded transition-colors ${
                    selM === min ? "bg-gold text-black font-bold" : "text-white/80 hover:bg-white/10"
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
