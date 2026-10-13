export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const userRaw = await env.ALBUM_KV.get("user:" + username);
    if (!userRaw || userRaw !== password) {
      return new Response(JSON.stringify({ ok:false, msg:"账号或密码错误" }), {
        status:200,
        headers:{"Content-Type":"application/json"}
      });
    }
    const token = username + "-" + Date.now();
    return new Response(JSON.stringify({ ok:true, token }), {
      status:200,
      headers:{"Content-Type":"application/json"}
    });
  } catch(err){
    return new Response(JSON.stringify({ ok:false, msg:"服务器异常" }), {
      status:200,
      headers:{"Content-Type":"application/json"}
    });
  }
}
