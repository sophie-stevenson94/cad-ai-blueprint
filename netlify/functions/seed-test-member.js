// This test-only endpoint has been disabled. It no longer writes to the members store.
export default async () => new Response("Disabled", { status: 410 });
export const config = { path: "/api/seed-test-member" };
