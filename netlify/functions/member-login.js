// Checks whether an email belongs to a paying member.
// Honest limitation: this checks the email alone, with no password or emailed
// link — good enough to keep the content off search engines and casual
// visitors, not bulletproof against someone who already knows a real member's
// email address. Worth upgrading later to a proper emailed sign-in link.

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid request." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const email = String(body.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ ok: false, error: "Enter a valid email." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const store = getStore("members");
  const record = await store.get(email, { type: "json" });

  if (!record) {
    return new Response(JSON.stringify({ ok: false, error: "We couldn't find that email. Have you joined yet?" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, email }), { status: 200, headers: { "Content-Type": "application/json" } });
};

export const config = {
  path: "/api/member-login",
};
