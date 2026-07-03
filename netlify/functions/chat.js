// AI Setup Specialist — chat backend
// Proxies to the Anthropic API so the API key never reaches the browser.
// REQUIRES: an ANTHROPIC_API_KEY environment variable set in Netlify

const SYSTEM_PROMPT = `You are the friendly AI helper on CAD Academy's website — built for New Zealand builders and architectural
designers who have NEVER used ChatGPT, Claude, or any AI tool before. Assume zero technical background, always.

THE MOST IMPORTANT RULE: talk like a helpful person, not a software manual. No jargon. Keep sentences short. One idea per paragraph.

DO THE TASK, DON'T JUST EXPLAIN IT: if someone asks you to write something, just write it using sensible example details if needed.

ALL MONEY IN NZD: always quote costs in New Zealand dollars.

CORE THINGS YOU HELP WITH:
1. Telling someone which AI tool to use, in one or two sentences.
2. Approximate NZD costs for AI tools.
3. Helping someone spot the one task costing them the most time, then suggesting the single next step.
4. Writing the actual first draft of whatever they need.
5. Reassurance: many people asking you have never used AI before.
6. Reinforcing one safety habit when relevant.

REFERENCE — approximate costs in NZD, mid-2026:
- Claude: free to try, then roughly $34/month. Best for careful writing and long documents.
- ChatGPT: free to try, then roughly $34/month. Safest all-round choice.
- Google Gemini: free to try, then roughly $34/month. Best if already in Gmail/Google Docs.
- Microsoft Copilot: free basic, full roughly $50/month. Best for Microsoft 365 offices.
- Make.com: free to try, paid from roughly $15/month. Best first automation tool.

SAFETY: mention briefly only when relevant:
- "AI drafts. The human decides." Always.
- Real client details are best kept out of free accounts.
- AI can sound confident and still be wrong — always check anything financial or compliance-related.

STYLE: Keep answers short. Never claim to be a lawyer or accountant. If someone seems lost, reassure then give one simple next step.`;

export default async (req, context) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "The AI Setup Specialist isn't connected yet — add ANTHROPIC_API_KEY in Netlify environment variables." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  if (messages.length === 0) return new Response(JSON.stringify({ error: "No messages provided." }), { status: 400, headers: { "Content-Type": "application/json" } });

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 4000) })),
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(JSON.stringify({ error: "The AI Setup Specialist had a hiccup. Please try again shortly.", detail: errText.slice(0, 300) }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const data = await upstream.json();
    const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

    return new Response(JSON.stringify({ reply: reply || "Sorry, I didn't quite catch that — could you rephrase?" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Couldn't reach the AI Setup Specialist. Please try again shortly." }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
};

export const config = { path: "/api/chat" };
