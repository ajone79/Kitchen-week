import { getStore } from '@netlify/blobs';

// "How are we doing?" metrics endpoint.
//
// GET  /api/metrics
//   -> { kms, nps, foodQuality, updatedAt }  (all null until a value has been posted)
//   Auth: same shared x-site-key as the rest of the app (so only the kitchen's
//   own tablets/devices can read it).
//
// POST /api/metrics   { kms, nps, foodQuality }
//   -> { ok: true }
//   Auth: a SEPARATE secret, x-metrics-key, matching the METRICS_KEY env var.
//   This is deliberately not the same as SITE_KEY: this endpoint is meant to
//   be called from outside the app (a Power Automate flow), so it gets its
//   own key that can be rotated without affecting tablet logins.
//
// Values are expected as numbers 0-100 (percentages). Any of the three can
// be omitted/left out of a POST and the existing stored value for that one
// is left untouched.

const METRICS_STORE_KEY = 'kw.metrics';

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-site-key, x-metrics-key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const store = getStore({ name: 'kitchen-week', consistency: 'strong' });

  try {
    if (req.method === 'GET') {
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
      const value = await store.get(METRICS_STORE_KEY, { type: 'json' });
      return new Response(
        JSON.stringify(value || { kms: null, nps: null, foodQuality: null, updatedAt: null }),
        { headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    if (req.method === 'POST') {
      const metricsKey = process.env.METRICS_KEY;
      if (!metricsKey) {
        return new Response(JSON.stringify({ error: 'METRICS_KEY not configured on server' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }
      const provided = req.headers.get('x-metrics-key');
      if (provided !== metricsKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }

      const body = await req.json();
      const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) * 10) / 10));

      const existing = (await store.get(METRICS_STORE_KEY, { type: 'json' })) || {
        kms: null,
        nps: null,
        foodQuality: null,
        updatedAt: null
      };

      const next = { ...existing };
      if (body.kms !== undefined && body.kms !== null && !Number.isNaN(Number(body.kms))) {
        next.kms = clamp(body.kms);
      }
      if (body.nps !== undefined && body.nps !== null && !Number.isNaN(Number(body.nps))) {
        next.nps = clamp(body.nps);
      }
      if (
        body.foodQuality !== undefined &&
        body.foodQuality !== null &&
        !Number.isNaN(Number(body.foodQuality))
      ) {
        next.foodQuality = clamp(body.foodQuality);
      }
      next.updatedAt = new Date().toISOString();

      await store.setJSON(METRICS_STORE_KEY, next);
      return new Response(JSON.stringify({ ok: true, value: next }), {
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

export const config = { path: '/api/metrics' };
