import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const required = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: required('FIREBASE_PROJECT_ID'),
      clientEmail: required('FIREBASE_CLIENT_EMAIL'),
      privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
    databaseURL: required('FIREBASE_DATABASE_URL'),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empId, pin, type, detail, ym } = req.body;
  if (!empId || typeof pin !== 'number' || !type || !ym) {
    return res.status(400).json({ error: 'invalid payload' });
  }

  try {
    const db = getDatabase();
    const pinRef = db.ref(`users/${empId}/pin`);

    await pinRef.transaction((cur) => Number(cur || 0) + pin);

    const readable = new Date().toISOString().replace(/\D/g, '').slice(0, 12);

    await db.ref(`users/${empId}/rewards/${ym}/${type}/${readable}`).set({
      type,
      direction: pin > 0 ? 'gain' : 'loss',
      pin,
      ym,
      detail: detail ?? '',
      createdAt: readable,
      createdAtMs: Date.now(),
    });

    res.status(200).json({ success: true });
  } catch (e: any) {
    console.error('[APPLY PIN]', e);
    res.status(500).json({ error: e.message });
  }
}
