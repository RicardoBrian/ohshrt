import { createSessionCookie, jsonResponse, passwordMatches } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return jsonResponse(
      { error: "서버에 ADMIN_PASSWORD / SESSION_SECRET이 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const { password } = body || {};
  if (!passwordMatches(password, env.ADMIN_PASSWORD)) {
    return jsonResponse({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
  }

  const cookie = await createSessionCookie(env.SESSION_SECRET);
  return jsonResponse({ ok: true }, { headers: { "Set-Cookie": cookie } });
}
