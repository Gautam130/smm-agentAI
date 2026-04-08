import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { action, recipient_handle, message, campaign } = await request.json().catch(() => ({}));

  if (action === 'check_connection') {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

    if (!accessToken || !accountId) {
      return NextResponse.json({ connected: false, error: 'Missing credentials' });
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${accountId}?fields=id,name,username,media_count&access_token=${accessToken}`);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ connected: true, account: data });
      }
      return NextResponse.json({ connected: false, error: 'Invalid token' });
    } catch (e) {
      return NextResponse.json({ connected: false, error: (e as Error).message });
    }
  }

  if (action === 'send_dm') {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

    if (!accessToken || !accountId || !recipient_handle || !message) {
      return NextResponse.json({ success: false, error: 'Missing parameters' });
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${accountId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_type: 'RESPONSE',
          recipient: { handle: recipient_handle },
          message: { text: message },
          access_token: accessToken
        })
      });

      const data = await response.json();
      if (data.id) {
        return NextResponse.json({ success: true, message_id: data.id });
      }
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to send' });
    } catch (e) {
      return NextResponse.json({ success: false, error: (e as Error).message });
    }
  }

  return NextResponse.json({ error: 'Invalid action' });
}

export async function GET() {
  return NextResponse.json({ status: 'Instagram DM API ready' });
}