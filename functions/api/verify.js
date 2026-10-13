export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    if(body.token){
      return new Response(JSON.stringify({ ok:true }), {
        headers:{"Content-Type":"application/json"}
      });
    }
    return new Response(JSON.stringify({ ok:false }), {status:401});
  } catch(err){
    return new Response(JSON.stringify({ ok:false }), {status:401});
  }
}
