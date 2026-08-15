import { getStore } from '@netlify/blobs';

// Shared storage for the Kitchen Week app.
// GET  /api/data?key=kw.master              -> { key, value }
// GET  /api/data?prefix=kw.week.             -> { keys: [...] }
// POST /api/data  { key, value }             -> set a key
// POST /api/data  { key, action:'delete' }   -> delete a key
//
// If SITE_KEY is set as an environment variable in the Netlify site settings,
// every request must include a matching  x-site-key  header, so randoms who
// find the URL can't read or overwrite the kitchen's data.
//
// consistency: 'strong' below is important — Netlify Blobs defaults to
// "eventual" consistency (fast, edge-cached reads that can lag up to 60s
// behind the latest write). For a live checklist that's the wrong trade:
// a tick could get saved, then a sync moments later reads a stale cached
// copy without it, and it only reappears once the cache catches up. Strong
// consistency reads a touch slower but always reflects the latest write.

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-site-key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const siteKey = process.env.SITE_KEY;
  if (siteKey) {
    const provided = req.headers.get('x-site-key');
    if (provided !== siteKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }
  }

  const store = getStore({ name: 'kitchen-week', consistency: 'strong' });
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const prefix = url.searchParams.get('prefix');
      if (prefix !== null) {
        const { blobs } = await store.list({ prefix });
        return new Response(JSON.stringify({ keys: blobs.map((b) => b.key) }), {
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(JSON.stringify({ error: 'key required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }
      const value = await store.get(key, { type: 'json' });
      return new Response(JSON.stringify({ key, value: value === null ? null : value }), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      if (!body || !body.key) {
        return new Response(JSON.stringify({ error: 'key required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }
      if (body.action === 'delete') {
        await store.delete(body.key);
      } else {
        await store.setJSON(body.key, body.value);
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors }
    });
  }
};

export const config = { path: '/api/data' };
