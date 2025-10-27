import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const required = (name: string): string => {
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
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { empId, newPassword } = req.body as {
    empId?: string;
    newPassword?: string;
  };
  if (!empId || !newPassword) {
    res.status(400).json({ error: 'Missing empId or newPassword' });
    return;
  }

  try {
    const auth = getAuth();
    const email = `${empId}@torang.com`;

    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password: newPassword });

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(400).json({ error: err.message });
  }
}
