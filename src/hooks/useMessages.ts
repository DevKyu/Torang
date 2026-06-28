import { useEffect, useMemo, useState } from 'react';
import { ref, push, set, update, remove, onValue, get } from 'firebase/database';
import { db } from '../services/firebase';
import { useUiStore } from '../stores/useUiStore';

export type MessageType = 'all' | 'specific';
export type MessageStatus = 'active' | 'cancelled';

export const MESSAGE_REACTION_EMOJIS = [
  { key: 'thumbsup', emoji: '👍', label: '좋아요' },
  { key: 'heart', emoji: '❤️', label: '하트' },
  { key: 'celebrate', emoji: '🎉', label: '축하' },
  { key: 'laugh', emoji: '😆', label: '웃음' },
  { key: 'sad', emoji: '😢', label: '슬픔' },
] as const;

export type MessageReactionKey = (typeof MESSAGE_REACTION_EMOJIS)[number]['key'];

export const MESSAGE_REACTION_EMOJI_MAP = Object.fromEntries(
  MESSAGE_REACTION_EMOJIS.map((r) => [r.key, r.emoji]),
) as Record<MessageReactionKey, string>;

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
  displayStartAt?: number;
  displayEndAt?: number;
};

const isWithinPopupWindow = (m: AdminMessage, now: number) =>
  now >= (m.displayStartAt ?? m.createdAtMs) &&
  now < (m.displayEndAt ?? Infinity);

const isWithinHistoryWindow = (m: AdminMessage, now: number) =>
  now >= (m.displayStartAt ?? m.createdAtMs);

export type MessageDisplayStatus =
  | 'scheduled'
  | 'active'
  | 'popupEnded'
  | 'cancelled';

export const getMessageDisplayStatus = (
  m: AdminMessage,
  now: number,
): MessageDisplayStatus => {
  if (m.status === 'cancelled') return 'cancelled';
  if (m.displayStartAt && now < m.displayStartAt) return 'scheduled';
  if (m.displayEndAt && now >= m.displayEndAt) return 'popupEnded';
  return 'active';
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

export type MessageHistoryItem = AdminMessage & { read: boolean };

export const useMessageInbox = (myEmpId: string) => {
  const { allMessages, readIds, loading } = useMessagesData(myEmpId);

  const queue = useMemo(() => {
    if (loading || readIds === null) return [];
    const now = useUiStore.getState().getServerNow().getTime();
    return allMessages
      .filter((m) => m.status === 'active')
      .filter(
        (m) => m.type === 'all' || (m.targetEmpIds ?? []).includes(myEmpId),
      )
      .filter((m) => !readIds[m.id])
      .filter((m) => isWithinPopupWindow(m, now))
      .sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0));
  }, [allMessages, readIds, myEmpId, loading]);

  const history = useMemo<MessageHistoryItem[]>(() => {
    if (loading || readIds === null) return [];
    const now = useUiStore.getState().getServerNow().getTime();
    return allMessages
      .filter(
        (m) => m.type === 'all' || (m.targetEmpIds ?? []).includes(myEmpId),
      )
      .filter((m) => m.status === 'active' || readIds[m.id])
      .filter((m) => isWithinHistoryWindow(m, now))
      .map((m) => ({ ...m, read: !!readIds[m.id] }))
      .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
  }, [allMessages, readIds, myEmpId, loading]);

  const unreadCount = useMemo(
    () => history.filter((m) => !m.read).length,
    [history],
  );

  return { queue, history, unreadCount, loading };
};

