// A simple shared community feed for members: post a win, a question, or a
// workflow you've built, and reply to others. Deliberately simple — one
// feed, no nested threads, no moderation queue. Posts are capped to the
// most recent 200 to keep things fast and manageable.

import { getStore } from "@netlify/blobs";

const MAX_POSTS = 200;

function displayName(email) {
  const prefix = (email || "").split("@")[0] || "Member";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export default async (req) => {
  const membersStore = getStore("members");
  const communityStore = getStore("community");

  if (req.method === "GET") {
    const posts = (await communityStore.get("posts", { type: "json" })) || [];
    return json({ ok: true, posts });
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

    const posts = (await communityStore.get("posts", { type: "json" })) || [];
    const name = displayName(email);

    if (body.action === "reply") {
      const post = posts.find((p) => p.id === body.postId);
      if (!post) return json({ ok: false, error: "Post not found." }, 404);
      const text = String(body.text || "").trim().slice(0, 800);
      if (!text) return json({ ok: false, error: "Empty reply." }, 400);
      post.replies = post.replies || [];
      post.replies.push({ author: name, text, createdAt: new Date().toISOString() });
      await communityStore.setJSON("posts", posts);
      return json({ ok: true, posts });
    }

    // new post
    const text = String(body.text || "").trim().slice(0, 1500);
    if (!text) return json({ ok: false, error: "Empty post." }, 400);
    const category = ["win", "question", "workflow"].includes(body.category) ? body.category : "question";

    posts.unshift({
      id: "post_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      author: name,
      category,
      text,
      replies: [],
      createdAt: new Date().toISOString(),
    });

    const trimmed = posts.slice(0, MAX_POSTS);
    await communityStore.setJSON("posts", trimmed);
    return json({ ok: true, posts: trimmed });
  }

  return new Response("Method not allowed", { status: 405 });
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export const config = {
  path: "/api/community",
};
