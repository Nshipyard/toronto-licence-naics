import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export interface SectorStat {
  code: string;
  title: string;
  active: number;
}
export interface TopCategory {
  category: string;
  active: number;
  naics: string;
  naics_title: string;
  confidence: string;
}
export interface WardTopSector {
  code: string;
  title: string;
  active: number;
}
export interface WardStat {
  ward: string;
  name: string;
  active: number;
  top_sectors: WardTopSector[];
}
export interface GrowthItem {
  category: string;
  early: number;
  late: number;
  change: number;
  naics: string;
  active: number;
}
export interface SummaryMeta {
  source: string;
  source_url: string;
  retrieved: string;
  total_records: number;
  active_licences: number;
  cancelled_records: number;
  categories_total: number;
  categories_mapped: number;
  categories_unmapped: string[];
  coverage_active_pct: number;
  note: string;
}
export interface Summary {
  meta: SummaryMeta;
  sectors: SectorStat[];
  top_categories: TopCategory[];
  wards: WardStat[];
  growth: GrowthItem[];
  limitations: string[];
}
export interface LicenceRecord {
  n: string;
  c: string;
  w: string;
  i: string;
  l: string;
}
export interface MappingRow {
  licence_category: string;
  active_licences: string;
  total_licences: string;
  naics_code: string;
  naics_title: string;
  sector_code: string;
  sector_title: string;
  confidence: string;
  mapping_rule: string;
}

export interface SearchHit extends LicenceRecord {
  naics_code: string;
  naics_title: string;
  sector_code: string;
  sector_title: string;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals: string[] = [];
    let cur = "",
      inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        vals.push(cur);
        cur = "";
      } else cur += ch;
    }
    vals.push(cur);
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = vals[i] ?? ""));
    return o;
  });
}

interface Cache {
  summary: Summary;
  index: LicenceRecord[];
  mapping: Map<string, MappingRow>;
}

let cache: Cache | null = null;

export function getData(): Cache {
  if (cache) return cache;
  const summary = JSON.parse(
    fs.readFileSync(path.join(DATA, "summary.json"), "utf8")
  ) as Summary;
  const index = JSON.parse(
    fs.readFileSync(path.join(DATA, "licences_index.json"), "utf8")
  ) as LicenceRecord[];
  const mapping = new Map<string, MappingRow>();
  for (const r of parseCsv(fs.readFileSync(path.join(DATA, "licence_to_naics.csv"), "utf8"))) {
    mapping.set(r.licence_category, r as unknown as MappingRow);
  }
  cache = { summary, index, mapping };
  return cache;
}

function withMapping(r: LicenceRecord, mapping: Map<string, MappingRow>): SearchHit {
  const m = mapping.get(r.c);
  return {
    ...r,
    naics_code: m?.naics_code ?? "",
    naics_title: m?.naics_title ?? "",
    sector_code: m?.sector_code ?? "",
    sector_title: m?.sector_title ?? "",
  };
}

export function searchLicences(q: string, sector: string, limit: number): { total: number; hits: SearchHit[] } {
  const { index, mapping } = getData();
  const needle = q.trim().toLowerCase();
  const out: SearchHit[] = [];
  let total = 0;
  for (const r of index) {
    if (needle && !r.n.toLowerCase().includes(needle) && !r.l.toLowerCase().includes(needle)) continue;
    const m = mapping.get(r.c);
    if (sector && m?.sector_code !== sector) continue;
    total++;
    if (out.length < limit) out.push(withMapping(r, mapping));
  }
  return { total, hits: out };
}

export function lookupLicence(licenceNo: string): SearchHit | null {
  const { index, mapping } = getData();
  const needle = licenceNo.trim().toLowerCase();
  const r = index.find((x) => x.l.toLowerCase() === needle);
  return r ? withMapping(r, mapping) : null;
}
