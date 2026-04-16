import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — has admin privileges to delete users.
// SUPABASE_SERVICE_ROLE_KEY must be set in Vercel environment variables.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Anon client to verify the caller's JWT
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the caller via their access token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Delete user's data from app tables (best-effort, RLS may also handle this)
    //    Order: dependent tables first, then parent tables
    await supabaseAdmin.from("readings").delete().eq("user_id", userId).throwOnError().catch(() => {});
    await supabaseAdmin.from("consultations").delete().eq("user_id", userId).throwOnError().catch(() => {});
    await supabaseAdmin.from("compatibility_results").delete().eq("user_id", userId).throwOnError().catch(() => {});

    // 3. Delete the auth user (cascades auth.identities, etc.)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
