import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
