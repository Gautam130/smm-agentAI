export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    // @ts-ignore - @xenova/transformers has no types but works at runtime
    const { pipeline }: any = await import('@xenova/transformers');

    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    return Response.json({ embedding });
  } catch (e) {
    console.error('Embed error:', e);
    return Response.json({ error: 'Failed to generate embedding' }, { status: 500 });
  }
}
