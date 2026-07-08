"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Zap, Truck, CheckCircle2 } from "lucide-react";

const EVENT_TEMPLATES = [
  { icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50", text: "S3 Neural Net intercepted Returnless Fraud attempt (Score: 92/100) in BLR." },
  { icon: Zap, color: "text-amber-500", bg: "bg-amber-50", text: "S8 Engine issued ₹200 Partial Refund concession, saving ₹150 in reverse logistics." },
  { icon: Truck, color: "text-blue-500", bg: "bg-blue-50", text: "S7 bypassed FC DEL-04. 4 units routed peer-to-peer (Zero-Touch)." },
  { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", text: "S12 Knowledge Graph auto-updated Seller Sizing Chart for SKU-99X." },
  { icon: Activity, color: "text-purple-500", bg: "bg-purple-50", text: "S5 Simulator executed 14,200 triage routes in the last 60 seconds." },
  { icon: Zap, color: "text-amber-500", bg: "bg-amber-50", text: "S4 Computer Vision verified 400 'Like-New' items, bypassing manual inspection." },
];

export function LiveEventTicker() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Initial load
    setEvents(Array.from({ length: 4 }).map((_, i) => ({
      ...EVENT_TEMPLATES[i],
      id: `evt-init-${i}`,
      time: new Date(Date.now() - i * 15000).toLocaleTimeString(),
    })));

    // Simulate live event stream
    const interval = setInterval(() => {
      const randomTemplate = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      setEvents((prev) => {
        const newEvent = { ...randomTemplate, id: `evt-${Date.now()}`, time: new Date().toLocaleTimeString() };
        return [newEvent, ...prev].slice(0, 4);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#131A22] rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
        <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Live OS Event Stream</h3>
      </div>
      <div className="p-4 space-y-3">
        {events.map((event, i) => (
          <div key={event.id} className="flex items-start gap-3 animate-fade-in group">
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 min-w-[60px]">{event.time}</span>
            <div className={`mt-0.5 p-1 rounded ${event.bg.replace("50", "900/30")} flex-shrink-0`}>
              <event.icon size={14} className={event.color} />
            </div>
            <p className="text-sm text-slate-300 font-mono flex-1 leading-snug group-hover:text-white transition-colors">
              {event.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
