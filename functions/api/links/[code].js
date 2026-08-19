import { isAuthenticated, jsonResponse } from "../../_utils.js";

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAuthenticated(request, env.SESSION_SECRET))) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
  const code = params.code;
  const existing = await env.LINKS.get(code);
  if (!existing) {
    return jsonResponse({ error: "찾을 수 없습니다" }, { status: 404 });
  }
  await env.LINKS.delete(code);
  return jsonResponse({ ok: true });
}
