import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(new URL('/login?instagram_error=' + encodeURIComponent(error_description || error), request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?instagram_error=No authorization code received', request.url));
  }

  const IG_APP_ID = process.env.INSTAGRAM_APP_ID;
  const IG_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

  if (!IG_APP_ID || !IG_APP_SECRET || !REDIRECT_URI) {
    console.error('[ig-oauth] Missing Instagram OAuth environment variables');
    return NextResponse.redirect(new URL('/login?instagram_error=Instagram OAuth not configured', request.url));
  }
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  let supabaseUserId = null;
  if (state) {
    const decoded = decodeURIComponent(state);
    if (decoded.startsWith('supabase_')) {
      supabaseUserId = decoded.replace('supabase_', '');
    }
  }

  try {
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: IG_APP_ID,
        client_secret: IG_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      })
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.redirect(new URL('/login?instagram_error=' + encodeURIComponent(tokenData.error.message || 'Token exchange failed'), request.url));
    }

    let accessToken = tokenData.access_token;

    try {
      const llRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${IG_APP_ID}&client_secret=${IG_APP_SECRET}&fb_exchange_token=${accessToken}`);
      const llData = await llRes.json();
      if (llData.access_token) accessToken = llData.access_token;
    } catch (e) {
      console.warn('[ig-oauth] Long-lived token exchange failed');
    }

    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`);
    const meData = await meRes.json();
    const facebookUserId = meData.id;
    const displayName = meData.name || 'User';

    let instagramId = null;
    let instagramUsername = null;
    let instagramFollowers = 0;

    try {
      const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesRes.json();

      if (pagesData.data?.length > 0) {
        for (const page of pagesData.data) {
          const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,username,followers_count}&access_token=${page.access_token}`);
          const igData = await igRes.json();
          if (igData.instagram_business_account?.id) {
            instagramId = igData.instagram_business_account.id;
            instagramUsername = igData.instagram_business_account.username;
            instagramFollowers = igData.instagram_business_account.followers_count || 0;
            break;
          }
        }
      }
    } catch (e) {
      console.warn('[ig-oauth] Pages lookup failed');
    }

    if (!instagramId) {
      try {
        const igMeRes = await fetch(`https://graph.instagram.com/me?fields=id,username,followers_count&access_token=${accessToken}`);
        const igMeData = await igMeRes.json();
        if (!igMeData.error && igMeData.id) {
          instagramId = igMeData.id;
          instagramUsername = igMeData.username;
          instagramFollowers = igMeData.followers_count || 0;
        }
      } catch (e) {
        console.warn('[ig-oauth] Direct IG lookup failed');
      }
    }

    const finalId = instagramId || facebookUserId;
    const finalUsername = instagramUsername || displayName.toLowerCase().replace(/\s+/g, '_');

    if (SUPABASE_URL && SUPABASE_KEY && (supabaseUserId || finalId)) {
      try {
        const userId = supabaseUserId || ('ig_' + finalId);
        const payload = {
          instagram_id: finalId,
          instagram_token: accessToken,
          instagram_username: finalUsername,
          instagram_followers: instagramFollowers,
          connected_at: new Date().toISOString(),
          status: 'active'
        };

        await fetch(`${SUPABASE_URL}/rest/v1/user_instagram`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'upsert' },
          body: JSON.stringify({ user_id: userId, ...payload })
        });
      } catch (e) {
        console.warn('[ig-oauth] Supabase storage failed');
      }
    }

    const sessionData = { i: finalId, u: finalUsername, n: displayName, t: accessToken, f: instagramFollowers };
    const encoded = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Connecting...</title>
<style>
  body { background: #080808; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .msg { text-align: center; }
  .spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #00ffcc; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="msg">
  <div class="spinner"></div>
  <p>Signing you in...</p>
</div>
<script>
  try {
    var data = JSON.parse(atob('${encoded}'));
    localStorage.setItem('smm_ig_token', data.t);
    localStorage.setItem('smm_ig_connected', 'true');
    localStorage.setItem('smm_ig_username', data.u);
    localStorage.setItem('smm_ig_id', data.i);
    localStorage.setItem('smm_ig_name', data.n || '');
    localStorage.setItem('smm_ig_followers', String(data.f || 0));
  } catch(e) {}
  setTimeout(function() { window.location.href = '/?ig_return=1'; }, 300);
</script>
</body>
</html>`;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (e) {
    return NextResponse.redirect(new URL('/login?instagram_error=Authentication failed', request.url));
  }
}