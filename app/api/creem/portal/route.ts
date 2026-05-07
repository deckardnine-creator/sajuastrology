// app/api/creem/portal/route.ts
// Creates a Creem Customer Portal session for the authenticated user.
// Portal lets subscribers manage their subscription, update payment
// methods, view invoices, and cancel.
//
// Flow: user email → Creem customer search → customer_id → billing portal URL.

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

const CREEM_API_BASE = "https://api.creem.io/v1";

async function creemFetch(path: string, options?: RequestInit) {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) throw new Error("CREEM_API_KEY missing");
  return fetch(`${CREEM_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(options?.headers || {}),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Step 1: Search for customer by email
    const searchRes = await creemFetch(`/customers?email=${encodeURIComponent(email)}`);
    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error("Creem customer search failed:", errText);
      return NextResponse.json(
        { error: "Customer lookup failed" },
        { status: 502 }
      );
    }

    const searchData = await searchRes.json();
    // Creem returns { items: [...] } or an array — handle both shapes
    const customers = searchData.items || searchData.data || (Array.isArray(searchData) ? searchData : []);
    if (!customers.length) {
      return NextResponse.json(
        { error: "no_creem_customer", detail: "No Creem purchase found for this email" },
        { status: 404 }
      );
    }

    const customerId = customers[0].id;

    // Step 2: Create billing portal session
    const portalRes = await creemFetch("/customers/billing", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId }),
    });

    if (!portalRes.ok) {
      const errText = await portalRes.text();
      console.error("Creem portal creation failed:", errText);
      return NextResponse.json(
        { error: "Portal creation failed" },
        { status: 502 }
      );
    }

    const portalData = await portalRes.json();
    const portalUrl = portalData.customer_portal_link || portalData.url || portalData.portal_url;

    if (!portalUrl) {
      return NextResponse.json(
        { error: "No portal URL returned" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, portal_url: portalUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Creem portal error:", message);
    return NextResponse.json(
      { error: "Portal request failed", detail: message },
      { status: 500 }
    );
  }
}
