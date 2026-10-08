"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface Hit {
  n: string;
  c: string;
  w: string;
  i: string;
  l: string;
  naics_code: string;
  naics_title: string;
  sector_code: string;
  sector_title: string;
}

interface Sector {
  code: string;
  title: string;
  active: number;
}

export default function Explorer({ sectors }: { sectors: Sector[] }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function run(query: string, sec: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, sector: sec, limit: "50" });
      const res = await fetch(`/api/v1/licence/search?${params}`);
      const data = await res.json();
      setHits(data.hits ?? []);
      setTotal(data.total ?? 0);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => run(q, sector), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sector]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.explorer.search}
          className="w-full rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none placeholder:text-ink/35 focus:border-canada"
          aria-label={t.explorer.search}
        />
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none focus:border-canada md:w-[320px]"
          aria-label={t.explorer.sector}
        >
          <option value="">{t.explorer.allSectors}</option>
          {sectors.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code} · {s.title} ({s.active.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {!searched && !loading && (
          <p className="max-w-[640px] text-[15px] leading-relaxed text-ink/55">{t.explorer.empty}</p>
        )}
        {loading && <p className="text-[15px] text-ink/55">…</p>}
        {searched && !loading && hits.length === 0 && (
          <p className="text-[15px] text-ink/55">{t.explorer.noResult}</p>
        )}
        {hits.length > 0 && (
          <>
            <p className="mb-4 text-[14px] text-ink/55">
              {t.explorer.showing} {hits.length} {t.explorer.of} {total.toLocaleString()}
            </p>
            <div className="overflow-x-auto rounded-[24px] border border-line">
              <table className="w-full min-w-[760px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-muted text-[12px] uppercase tracking-wide text-ink/55">
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.business}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.category}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.naics}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.ward}</th>
                    <th className="px-5 py-3.5 font-medium">{t.explorer.cols.issued}</th>
                  </tr>
                </thead>
                <tbody>
                  {hits.map((h, i) => (
                    <tr key={`${h.l}-${i}`} className="border-b border-line last:border-0 hover:bg-paper-warm">
                      <td className="px-5 py-3.5 font-medium">{h.n || "—"}</td>
                      <td className="px-5 py-3.5 text-ink/70">{h.c}</td>
                      <td className="px-5 py-3.5">
                        {h.naics_code ? (
                          <span className="inline-block rounded-full bg-canada/10 px-2.5 py-1 text-[12px] font-semibold text-canada-dark">
                            {h.naics_code}
                          </span>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink/70">{h.w || "—"}</td>
                      <td className="px-5 py-3.5 text-ink/70">{h.i || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
