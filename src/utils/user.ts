import type { UserInfo } from '../types/UserInfo';
import { fetchAllUsers } from '../services/firebase';

export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'Member':
      return '정회원';
    case 'Associate':
      return '준회원';
    default:
      return '비회원';
  }
};

export const getAllUserInfo = async (
  ids: string[],
): Promise<Record<string, UserInfo>> => {
  const allUsers = await fetchAllUsers();
  const idSet = new Set(ids);

  const result: Record<string, UserInfo> = {};
  for (const [empId, user] of Object.entries(allUsers)) {
    if (!idSet.has(empId)) continue;
    result[empId] = user as UserInfo;
  }

  return result;
};

export const getAllUsers = async (): Promise<Record<string, UserInfo>> => {
  const allUsers = await fetchAllUsers();
  return allUsers as Record<string, UserInfo>;
};
