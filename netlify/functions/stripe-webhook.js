// Records a paying member when Stripe confirms a successful checkout.
// REQUIRES two Netlify environment variables, added by you (not by Claude):
//   STRIPE_SECRET_KEY     — from dashboard.stripe.com (Developers -> API keys)
//   STRIPE_WEBHOOK_SECRET — shown when you create the webhook endpoint (see instructions)
//
// After adding a Stripe Payment Link (see instructions), go to Stripe Dashboard ->
// Developers -> Webhooks -> Add endpoint, pointing at:
//     https://cad-ai-blueprint.netlify.app/api/stripe-webhook
// and select the "checkout.session.completed" event.

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secretKey = Netlify.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Netlify.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secretKey || !webhookSecret) {
    return new Response("Stripe isn't configured yet — add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Netlify.", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  // Verify the webhook really came from Stripe (manual signature check, no SDK needed).
  let event;
  try {
    event = await verifyStripeSignature(rawBody, sig, webhookSecret);
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    if (email) {
      const store = getStore("members");
      await store.setJSON(email, {
        email,
        paidAt: new Date().toISOString(),
        stripeCustomer: session.customer || null,
        amountTotal: session.amount_total,
        currency: session.currency,
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};

// Minimal Stripe signature verification using Web Crypto (no external SDK).
async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader) throw new Error("Missing signature header");
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) throw new Error("Malformed signature header");

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const macBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = [...new Uint8Array(macBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (expected !== sig) throw new Error("Signature mismatch");
  return JSON.parse(payload);
}

export const config = {
  path: "/api/stripe-webhook",
};
