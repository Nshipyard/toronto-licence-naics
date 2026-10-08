import { NextResponse } from "next/server";
import { lookupLicence } from "@/lib/licence";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const licenceNo = url.searchParams.get("licence_no") ?? "";
  if (!licenceNo) {
    return NextResponse.json({ error: "licence_no query parameter is required" }, { status: 400 });
  }
  const hit = lookupLicence(licenceNo);
  if (!hit) {
    return NextResponse.json({ error: `No active licence with number ${licenceNo}` }, { status: 404 });
  }
  return NextResponse.json(hit);
}
