export async function onRequestGet({ params, env }) {
  const code = params.code;
  const raw = await env.LINKS.get(code);
  if (!raw) {
    return new Response("404: 존재하지 않는 링크입니다.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const data = JSON.parse(raw);
  return Response.redirect(data.url, 302);
}
