import { useEffect, useMemo, useState } from 'react';
import { ref, push, set, update, remove, onValue, get } from 'firebase/database';
import { db } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';

export type MessageType = 'all' | 'specific';
export type MessageStatus = 'active' | 'cancelled';

export const MESSAGE_TYPE_COLOR: Record<MessageType, string> = {
  all: '#3b82f6',
  specific: '#0d9488',
};

export const MESSAGE_TYPE_LABEL: Record<MessageType, string> = {
  all: '공지',
  specific: '메시지',
};

export type AdminMessage = {
  id: string;
  title: string;
  content: string;
  type: MessageType;
  targetEmpIds?: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  createdAtMs: number;
  status: MessageStatus;
  cancelledAt?: number;
};

export const useAdminMessages = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = ref(db, 'messages');
    const unsub = onValue(r, (snap) => {
      const val = snap.exists()
        ? (snap.val() as Record<string, Omit<AdminMessage, 'id'>>)
        : {};
      const list = Object.entries(val)
        .map(([id, m]) => ({ id, ...m }))
        .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
      setMessages(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { messages, loading };
};

const useMessagesData = (myEmpId: string) => {
  const [allMessages, setAllMessages] = useState<AdminMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [readIds, setReadIds] = useState<Record<string, true> | null>(null);

  useEffect(() => {
    const r = ref(db, 'messages');
    const unsub = onValue(r, (snap) => {
      const val = snap.exists()
        ? (snap.val() as Record<string, Omit<AdminMessage, 'id'>>)
        : {};
      setAllMessages(Object.entries(val).map(([id, m]) => ({ id, ...m })));
      setMessagesLoaded(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!myEmpId) return;
    const r = ref(db, `messageReads/${myEmpId}`);
    const unsub = onValue(r, (snap) => {
      setReadIds(snap.exists() ? (snap.val() as Record<string, true>) : {});
    });
    return unsub;
  }, [myEmpId]);

  const loading = !myEmpId || !messagesLoaded || readIds === null;

  return { allMessages, readIds, loading };
};

export const useUnreadMessageQueue = (myEmpId: string) => {
  const { allMessages, readIds, loading } = useMessagesData(myEmpId);

  const queue = useMemo(() => {
    if (loading || readIds === null) return [];
    return allMessages
      .filter((m) => m.status === 'active')
      .filter(
        (m) => m.type === 'all' || (m.targetEmpIds ?? []).includes(myEmpId),
      )
      .filter((m) => !readIds[m.id])
      .sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0));
  }, [allMessages, readIds, myEmpId, loading]);

  return { queue, loading };
};

export type MessageHistoryItem = AdminMessage & { read: boolean };

export const useMessageHistory = (myEmpId: string) => {
  const { allMessages, readIds, loading } = useMessagesData(myEmpId);

  const history = useMemo<MessageHistoryItem[]>(() => {
    if (loading || readIds === null) return [];
    return allMessages
      .filter(
        (m) => m.type === 'all' || (m.targetEmpIds ?? []).includes(myEmpId),
      )
      .filter((m) => m.status === 'active' || readIds[m.id])
      .map((m) => ({ ...m, read: !!readIds[m.id] }))
      .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
  }, [allMessages, readIds, myEmpId, loading]);

  const unreadCount = useMemo(
    () => history.filter((m) => !m.read).length,
    [history],
  );

  return { history, unreadCount };
};

export async function sendMessage(params: {
  title: string;
  content: string;
  type: MessageType;
  targetEmpIds?: string[];
  createdBy: string;
  createdByName?: string;
}): Promise<void> {
  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const newRef = push(ref(db, 'messages'));
  await set(newRef, {
    title: params.title,
    content: params.content,
    type: params.type,
    ...(params.type === 'specific'
      ? { targetEmpIds: params.targetEmpIds ?? [] }
      : {}),
    createdBy: params.createdBy,
    createdByName: params.createdByName,
    createdAt: getServerTimestamp(),
    createdAtMs: getServerNow().getTime(),
    status: 'active' as MessageStatus,
  });
}

export async function cancelMessage(messageId: string): Promise<void> {
  const { getServerNow } = useUiStore.getState();
  await update(ref(db, `messages/${messageId}`), {
    status: 'cancelled',
    cancelledAt: getServerNow().getTime(),
  });
}

export async function markMessageSeen(
  empId: string,
  messageId: string,
): Promise<void> {
  await set(ref(db, `messageReads/${empId}/${messageId}`), true);
}

export async function deleteMessageForever(messageId: string): Promise<void> {
  await remove(ref(db, `messages/${messageId}`));
}

export type ReadStatusEntry = { empId: string; name: string; read: boolean };

export async function fetchMessageReadStatus(
  message: AdminMessage,
  allNames: Record<string, string>,
): Promise<ReadStatusEntry[]> {
  const targetEmpIds =
    message.type === 'all'
      ? Object.keys(allNames)
      : (message.targetEmpIds ?? []);

  const snap = await get(ref(db, 'messageReads'));
  const allReads = snap.exists()
    ? (snap.val() as Record<string, Record<string, true>>)
    : {};

  return targetEmpIds
    .map((empId) => ({
      empId,
      name: allNames[empId] ?? empId,
      read: !!allReads[empId]?.[message.id],
    }))
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return a.name.localeCompare(b.name, 'ko');
    });
}
