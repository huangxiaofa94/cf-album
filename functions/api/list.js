export async function onRequestGet({ env }) {
  try {
    let raw = await env.ALBUM_KV.get("image_list");
    const arr = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(arr), {
      headers:{"Content-Type":"application/json"}
    });
  } catch(err){
    return new Response(JSON.stringify([]), {
      headers:{"Content-Type":"application/json"}
    });
  }
}
