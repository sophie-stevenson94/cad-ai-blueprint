// Called right after a successful Stripe payment, when the browser lands back
// on the site with ?session_id=... in the URL. Confirms the payment really
// happened (never trust a redirect alone) and returns the paid email so the
// front-end can log the member in automatically — no typing required.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return json({ ok: false, error: "Missing session_id." }, 400);

  const secretKey = Netlify.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) return json({ ok: false, error: "Stripe isn't configured yet." }, 500);

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: "Basic " + btoa(secretKey + ":") },
    });
    if (!res.ok) return json({ ok: false, error: "Couldn't verify that payment." }, 400);
    const session = await res.json();

    if (session.payment_status !== "paid") {
      return json({ ok: false, error: "Payment not yet confirmed." }, 200);
    }

    const email = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    if (!email) return json({ ok: false, error: "No email on this payment." }, 200);

    // Safety net: record the member here too, in case the webhook hasn't fired yet.
    const store = getStore("members");
    const existing = await store.get(email, { type: "json" });
    if (!existing) {
      await store.setJSON(email, {
        email,
        paidAt: new Date().toISOString(),
        stripeCustomer: session.customer || null,
        source: "checkout-redirect",
      });
    }

    return json({ ok: true, email });
  } catch (err) {
    return json({ ok: false, error: "Couldn't verify that payment." }, 500);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export const config = {
  path: "/api/verify-checkout-session",
};
