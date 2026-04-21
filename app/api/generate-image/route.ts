import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt || body.p;

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const modalEndpoint = process.env.MODAL_WEB_ENDPOINT || 'https://gautamjain040--flux-gen-generate.modal.run';

    const response = await fetch(modalEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
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