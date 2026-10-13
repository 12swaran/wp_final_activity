import app from '../server/src/server';
import { connectDB, isDbConnected } from '../server/src/config/db';

let connecting: Promise<void> | undefined;

export default async function handler(req: any, res: any) {
  const route = String(req.query?.route || '');
  delete req.query?.route;
  if (route) {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    req.url = `${route.startsWith('/') ? route : `/${route}`}${query ? `?${query}` : ''}`;
  }
  try {
    if (!isDbConnected()) {
      connecting ??= connectDB().finally(() => { connecting = undefined; });
      await connecting;
    }
    return app(req, res);
  } catch {
    return res.status(503).json({ success: false, message: 'Database temporarily unavailable.' });
  }
}
