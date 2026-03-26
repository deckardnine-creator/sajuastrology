// Server-side Supabase helper for API routes
// Use this instead of manually constructing headers in every route
// NOTE: This file should ONLY be imported in server-side code (api routes, server components)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function getHeaders(prefer?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
  };
  if (prefer) headers["Prefer"] = prefer;
  return headers;
}

/**
 * Fetch from Supabase REST API with proper auth headers
 * @param path - REST path after /rest/v1/ (e.g., "readings?share_slug=eq.abc")
 * @param opts - Additional fetch options (method, body, etc.)
 */
export async function sbFetch(path: string, opts: RequestInit = {}) {
  const prefer = (opts as any)._prefer || "return=representation";
  const { _prefer, ...cleanOpts } = opts as any;
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...cleanOpts,
    headers: {
      ...getHeaders(prefer),
      ...(cleanOpts.headers || {}),
    },
  });
}

/**
 * Quick SELECT helper — returns parsed JSON or null on error
 * @param table - Table name
 * @param query - URL params string (e.g., "share_slug=eq.abc&select=id,name")
 */
export async function sbSelect<T = any>(table: string, query: string): Promise<T[] | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Quick PATCH helper — returns true on success
 * @param table - Table name
 * @param filter - URL filter (e.g., "share_slug=eq.abc")
 * @param data - Object to patch
 */
export async function sbPatch(table: string, filter: string, data: Record<string, any>): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
      method: "PATCH",
      headers: getHeaders("return=minimal"),
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Quick INSERT helper — returns inserted row(s) or null
 * @param table - Table name
 * @param data - Object or array to insert
 */
export async function sbInsert<T = any>(table: string, data: Record<string, any> | Record<string, any>[]): Promise<T[] | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: getHeaders("return=representation"),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
