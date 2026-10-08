"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface WardTopSector {
  code: string;
  title: string;
  active: number;
}
interface Ward {
  ward: string;
  name: string;
  active: number;
  top_sectors: WardTopSector[];
}
interface Growth {
  category: string;
  early: number;
  late: number;
  change: number;
  naics: string;
  active: number;
}

const SEG = ["#d80621", "rgba(10,15,30,0.55)", "rgba(10,15,30,0.22)"];

export default function Showcase() {
  const { t } = useLang();
  const [wards, setWards] = useState<Ward[]>([]);
  const [growth, setGrowth] = useState<Growth[]>([]);

  useEffect(() => {
    fetch("/api/v1/licence/sectors")
      .then((r) => r.json())
      .then((d) => {
        setWards(d.wards ?? []);
        setGrowth((d.growth ?? []).slice(0, 8));
      });
  }, []);

  const maxLate = Math.max(1, ...growth.map((g) => g.late));

  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{t.showcase.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.showcase.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{t.showcase.body}</p>

        <h3 className="display mt-16 text-[28px] md:text-[34px]">{t.showcase.wardTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{t.showcase.wardSub}</p>
        <div className="mt-8 grid gap-x-10 gap-y-5 lg:grid-cols-2">
          {wards.map((w) => (
            <div key={w.ward}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-medium">
                  <span className="font-mono text-ink/50">{w.ward}</span> · {w.name}
                </p>
                <p className="shrink-0 text-[13px] text-ink/50">
                  {w.active.toLocaleString()} {t.showcase.licences}
                </p>
              </div>
              <div className="mt-1.5 flex h-3.5 w-full overflow-hidden rounded-full bg-ink/5">
                {w.top_sectors.map((s, i) => (
                  <div
                    key={s.code}
                    className="h-full"
                    style={{ width: `${(s.active / w.active) * 100}%`, background: SEG[i % SEG.length] }}
                    title={`${s.code} · ${s.title}: ${s.active.toLocaleString()}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[13px] text-ink/55">
                {w.top_sectors.map((s) => `${s.code} · ${s.title}`).join("  /  ")}
              </p>
            </div>
          ))}
        </div>

        <h3 className="display mt-20 text-[28px] md:text-[34px]">{t.showcase.growthTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{t.showcase.growthBody}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {growth.map((g) => (
            <div key={g.category} className="rounded-[24px] border border-line bg-paper-warm p-6">
              <p className="text-[15px] font-semibold leading-snug">{g.category}</p>
              <p className="mt-1 font-mono text-[12px] text-ink/50">
                {g.naics ? `NAICS ${g.naics}` : "unmapped"} · {g.active.toLocaleString()} active
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-16 shrink-0 font-mono text-[12px] text-ink/50">{t.showcase.then}</span>
                  <div className="h-3 rounded-full bg-ink/15" style={{ width: `${(g.early / maxLate) * 100}%` }} />
                  <span className="font-mono text-[13px] text-ink/60">{g.early.toLocaleString()}{t.showcase.perYear}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 shrink-0 font-mono text-[12px] text-ink/50">{t.showcase.now}</span>
                  <div className="h-3 rounded-full bg-canada" style={{ width: `${(g.late / maxLate) * 100}%` }} />
                  <span className="font-mono text-[13px] font-semibold text-canada-dark">
                    {g.late.toLocaleString()}{t.showcase.perYear} (+{g.change.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
