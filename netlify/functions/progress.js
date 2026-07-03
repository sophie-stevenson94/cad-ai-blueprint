// Saves and loads a member's progress (Blueprint steps ticked, wizard/health answers)
// so their dashboard is real and follows them across devices — not just localStorage.
// Only works for emails that exist in the "members" store (i.e. have actually paid).

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const membersStore = getStore("members");
  const progressStore = getStore("progress");

  if (req.method === "GET") {
    const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
    if (!email) return json({ ok: false, error: "Missing email." }, 400);
    const member = await membersStore.get(email, { type: "json" });
    if (!member) return json({ ok: false, error: "Not a member." }, 403);
    const data = (await progressStore.get(email, { type: "json" })) || {};
    return json({ ok: true, data });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "Invalid request." }, 400);
    }
    const email = String(body.email || "").toLowerCase().trim();
    if (!email) return json({ ok: false, error: "Missing email." }, 400);
    const member = await membersStore.get(email, { type: "json" });
    if (!member) return json({ ok: false, error: "Not a member." }, 403);

    const existing = (await progressStore.get(email, { type: "json" })) || {};
    const merged = {
      ...existing,
      ...body.data,
      updatedAt: new Date().toISOString(),
    };
    await progressStore.setJSON(email, merged);
    return json({ ok: true, data: merged });
  }

  return new Response("Method not allowed", { status: 405 });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export const config = {
  path: "/api/progress",
};
