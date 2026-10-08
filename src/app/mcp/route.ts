import { NextResponse } from "next/server";
import { getData, searchLicences, lookupLicence } from "@/lib/licence";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "toronto-licence-naics", version: "1.0.0" };

const TOOLS = [
  {
    name: "licence_lookup",
    description:
      "Full record for one active Toronto business licence, including its NAICS 2022 industry mapping.",
    inputSchema: {
      type: "object",
      properties: {
        licence_no: { type: "string", description: "Licence number, e.g. from the search tool" },
      },
      required: ["licence_no"],
    },
  },
  {
    name: "licence_search",
    description:
      "Search 37,469 active Toronto business licences by business name or licence number, optionally filtered by 2-digit NAICS sector code (e.g. '72' for food services).",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Business name or licence number fragment" },
        sector: { type: "string", description: "2-digit NAICS sector code, e.g. '72'" },
        limit: { type: "integer", description: "Max results, default 50, max 200" },
      },
    },
  },
  {
    name: "licence_sectors",
    description:
      "Active licence counts by NAICS sector across Toronto, plus the top 3 sectors for each of the 25 wards.",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: any) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return err(msg?.id ?? null, -32600, "Invalid Request");
  }
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = msg.params ?? {};
      try {
        if (name === "licence_lookup") {
          const hit = lookupLicence(String(args.licence_no ?? ""));
          if (!hit) return err(id, -32001, `No active licence ${args.licence_no}`);
          return ok(id, textResult(hit));
        }
        if (name === "licence_search") {
          const q = String(args.q ?? "");
          const sector = String(args.sector ?? "");
          const limit = Math.min(Math.max(parseInt(String(args.limit ?? "50"), 10) || 50, 1), 200);
          return ok(id, textResult({ q, sector, limit, ...searchLicences(q, sector, limit) }));
        }
        if (name === "licence_sectors") {
          const { summary } = getData();
          return ok(id, textResult({ meta: summary.meta, sectors: summary.sectors, wards: summary.wards }));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
