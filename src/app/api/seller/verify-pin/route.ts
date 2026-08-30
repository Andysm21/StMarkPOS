import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { pin } = await req.json().catch(() => ({ pin: "" }));
  const expected = process.env.SELLER_PIN;

  if (!expected) {
    return NextResponse.json(
      { error: "SELLER_PIN is not configured on the server." },
      { status: 500 }
    );
  }

  if (typeof pin !== "string" || pin !== expected) {
    return NextResponse.json({ error: "wrong pin" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
