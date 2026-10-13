export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  if (url.pathname === "/api/login" || url.pathname === "/") {
    return next();
  }
  if (url.pathname.startsWith("/api/")) {
    const token = request.headers.get("authorization");
    if (!token) {
      return new Response(JSON.stringify({msg:"请先登录"}), {
        status:401,
        headers:{"Content-Type":"application/json"}
      });
    }
  }
  return next();
}
