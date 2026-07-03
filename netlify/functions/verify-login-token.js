// Verifies a one-time login token from a magic link and logs the member in.
// Tokens are single-use and expire after 15 minutes.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return json({ ok: false, error: "Missing token." }, 400);

  const tokensStore = getStore("login_tokens");
  const record = await tokensStore.get(token, { type: "json" });

  if (!record) return json({ ok: false, error: "That login link isn't valid — request a new one." }, 200);
  if (Date.now() > record.expires) {
    await tokensStore.delete(token);
    return json({ ok: false, error: "That login link has expired — request a new one." }, 200);
  }

  await tokensStore.delete(token); // one-time use
  return json({ ok: true, email: record.email });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export const config = {
  path: "/api/verify-login-token",
};
