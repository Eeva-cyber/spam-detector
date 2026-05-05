import { analyzeMessage } from '@/lib/scoring';

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: unknown };

  if (typeof body.message !== 'string' || body.message.trim() === '') {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const result = analyzeMessage(body.message);
  return Response.json(result);
}
