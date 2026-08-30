import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/session";
import { getServiceClient } from "@/lib/supabase/server";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export async function POST(req: NextRequest) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const path = `${crypto.randomUUID()}.webp`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
