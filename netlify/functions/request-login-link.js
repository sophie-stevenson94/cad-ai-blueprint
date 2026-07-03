// Sends a real one-time login link to a member's email, via Resend.
// Falls back gracefully to instant login (today's behaviour) if Resend
// hasn't been configured yet, so nothing breaks while that's being set up.

import { getStore } from "@netlify/blobs";

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  const email = String(body.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) return json({ ok: false, error: "Enter a valid email." }, 400);

  const membersStore = getStore("members");
  const member = await membersStore.get(email, { type: "json" });
  if (!member) return json({ ok: false, error: "We couldn't find that email. Have you joined yet?" }, 200);

  const resendKey = Netlify.env.get("RESEND_API_KEY");
  const siteUrl = Netlify.env.get("URL") || "https://cad-ai-blueprint.netlify.app";

  // Fallback: Resend not configured yet — log the member in instantly,
  // same as before, so the site keeps working while that's being set up.
  if (!resendKey) {
    return json({ ok: true, mode: "instant", email });
  }

  const token = randomToken();
  const tokensStore = getStore("login_tokens");
  await tokensStore.setJSON(token, { email, expires: Date.now() + 15 * 60 * 1000 });

  const loginUrl = `${siteUrl}/?login_token=${token}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CAD Academy <academy@cadconsultantsltd.com>",
        to: [email],
        subject: "Your login link",
        html: `<p>Tap below to log in — this link works once and expires in 15 minutes.</p>
<p><a href="${loginUrl}" style="background:#C9A84C;color:#181410;padding:14px 22px;border-radius:100px;text-decoration:none;font-weight:700;display:inline-block">Log in to CAD Academy</a></p>
<p style="color:#888;font-size:13px">If you didn't request this, you can ignore this email.</p>`,
      }),
    });
    if (!res.ok) {
      // Email failed to send — fall back to instant login rather than locking them out.
      return json({ ok: true, mode: "instant", email });
    }
  } catch {
    return json({ ok: true, mode: "instant", email });
  }

  return json({ ok: true, mode: "emailed" });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export const config = {
  path: "/api/request-login-link",
};
