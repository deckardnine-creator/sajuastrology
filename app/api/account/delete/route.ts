import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — admin privileges to delete users and their data.
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
    // 1. Authenticate the caller
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

    // 2. Delete user data from app tables.
    //    Order: child/dependent tables first, then parent tables.
    //    Each delete is best-effort — if a table doesn't exist or has no
    //    matching rows, we continue silently. RLS is bypassed because
    //    we're using the service-role client.
    const tables = [
      "iap_transactions",
      "consultation_credits",
      "consultations",
      "compatibility_results",
      "readings",
    ];
    for (const table of tables) {
      try {
        await supabaseAdmin.from(table).delete().eq("user_id", userId);
      } catch {
        // Table might not exist or have no user_id column — skip
      }
    }

    // 3. Delete the auth user (cascades auth.identities, auth.sessions, etc.)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
