import { NextResponse } from "next/server";
import { getData } from "@/lib/licence";

export async function GET() {
  const { summary } = getData();
  return NextResponse.json({
    meta: summary.meta,
    sectors: summary.sectors,
    wards: summary.wards,
    growth: summary.growth,
  });
}
