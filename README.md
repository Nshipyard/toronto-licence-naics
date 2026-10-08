# toronto-licence-naics

Toronto's 37,469 active business licences, joined to NAICS 2022 industry codes. Nshipyard Canada project 02.

Toronto licenses businesses by local category names ("Eating or Drinking Establishment", "Public Garage"). NAICS, the North American Industry Classification System that Statistics Canada uses to classify businesses, is what economists, planners, and market researchers actually query by. This project is the join between the two: all 92 Toronto licence categories mapped to NAICS 2022 codes by hand, each with a confidence rating and a written mapping rule.

An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.

## What the data shows

- 37,469 active licences across 92 categories, mapped to 13 NAICS sectors. 99.99% of active licences sit in a mapped category.
- Accommodation and food services (sector 72) hold 16,284 active licences, 43% of the total. Other services (81) follow with 8,313, then transportation and warehousing (48) with 5,229.
- Food services dominate 23 of 25 wards. The exceptions are Ward 6 (York Centre) and Ward 7 (Humber River-Black Creek), where other services (personal care, parking, auto repair) lead.
- Fastest-growing categories by licences issued per year (2019-2021 vs 2024-2026): restaurants (+1,726/yr), take-out counters (+1,578/yr), personal services settings (+839/yr). Patio categories that barely existed before 2022, curb lane cafés and expanded patios, now issue hundreds per year.
- All 4,848 tow-truck records are cancelled: tow licensing moved to the Province of Ontario in 2024.

## Files

- `data/licence_to_naics.csv` - the mapping table: 92 categories with NAICS code, sector, confidence, and mapping rule
- `data/summary.json` - sector aggregates, top categories, ward breakdown, growth ranking, methodology notes
- `data/licences_index.json` - trimmed index of the 37,469 active licences (operating name, category, ward, issued year, licence number)
- `data/raw/` - the source CSV from the City of Toronto (not committed)

## Methodology

Source: the City of Toronto open data file "Municipal Licensing and Standards - Business Licences and Permits", retrieved 2026-10-08 (159,955 records). "Active" means the record carries no cancel date, which makes the counts an upper bound. All 92 categories were mapped to NAICS 2022 by hand: 24 exact matches, 51 close matches, 15 at sector level only, 2 unmappable (a noise-exemption permit with no business activity, and a source-system artifact). 5,424 active records (14.5%) carry no ward, so ward analysis covers the remaining 85.5%. Build script: `scripts/build_data.py`.

## Develop

```bash
npm install
npm run dev
```

## API

REST under `/api/v1/licence/`:

- `GET /api/v1/licence/search?q=tim&sector=72&limit=50` - search by business name or licence number, optional 2-digit NAICS sector filter
- `GET /api/v1/licence/lookup?licence_no=B50-4202031` - full record for one licence, with its NAICS mapping
- `GET /api/v1/licence/sectors` - licence counts by NAICS sector, top sectors per ward, growth ranking

OpenAPI 3.1 spec at `/api/openapi.json`.

MCP (streamable HTTP, JSON-RPC 2.0): `POST /mcp` with tools `licence_lookup`, `licence_search`, `licence_sectors`.

## Author

**Richardson Dackam** - [X (@richardsondx)](https://x.com/richardsondx) · [GitHub](https://github.com/richardsondx)

## License

MIT. Licence records are © City of Toronto (open data); the NAICS mapping is original work.