export async function sendMessage(params: {
  title: string;
  content: string;
  type: MessageType;
  targetEmpIds?: string[];
  createdBy: string;
  createdByName?: string;
  displayStartAt?: number;
  displayEndAt?: number;
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
    ...(params.displayStartAt ? { displayStartAt: params.displayStartAt } : {}),
    ...(params.displayEndAt ? { displayEndAt: params.displayEndAt } : {}),
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

export async function setMessageReaction(
  messageId: string,
  empId: string,
  reaction: MessageReactionKey | null,
): Promise<void> {
  if (!messageId || !empId) return;
  const r = ref(db, `messageReactions/${messageId}/${empId}`);
  if (reaction === null) {
    await remove(r);
  } else {
    await set(r, reaction);
  }
}

export type MessageReactionCount = {
  key: MessageReactionKey;
  emoji: string;
  count: number;
};

export function tallyReactionCounts(
  reactions: Record<string, MessageReactionKey> | null,
): MessageReactionCount[] {
  if (!reactions) return [];
  const counts = new Map<MessageReactionKey, number>();
  Object.values(reactions).forEach((key) => {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return MESSAGE_REACTION_EMOJIS.filter(
    ({ key }) => (counts.get(key) ?? 0) > 0,
  ).map(({ key, emoji }) => ({ key, emoji, count: counts.get(key) ?? 0 }));
}

export const useMessageReactions = (
  isOpen: boolean,
  messageId: string | undefined,
  empId: string,
) => {
  const [reactions, setReactions] = useState<Record<
    string,
    MessageReactionKey
  > | null>(null);

  useEffect(() => {
    setReactions(null);
    if (!isOpen || !messageId) return;
    const r = ref(db, `messageReactions/${messageId}`);
    const unsub = onValue(r, (snap) => {
      setReactions(
        snap.exists() ? (snap.val() as Record<string, MessageReactionKey>) : {},
      );
    });
    return unsub;
  }, [isOpen, messageId]);

  const myReaction = reactions?.[empId] ?? null;
  const counts = useMemo(() => tallyReactionCounts(reactions), [reactions]);

  return { myReaction, counts };
};

export async function deleteMessageForever(messageId: string): Promise<void> {
  const readsSnap = await get(ref(db, 'messageReads'));
  const updates: Record<string, null> = {
    [`messages/${messageId}`]: null,
    [`messageReactions/${messageId}`]: null,
  };
  if (readsSnap.exists()) {
    Object.keys(readsSnap.val() as Record<string, unknown>).forEach((empId) => {
      updates[`messageReads/${empId}/${messageId}`] = null;
    });
  }
  await update(ref(db), updates);
}

export type ReadStatusEntry = {
  empId: string;
  name: string;
  read: boolean;
  reaction: MessageReactionKey | null;
};

export const useMessageReadStatus = (
  isOpen: boolean,
  message: AdminMessage | null,
  allNames: Record<string, string>,
  namesLoaded: boolean,
) => {
  const [allReads, setAllReads] = useState<Record<
    string,
    Record<string, true>
  > | null>(null);
  const [reactions, setReactions] = useState<Record<
    string,
    MessageReactionKey
  > | null>(null);

  useEffect(() => {
    if (!isOpen || !message) {
      setAllReads(null);
      setReactions(null);
      return;
    }
    const readsUnsub = onValue(ref(db, 'messageReads'), (snap) => {
      setAllReads(
        snap.exists()
          ? (snap.val() as Record<string, Record<string, true>>)
          : {},
      );
    });
    const reactionsUnsub = onValue(
      ref(db, `messageReactions/${message.id}`),
      (snap) => {
        setReactions(
          snap.exists()
            ? (snap.val() as Record<string, MessageReactionKey>)
            : {},
        );
      },
    );
    return () => {
      readsUnsub();
      reactionsUnsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, message?.id]);

  const loading =
    !isOpen || !message || !namesLoaded || allReads === null || reactions === null;

  const entries = useMemo<ReadStatusEntry[]>(() => {
    if (loading || !message) return [];
    const targetEmpIds =
      message.type === 'all'
        ? Object.keys(allNames)
        : (message.targetEmpIds ?? []);

    return targetEmpIds
      .map((empId) => ({
        empId,
        name: allNames[empId] ?? empId,
        read: !!allReads?.[empId]?.[message.id],
        reaction: reactions?.[empId] ?? null,
      }))
      .sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return a.name.localeCompare(b.name, 'ko');
      });
  }, [loading, message, allNames, allReads, reactions]);

  const reactionCounts = useMemo(
    () => tallyReactionCounts(reactions),
    [reactions],
  );

  return { entries, reactionCounts, loading };
};
