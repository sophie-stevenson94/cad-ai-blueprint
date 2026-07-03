// This test-only cleanup endpoint has been disabled.
export default async () => new Response("Disabled", { status: 410 });
export const config = { path: "/api/clear-test-community" };
