// api/instagram-dm.js
// Instagram DM automation via Meta Graph API
// Credentials stored as Vercel env vars - NEVER in frontend code

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, recipient_handle, message, campaign } = req.body || {};

  // CHECK CONNECTION
  if (action === 'check_connection') {
    try {
      // Try to get token from Supabase for the logged-in user first
      const userId = req.body.user_id;
      let accessToken = process.env.INSTAGRAM_ACCESS_TOKEN; // Default to app-level token
      let accountId = process.env.INSTAGRAM_ACCOUNT_ID;

      // If user_id provided, try to get their token from Supabase
      if (userId) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/user_instagram?user_id=eq.${userId}&select=instagram_token,instagram_id`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          const supabaseData = await supabaseRes.json();
          
          if (supabaseData && supabaseData.length > 0 && supabaseData[0].instagram_token) {
            accessToken = supabaseData[0].instagram_token;
            accountId = supabaseData[0].instagram_id || accountId;
          }
        }
      }

      if (!accessToken || !accountId) {
        return res.status(200).json({
          connected: false,
          error: 'No Instagram account connected. Please connect your Instagram in Settings.'
        });
      }

      const r = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}?fields=id,name,username,followers_count,media_count&access_token=${accessToken}`
      );
      const data = await r.json();

      if (data.error) {
        return res.status(200).json({ connected: false, error: data.error.message });
      }

      return res.status(200).json({
        connected: true,
        username: data.username || data.name,
        followers: data.followers_count ? data.followers_count.toLocaleString('en-IN') : '—',
        media_count: data.media_count || 0,
        account_id: data.id
      });
    } catch(e) {
      return res.status(200).json({ connected: false, error: e.message });
    }
  }

  // SEND DM
  if (action === 'send_dm') {
    const userId = req.body.user_id;
    let accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    let accountId = process.env.INSTAGRAM_ACCOUNT_ID;

    // Get user's token from Supabase
    if (userId) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/user_instagram?user_id=eq.${userId}&select=instagram_token,instagram_id`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        const supabaseData = await supabaseRes.json();
        
        if (supabaseData && supabaseData.length > 0 && supabaseData[0].instagram_token) {
          accessToken = supabaseData[0].instagram_token;
          accountId = supabaseData[0].instagram_id || accountId;
        }
      }
    }

    if (!accessToken || !accountId) {
      return res.status(200).json({
        success: false,
        error: 'No Instagram connected. Please connect Instagram first.'
      });
    }

    if (!recipient_handle || !message) {
      return res.status(200).json({ success: false, error: 'Missing handle or message' });
    }

    if (message.length > 1000) {
      return res.status(200).json({ success: false, error: 'Message exceeds 1000 characters' });
    }

    try {
      // Step 1: Get Instagram user ID from username
      const searchRes = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}?fields=business_discovery.username(${encodeURIComponent(recipient_handle)}){id,username,name,profile_picture_url}&access_token=${accessToken}`
      );
      const searchData = await searchRes.json();

      let recipientId = null;

      if (searchData.business_discovery?.id) {
        recipientId = searchData.business_discovery.id;
      } else {
        // Try direct lookup
        const directRes = await fetch(
          `https://graph.facebook.com/v19.0/ig_username:${encodeURIComponent(recipient_handle)}?fields=id,username&access_token=${accessToken}`
        );
        const directData = await directRes.json();

        if (directData.error || !directData.id) {
          return res.status(200).json({
            success: false,
            error: `Could not find Instagram user @${recipient_handle}. They may not exist, have a private account, or need to follow your account first.`
          });
        }
        recipientId = directData.id;
      }

      // Step 2: Send DM
      const dmRes = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
            messaging_type: 'MESSAGE_TAG',
            tag: 'HUMAN_AGENT'
          })
        }
      );

      const dmData = await dmRes.json();

      if (dmData.error) {
        let userError = dmData.error.message;

        if (dmData.error.code === 10) {
          userError = `@${recipient_handle} has not messaged your account first. Instagram only allows DMs to accounts that have previously interacted with you (messaged you or engaged with your content).`;
        } else if (dmData.error.code === 190) {
          userError = 'Access token expired. Please reconnect your Instagram in Settings.';
        } else if (dmData.error.code === 200) {
          userError = 'DM permission not granted. Please reconnect Instagram with the correct permissions.';
        }

        return res.status(200).json({ success: false, error: userError, code: dmData.error.code });
      }

      console.log(`[DM Sent] @${recipient_handle} | Campaign: ${campaign} | MsgID: ${dmData.message_id}`);

      return res.status(200).json({
        success: true,
        message_id: dmData.message_id,
        recipient: recipient_handle
      });

    } catch(e) {
      console.error('DM send error:', e);
      return res.status(200).json({ success: false, error: e.message });
    }
  }

  // STORE TOKEN
  if (action === 'store_token') {
    const { user_id, instagram_id, username, token, account_type, media_count } = req.body || {};

    if (!user_id || !token) {
      return res.status(200).json({ success: false, error: 'Missing user_id or token' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ success: false, error: 'Database not configured' });
    }

    try {
      // Check if record exists
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/user_instagram?user_id=eq.${user_id}&select=id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );
      const checkData = await checkRes.json();

      if (checkData && checkData.length > 0) {
        // Update existing
        await fetch(
          `${supabaseUrl}/rest/v1/user_instagram?user_id=eq.${user_id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              instagram_token: token,
              instagram_id: instagram_id,
              instagram_username: username,
              account_type: account_type,
              media_count: media_count,
              connected_at: new Date().toISOString(),
              status: 'active'
            })
          }
        );
      } else {
        // Insert new
        await fetch(
          `${supabaseUrl}/rest/v1/user_instagram`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: user_id,
              instagram_token: token,
              instagram_id: instagram_id,
              instagram_username: username,
              account_type: account_type,
              media_count: media_count,
              connected_at: new Date().toISOString(),
              status: 'active'
            })
          }
        );
      }

      return res.status(200).json({ success: true });

    } catch(e) {
      console.error('Store token error:', e);
      return res.status(200).json({ success: false, error: e.message });
    }
  }

  // DISCONNECT
  if (action === 'disconnect') {
    const userId = req.body.user_id;

    if (!userId) {
      return res.status(200).json({ success: false, error: 'Missing user_id' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ success: false, error: 'Database not configured' });
    }

    try {
      await fetch(
        `${supabaseUrl}/rest/v1/user_instagram?user_id=eq.${userId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          }
        }
      );

      return res.status(200).json({ success: true });

    } catch(e) {
      return res.status(200).json({ success: false, error: e.message });
    }
  }

  return res.status(200).json({ error: 'Unknown action' });
}
