"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/licence/search?q=tim&sector=72&limit=3",
    desc: "Search licences by name, filtered to food services",
    response: `{
  "q": "tim",
  "sector": "72",
  "total": 128,
  "hits": [
    {
      "n": "TIM HORTONS",
      "c": "TAKE-OUT OR RETAIL FOOD ESTABLISHMENT",
      "w": "3", "i": "2012", "l": "B50-4202031",
      "naics_code": "722512",
      "naics_title": "Limited-service eating places",
      "sector_code": "72",
      "sector_title": "Accommodation and food services"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/licence/lookup?licence_no=B50-4202031",
    desc: "Full record for one licence, with its NAICS mapping",
    response: `{
  "n": "TIM HORTONS",
  "c": "TAKE-OUT OR RETAIL FOOD ESTABLISHMENT",
  "w": "3", "i": "2012", "l": "B50-4202031",
  "naics_code": "722512",
  "naics_title": "Limited-service eating places",
  "sector_code": "72",
  "sector_title": "Accommodation and food services"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/licence/sectors",
    desc: "Licence counts by NAICS sector, plus top sectors per ward",
    response: `{ "meta": { "active_licences": 37469, … },
  "sectors": [ { "code": "72", "active": 16284 }, … ],
  "wards": [ … ], "growth": [ … ] }`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="flex flex-col rounded-[24px] border border-white/15 bg-white/5 p-6">
              <p className="font-mono text-[12px] font-semibold text-white/60">{e.method}</p>
              <code className="mt-1 break-all font-mono text-[13px] text-white">{e.path}</code>
              <p className="mt-2 text-[14px] text-white/65">{e.desc}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-[16px] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/80">
                {e.response}
              </pre>
              <a
                href={e.path}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block self-start rounded-full border border-white/25 px-5 py-2 text-[14px] font-semibold hover:border-white"
              >
                {t.developers.tryIt} →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="block rounded-[24px] bg-white/[0.06] p-6 hover:bg-white/[0.09]">
            <h4 className="text-[19px] font-semibold">{t.developers.openapi}</h4>
            <code className="mt-2 block font-mono text-[13px] text-white/60">GET /api/openapi.json</code>
          </a>
        </div>

        <McpConnect
          config={{
            slug: "toronto-licence",
            displayName: "Toronto Licence NAICS",
            exampleEn: 'Search licences for "tim" in the food services sector',
            exampleFr: 'Recherche les permis contenant "tim" dans le secteur des services de restauration',
          }}
        />
      </div>
    </section>
  );
}
