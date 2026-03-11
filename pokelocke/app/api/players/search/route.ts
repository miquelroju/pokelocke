import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const q = req.nextUrl.searchParams.get("q") || "";

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", `%${q}%`)
    .limit(5);

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}
