import { NextResponse } from "next/server";
import { destroyAdminSession, destroySuperAdminSession } from "@/lib/session";

export async function POST() {
  await destroyAdminSession();
  await destroySuperAdminSession();
  return NextResponse.json({ ok: true });
}
