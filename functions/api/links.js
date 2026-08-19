import { isAuthenticated, jsonResponse } from "../_utils.js";

const CODE_RE = /^[a-zA-Z0-9_-]{3,32}$/;
const RESERVED = new Set(["api", "admin", "login", "logout", "favicon.ico"]);

function randomCode(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function onRequestGet({ request, env }) {
  if (!(await isAuthenticated(request, env.SESSION_SECRET))) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await env.LINKS.list();
  const items = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.LINKS.get(k.name);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return { code: k.name, ...data };
    })
  );
  const links = items.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
  return jsonResponse({ links });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAuthenticated(request, env.SESSION_SECRET))) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const { url, alias } = body || {};
  if (typeof url !== "string" || !isValidUrl(url)) {
    return jsonResponse({ error: "유효한 URL을 입력하세요 (http:// 또는 https://)" }, { status: 400 });
  }

  let code = alias ? String(alias).trim() : "";
  if (code) {
    if (!CODE_RE.test(code) || RESERVED.has(code.toLowerCase())) {
      return jsonResponse(
        { error: "커스텀 코드는 영문/숫자/-/_ 3~32자여야 하며 예약어는 사용할 수 없습니다" },
        { status: 400 }
      );
    }
    const existing = await env.LINKS.get(code);
    if (existing) {
      return jsonResponse({ error: "이미 사용 중인 코드입니다" }, { status: 409 });
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const candidate = randomCode();
      const existing = await env.LINKS.get(candidate);
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return jsonResponse({ error: "코드 생성에 실패했습니다. 다시 시도하세요" }, { status: 500 });
    }
  }

  const data = { url, createdAt: Date.now() };
  await env.LINKS.put(code, JSON.stringify(data));
  return jsonResponse({ code, ...data }, { status: 201 });
}
