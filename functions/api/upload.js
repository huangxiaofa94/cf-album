export async function onRequestPost({ request, env }) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return new Response(JSON.stringify({ msg:"未登录" }), {status:401});
    }
    const formData = await request.formData();
    const imgFile = formData.get("image");
    if (!imgFile || !(imgFile instanceof File)) {
      return new Response(JSON.stringify({ msg:"请选择图片" }), {status:400});
    }
    if (!imgFile.type.startsWith("image/")) {
      return new Response(JSON.stringify({ msg:"仅支持图片" }), {status:400});
    }
    if(imgFile.size > 5*1024*1024){
      return new Response(JSON.stringify({ msg:"图片不能超过5MB" }), {status:400});
    }
    const imgbbForm = new FormData();
    imgbbForm.append("image", imgFile);
    const imgbbResp = await fetch("https://api.imgbb.com/1/upload?key=cffa6498ea1f2100a7a40e69613fed90", {
      method:"POST",
      body: imgbbForm
    });
    const imgbbData = await imgbbResp.json();
    if(!imgbbData.success){
      return new Response(JSON.stringify({ msg:"图床上传失败" }), {status:500});
    }
    const imageUrl = imgbbData.data.url;
    let listRaw = await env.ALBUM_KV.get("image_list");
    let imgArr = listRaw ? JSON.parse(listRaw):[];
    imgArr.push(imageUrl);
    await env.ALBUM_KV.put("image_list", JSON.stringify(imgArr));
    return new Response(JSON.stringify({ ok:true, url:imageUrl }), {
      headers:{"Content-Type":"application/json"}
    });
  } catch(err){
    return new Response(JSON.stringify({ msg:"上传失败" }), {status:500});
  }
}
