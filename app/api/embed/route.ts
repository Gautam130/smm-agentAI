import { embed } from '@/lib/embed';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    const embedding = await embed(text);
    return Response.json({ embedding });
  } catch (e) {
    console.error('Embed error:', e);
    return Response.json({ error: 'Failed to generate embedding' }, { status: 500 });
  }
}
