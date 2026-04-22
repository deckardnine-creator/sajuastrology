// app/api/indexnow/route.ts
//
// IndexNow submission endpoint.
//
// Purpose: Notify Bing (and other IndexNow-compatible engines like Yandex,
// Seznam) of new or updated URLs for immediate crawling — bypassing the
// normal crawl schedule. Critical for our blog cadence (new articles daily)
// because Bing data feeds ChatGPT's search index.
//
// How to call:
//   POST /api/indexnow
//   Body: { urls: string[] }  (1-10000 URLs, all must be same host)
//
// The IndexNow key is verified by Bing via the static file at:
//   https://sajuastrology.com/f841986c74d647a995c0272e7ba0250e.txt
// (already deployed — do NOT delete that file or this endpoint stops working)
//
// Hardening:
//   - Only accepts same-host URLs (sajuastrology.com)
//   - Optional auth via INDEXNOW_TRIGGER_SECRET env var to prevent abuse
//   - Returns upstream status so caller knows if submission succeeded

import { NextResponse } from "next/server";

const INDEXNOW_KEY = "f841986c74d647a995c0272e7ba0250e";
const HOST = "sajuastrology.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

type IndexNowRequest = {
  urls?: unknown;
};

export async function POST(request: Request) {
  // Optional auth: if INDEXNOW_TRIGGER_SECRET is set in env, require it
  // as Bearer token. Leave unset to allow unauthenticated calls.
  const authSecret = process.env.INDEXNOW_TRIGGER_SECRET;
  if (authSecret) {
    const auth = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${authSecret}`;
    if (auth !== expected) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }
  }

  let body: IndexNowRequest;
  try {
    body = (await request.json()) as IndexNowRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json(
      { ok: false, error: "urls[] required" },
      { status: 400 },
    );
  }

  // Validate every URL: must be string, parseable, and on our host.
  const urls: string[] = [];
  for (const u of body.urls) {
    if (typeof u !== "string") {
      return NextResponse.json(
        { ok: false, error: "all urls must be strings" },
        { status: 400 },
      );
    }
    try {
      const parsed = new URL(u);
      if (parsed.hostname !== HOST) {
        return NextResponse.json(
          { ok: false, error: `url not on host ${HOST}: ${u}` },
          { status: 400 },
        );
      }
      urls.push(parsed.toString());
    } catch {
      return NextResponse.json(
        { ok: false, error: `invalid url: ${u}` },
        { status: 400 },
      );
    }
  }

  // IndexNow caps at 10,000 URLs per request; we cap stricter to catch
  // accidental mass submissions.
  if (urls.length > 500) {
    return NextResponse.json(
      { ok: false, error: "too many urls (max 500 per call)" },
      { status: 400 },
    );
  }

  // Submit to IndexNow.
  let upstream: Response;
  try {
    upstream = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Host: "api.indexnow.org",
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "indexnow upstream fetch failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  // IndexNow returns:
  //   200 OK         — accepted
  //   202 Accepted   — received, may need more time to process
  //   400 Bad Request — malformed body
  //   403 Forbidden  — key mismatch (verify .txt file)
  //   422 Unprocessable — URL/host mismatch
  //   429 Too Many   — rate limited (rare — 10k/day)
  const status = upstream.status;
  const accepted = status === 200 || status === 202;

  let upstreamBody: string | null = null;
  try {
    upstreamBody = await upstream.text();
  } catch {
    // ignore
  }

  return NextResponse.json(
    {
      ok: accepted,
      upstreamStatus: status,
      upstreamBody: upstreamBody || null,
      submitted: urls.length,
    },
    { status: accepted ? 200 : 502 },
  );
}

// GET exists so a manual browser visit returns helpful info instead of 405.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/indexnow",
    method: "POST",
    bodyShape: { urls: ["https://sajuastrology.com/..."] },
    maxUrlsPerCall: 500,
    keyLocation: KEY_LOCATION,
    note: "POST with an array of same-host URLs to submit to Bing IndexNow.",
  });
}
