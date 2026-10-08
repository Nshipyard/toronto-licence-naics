import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Toronto Licence NAICS API",
    version: "1.0.0",
    description:
      "Toronto's 37,469 active business licences joined to NAICS 2022 industry codes. 92 licence categories mapped by hand with confidence ratings. Source: City of Toronto Open Data (Municipal Licensing and Standards). MIT licensed.",
  },
  servers: [{ url: "https://canada.nshipyard.com/api/v1" }],
  paths: {
    "/licence/search": {
      get: {
        summary: "Search active licences by business name or licence number, optionally filtered by NAICS sector",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "Tim Hortons" },
          { name: "sector", in: "query", required: false, schema: { type: "string" }, example: "72" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: { "200": { description: "Total plus matching licence records with NAICS mapping" } },
      },
    },
    "/licence/lookup": {
      get: {
        summary: "Full record for one active licence, with its NAICS mapping",
        parameters: [{ name: "licence_no", in: "query", required: true, schema: { type: "string" }, example: "B50-1234567" }],
        responses: { "200": { description: "Licence record" }, "404": { description: "No active licence with that number" } },
      },
    },
    "/licence/sectors": {
      get: {
        summary: "Active licence counts by NAICS sector, plus top sectors per ward",
        responses: { "200": { description: "Sector aggregates and ward breakdown" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
