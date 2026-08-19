import { isAuthenticated, jsonResponse } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env.SESSION_SECRET);
  return jsonResponse({ authenticated });
}
