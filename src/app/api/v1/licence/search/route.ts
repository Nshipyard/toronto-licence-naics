import { NextResponse } from "next/server";
import { searchLicences } from "@/lib/licence";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const sector = url.searchParams.get("sector") ?? "";
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 1), 200);
  return NextResponse.json({ q, sector, limit, ...searchLicences(q, sector, limit) });
}
