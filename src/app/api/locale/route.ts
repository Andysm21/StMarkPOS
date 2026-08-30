import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/request";

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (locale !== "ar" && locale !== "en") {
    return NextResponse.json({ error: "invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
