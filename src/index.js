export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/api/login" && request.method === "POST") {
      return await handleLogin(request, env);
    }
    if (path === "/api/list" && request.method === "GET") {
      return await handleList(env);
    }
    if (path === "/api/verify" && request.method === "POST") {
      return await handleVerify(request);
    }
    if (path === "/api/logout" && request.method === "POST") {
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/upload" && request.method === "POST") {
      return await handleUpload(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const userRaw = await env.ALBUM_KV.get("user:" + username);
    if (!userRaw || userRaw !== password) {
      return new Response(JSON.stringify({ ok: false, msg: "账号或密码错误" }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });
    }
    const token = username + "-" + Date.now();
    return new Response(JSON.stringify({ ok: true, token }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, msg: "服务器异常" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function handleList(env) {
  try {
    let raw = await env.ALBUM_KV.get("image_list");
    const arr = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(arr), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function handleVerify(request) {
  try {
    const body = await request.json();
    if (body.token) {
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }
}

async function handleUpload(request, env) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return new Response(JSON.stringify({ msg: "未登录" }), { status: 401 });
    }
    const formData = await request.formData();
    const imgFile = formData.get("image");
    if (!imgFile || !(imgFile instanceof File)) {
      return new Response(JSON.stringify({ msg: "请选择图片" }), { status: 400 });
    }
    if (!imgFile.type.startsWith("image/")) {
      return new Response(JSON.stringify({ msg: "仅支持图片" }), { status: 400 });
    }
    if (imgFile.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ msg: "图片不能超过5MB" }), { status: 400 });
    }
    const imgbbForm = new FormData();
    imgbbForm.append("image", imgFile);
    const imgbbResp = await fetch("https://api.imgbb.com/1/upload?key=cffa6498ea1f2100a7a40e69613fed90", {
      method: "POST",
      body: imgbbForm
    });
    const imgbbData = await imgbbResp.json();
    if (!imgbbData.success) {
      return new Response(JSON.stringify({ msg: "图床上传失败" }), { status: 500 });
    }
    const imageUrl = imgbbData.data.url;
    let listRaw = await env.ALBUM_KV.get("image_list");
    let imgArr = listRaw ? JSON.parse(listRaw) : [];
    imgArr.push(imageUrl);
    await env.ALBUM_KV.put("image_list", JSON.stringify(imgArr));
    return new Response(JSON.stringify({ ok: true, url: imageUrl }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: "上传失败" }), { status: 500 });
  }
}
