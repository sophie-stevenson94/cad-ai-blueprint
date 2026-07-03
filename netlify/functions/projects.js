// Stores a member's projects — the "upload once, reuse everywhere" workspace.
// Each member can have several projects; one can be marked active on the
// client side so every AI tool (chat, agents, document generator) can pull
// its context in automatically instead of the member re-explaining it.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const membersStore = getStore("members");
  const projectsStore = getStore("projects");

  const url = new URL(req.url);
  const email = (req.method === "GET" ? url.searchParams.get("email") : null)?.toLowerCase().trim();

  if (req.method === "GET") {
    if (!email) return json({ ok: false, error: "Missing email." }, 400);
    const member = await membersStore.get(email, { type: "json" });
    if (!member) return json({ ok: false, error: "Not a member." }, 403);
    const projects = (await projectsStore.get(email, { type: "json" })) || [];
    return json({ ok: true, projects });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "Invalid request." }, 400);
    }
    const bodyEmail = String(body.email || "").toLowerCase().trim();
    if (!bodyEmail) return json({ ok: false, error: "Missing email." }, 400);
    const member = await membersStore.get(bodyEmail, { type: "json" });
    if (!member) return json({ ok: false, error: "Not a member." }, 403);

    const projects = (await projectsStore.get(bodyEmail, { type: "json" })) || [];

    if (body.action === "delete" && body.id) {
      const filtered = projects.filter((p) => p.id !== body.id);
      await projectsStore.setJSON(bodyEmail, filtered);
      return json({ ok: true, projects: filtered });
    }

    // create or update
    const proj = body.project || {};
    if (!proj.name) return json({ ok: false, error: "Project needs a name." }, 400);

    if (proj.id) {
      const idx = projects.findIndex((p) => p.id === proj.id);
      if (idx > -1) {
        projects[idx] = { ...projects[idx], ...proj, updatedAt: new Date().toISOString() };
      } else {
        projects.push({ ...proj, createdAt: new Date().toISOString() });
      }
    } else {
      proj.id = "proj_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      proj.createdAt = new Date().toISOString();
      projects.push(proj);
    }

    await projectsStore.setJSON(bodyEmail, projects);
    return json({ ok: true, projects });
  }

  return new Response("Method not allowed", { status: 405 });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export const config = {
  path: "/api/projects",
};
