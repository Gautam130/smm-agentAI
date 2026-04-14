export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    const { pipeline } = await import('@xenova/transformers');

    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from((output as any).data);

    return Response.json({ embedding });
  } catch (e) {
    console.error('Embed error:', e);
    return Response.json({ error: 'Failed to generate embedding' }, { status: 500 });
  }
}
