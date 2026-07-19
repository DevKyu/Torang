import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import {
  ensureFirebaseAdmin,
  verifyCallerToken,
  EMP_ID_REGEX,
} from './_lib/firebaseAdmin';

ensureFirebaseAdmin();

const requireAdmin = async (req: VercelRequest): Promise<string> => {
  const decoded = await verifyCallerToken(req);
  const adminSnap = await getDatabase().ref(`admins/${decoded.uid}`).get();
  if (!adminSnap.exists()) throw new Error('FORBIDDEN');

  return decoded.uid;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { empId, newPassword } = (req.body ?? {}) as {
    empId?: string;
    newPassword?: string;
  };
  if (!empId || !newPassword || !EMP_ID_REGEX.test(empId)) {
    res.status(400).json({ error: 'Missing or invalid empId/newPassword' });
    return;
  }

  try {
    await requireAdmin(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    const status = message === 'FORBIDDEN' ? 403 : 401;
    res.status(status).json({ error: '권한이 없습니다.' });
    return;
  }

  try {
    const auth = getAuth();
    const email = `${empId}@torang.com`;

    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password: newPassword });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(400).json({
      error: err instanceof Error ? err.message : 'unknown error',
    });
  }
}
