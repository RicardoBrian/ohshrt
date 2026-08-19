import { clearSessionCookie, jsonResponse } from "../_utils.js";

export async function onRequestPost() {
  return jsonResponse({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
