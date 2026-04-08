// api/instagram-oauth.js
// Handles Facebook/Instagram OAuth callback

export default async function handler(req, res) {
  const { code, error, error_description, state } = req.query;

  // ── Handle OAuth errors from Facebook ──────────────────────────
  if (error) {
    console.error('[ig-oauth] Facebook error:', error, error_description);
    return res.redirect('/login?instagram_error=' + encodeURIComponent(error_description || error));
  }

  if (!code) {
    return res.redirect('/login?instagram_error=' + encodeURIComponent('No authorization code received from Facebook'));
  }

  const IG_APP_ID     = process.env.INSTAGRAM_APP_ID || '2098784637634308';
  const IG_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '3f6eafd068d23a7e62cf713d6a3fefe8';
  const REDIRECT_URI  = 'https://smm-agent-sandy.vercel.app/api/instagram-oauth';
  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;

  console.log('[ig-oauth] APP_ID:', IG_APP_ID, 'APP_SECRET length:', IG_APP_SECRET?.length);

  if (!code) {
    return res.redirect('/login?instagram_error=' + encodeURIComponent('No authorization code received from Facebook'));
  }

  // Parse Supabase user ID from state
  let supabaseUserId = null;
  if (state) {
    const decoded = decodeURIComponent(state);
    if (decoded.startsWith('supabase_')) {
      supabaseUserId = decoded.replace('supabase_', '');
    }
  }

  try {
    // ── Step 1: Exchange code for short-lived token ─────────────
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:    IG_APP_ID,
        client_secret: IG_APP_SECRET,
        grant_type:   'authorization_code',
        redirect_uri:  REDIRECT_URI,
        code:          code
      })
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('[ig-oauth] Token exchange failed:', tokenData.error);
      return res.redirect('/login?instagram_error=' + encodeURIComponent(tokenData.error.message || 'Token exchange failed'));
    }

    let accessToken = tokenData.access_token;

    // ── Step 2: Get long-lived token (60 days) ──────────────────
    try {
      const llRes = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${IG_APP_ID}&client_secret=${IG_APP_SECRET}&fb_exchange_token=${accessToken}`
      );
      const llData = await llRes.json();
      if (llData.access_token) accessToken = llData.access_token;
    } catch(e) {
      console.warn('[ig-oauth] Long-lived token exchange failed, using short-lived:', e.message);
    }

    // ── Step 3: Get user info ────────────────────────────────────
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    const meData = await meRes.json();
    const facebookUserId = meData.id;
    const displayName = meData.name || 'User';

    // ── Step 4: Find linked Instagram account ───────────────────
    let instagramId = null;
    let instagramUsername = null;
    let instagramFollowers = 0;

    // Try via Facebook Pages (Business accounts)
    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const pagesData = await pagesRes.json();

      if (pagesData.data?.length > 0) {
        for (const page of pagesData.data) {
          const igRes = await fetch(
            `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,username,followers_count}&access_token=${page.access_token}`
          );
          const igData = await igRes.json();
          if (igData.instagram_business_account?.id) {
            instagramId       = igData.instagram_business_account.id;
            instagramUsername = igData.instagram_business_account.username;
            instagramFollowers = igData.instagram_business_account.followers_count || 0;
            break;
          }
        }
      }
    } catch(e) {
      console.warn('[ig-oauth] Pages lookup failed:', e.message);
    }

    // Fallback: try direct Instagram Graph API
    if (!instagramId) {
      try {
        const igMeRes = await fetch(
          `https://graph.instagram.com/me?fields=id,username,followers_count&access_token=${accessToken}`
        );
        const igMeData = await igMeRes.json();
        if (!igMeData.error && igMeData.id) {
          instagramId       = igMeData.id;
          instagramUsername = igMeData.username;
          instagramFollowers = igMeData.followers_count || 0;
        }
      } catch(e) {
        console.warn('[ig-oauth] Direct IG lookup failed:', e.message);
      }
    }

    const finalId       = instagramId || facebookUserId;
    const finalUsername = instagramUsername || displayName.toLowerCase().replace(/\s+/g,'_');

    // ── Step 5: Store in Supabase if configured ──────────────────
    if (SUPABASE_URL && SUPABASE_KEY && (supabaseUserId || finalId)) {
      try {
        const userId = supabaseUserId || ('ig_' + finalId);
        const existsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/user_instagram?instagram_id=eq.${finalId}&select=user_id`,
          { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const existsData = await existsRes.json();
        const payload = {
          instagram_id:       finalId,
          instagram_token:    accessToken,
          instagram_username: finalUsername,
          instagram_followers: instagramFollowers,
          connected_at:       new Date().toISOString(),
          status:             'active'
        };

        if (existsData?.length > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/user_instagram?instagram_id=eq.${finalId}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch(`${SUPABASE_URL}/rest/v1/user_instagram`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ user_id: userId, ...payload })
          });
        }
      } catch(e) {
        console.warn('[ig-oauth] Supabase storage failed:', e.message);
      }
    }

    // ── Step 6: Return HTML that sets localStorage and redirects ─
    const sessionData = {
      i: finalId,
      u: finalUsername,
      n: displayName,
      t: accessToken,
      f: instagramFollowers
    };
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
  (function() {
    try {
      var data = JSON.parse(atob('${encoded}'));
      localStorage.setItem('smm_ig_token',      data.t);
      localStorage.setItem('smm_ig_connected',   'true');
      localStorage.setItem('smm_ig_username',    data.u);
      localStorage.setItem('smm_ig_id',          data.i);
      localStorage.setItem('smm_ig_name',        data.n || '');
      localStorage.setItem('smm_ig_followers',   String(data.f || 0));
      localStorage.setItem('smm_ig_just_linked', 'true');

      var session = {
        provider: 'instagram',
        user: {
          id: data.i,
          email: data.u + '@instagram.local',
          user_metadata: { full_name: data.n, instagram_username: data.u }
        }
      };
      localStorage.setItem('smm_ig_session', JSON.stringify(session));

    } catch(e) {
      console.error('Session setup failed:', e);
    }

    setTimeout(function() {
      window.location.href = '/login?ig_return=1';
    }, 300);
  })();
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);

  } catch(e) {
    console.error('[ig-oauth] Unexpected error:', e);
    return res.redirect('/login?instagram_error=' + encodeURIComponent('Authentication failed: ' + e.message));
  }
}
