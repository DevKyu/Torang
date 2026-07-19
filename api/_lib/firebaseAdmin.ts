import type { VercelRequest } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

const required = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

export const ensureFirebaseAdmin = () => {
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
};

export const EMP_ID_REGEX = /^\d{8}$/;

export const verifyCallerToken = async (
  req: VercelRequest,
): Promise<DecodedIdToken> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new Error('UNAUTHENTICATED');

  return getAuth().verifyIdToken(token);
};

export const getCallerEmpId = async (req: VercelRequest): Promise<string> => {
  const decoded = await verifyCallerToken(req);
  const empId = decoded.email?.replace('@torang.com', '');
  if (!empId || !EMP_ID_REGEX.test(empId)) throw new Error('UNAUTHENTICATED');

  return empId;
};
