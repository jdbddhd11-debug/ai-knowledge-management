import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: Implement classification logic
  return NextResponse.json({ message: "Classification endpoint" });
}
