import { extractFeatures } from '@/detector/feature_extractor';
import { runDetection } from '@/detector/scorer';

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: unknown };

  if (typeof body.message !== 'string' || body.message.trim() === '') {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const features = extractFeatures(body.message);
  const result = runDetection(features);
  return Response.json(result);
}
