import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GenerateRequest {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, width = 1024, height = 1024, steps = 28, guidance = 3.0 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const modalTokenId = process.env.MODAL_TOKEN_ID;
    const modalTokenSecret = process.env.MODAL_TOKEN_SECRET;

    if (!modalTokenId || !modalTokenSecret) {
      return NextResponse.json({ error: 'Modal not configured' }, { status: 500 });
    }

    // Call Modal Web Endpoint
    // Note: After deploying, replace with your Modal web endpoint URL
    const modalEndpoint = process.env.MODAL_WEB_ENDPOINT || 'https://gautamjain--flux-gen-generate.modal.sh';

    const response = await fetch(modalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modalTokenId}:${modalTokenSecret}`,
      },
      body: JSON.stringify({
        prompt,
        width,
        height,
        steps,
        guidance,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Modal error:', errorText);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}