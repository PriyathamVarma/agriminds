"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2026-10-10T16:00:00+05:30").getTime();

function getRemaining() {
  const difference = Math.max(0, TARGET - Date.now());
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: difference === 0,
  };
}

export default function VizagMeetCountdown() {
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (remaining.finished) return <p className="text-sm font-semibold text-accent">The meet is happening today.</p>;

  return (
    <div className="mt-6 grid grid-cols-4 gap-2 sm:max-w-md sm:gap-3">
      {[['days', remaining.days], ['hours', remaining.hours], ['minutes', remaining.minutes], ['seconds', remaining.seconds]].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-deep-border bg-deep-elevated/70 px-2 py-3 text-center">
          <p className="font-display text-2xl font-semibold text-accent sm:text-3xl">{String(value).padStart(2, "0")}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-deep-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
