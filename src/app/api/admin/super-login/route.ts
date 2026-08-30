import { NextRequest, NextResponse } from "next/server";
import { createSuperAdminSession, hasValidAdminSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.SUPER_ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "SUPER_ADMIN_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  await createSuperAdminSession();
  return NextResponse.json({ ok: true });
}
