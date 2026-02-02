import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { X, Send, CornerDownRight, Heart } from 'lucide-react';

import { useLightBoxStore } from '../../stores/lightBoxStore';
import type { LightboxComment } from '../../types/lightbox';

import {
  addGalleryComment,
  toggleCommentLike,
  deleteGalleryComment,
} from '../../utils/comments';

import { getCurrentUserId, getCachedUserName } from '../../services/firebase';

import {
  Dim,
  Sheet,
  DragZone,
  HandleBar,
  SheetHeader,
  Title,
  SheetBody,
  CommentItem,
  ReplyItem,
  InputWrap,
  ReplyNotice,
  InputBox,
  SafeBottom,
  EmptyState,
} from '../../styles/commentSheetStyle';

const formatTimeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return '방금 전';
  const min = diff / 60000;
  if (min < 60) return `${Math.floor(min)}분 전`;
  const hour = min / 60;
  if (hour < 24) return `${Math.floor(hour)}시간 전`;
  const day = hour / 24;
  if (day < 2) return '어제';
  if (day < 7) return `${Math.floor(day)}일 전`;
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

export const CommentSheet = () => {
  const {
    commentOpen,
    closeComment,
    commentIndex,
    images,
    comments,
    addComment,
    updateComment,
    deleteComment: storeDelete,
  } = useLightBoxStore();

  const image = images[commentIndex];
  const imageId = image?.id;
  const ym = image?.ym;

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const sendingRef = useRef(false);

  const empId = getCurrentUserId();
  const myName = empId ? getCachedUserName(empId) : '나';

  const list = useMemo(() => {
    if (!imageId) return [];

    return [...(comments[imageId] ?? [])].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
  }, [comments, imageId]);

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<LightboxComment | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const y = useMotionValue(0);
  const sheetOpacity = useMotionValue(1);
  const dimOpacity = useTransform(y, [0, 180], [1, 0]);

  const scrollToBottom = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    });
  }, []);

  const grouped = useMemo(() => {
    const top: LightboxComment[] = [];
    const replyMap: Record<string, LightboxComment[]> = {};

    for (const c of list) {
      if (c.deleted) continue;
      if (!c.parentId) top.push(c);
      else {
        if (!replyMap[c.parentId]) replyMap[c.parentId] = [];
        replyMap[c.parentId].push(c);
      }
    }

    top.sort((a, b) => a.createdAt - b.createdAt);
    Object.values(replyMap).forEach((arr) =>
      arr.sort((a, b) => a.createdAt - b.createdAt),
    );

    return { top, replyMap };
  }, [list]);

  const replies = useCallback(
    (pid: string) => grouped.replyMap[pid] ?? [],
    [grouped.replyMap],
  );

  const total =
    grouped.top.length +
    Object.values(grouped.replyMap).reduce((a, v) => a + v.length, 0);

  useEffect(() => {
    setReplyTo(null);
    setText('');
  }, [commentIndex]);

  useEffect(() => {
    document.body.style.overflow = commentOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [commentOpen]);

  const runClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeComment();
  }, [isClosing, closeComment]);

  const onDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const el = bodyRef.current;
      if (el && el.scrollTop > 0) {
        animate(y, 0, { duration: 0.2 });
        return;
      }

      if (info.offset.y > 110) runClose();
      else animate(y, 0, { duration: 0.22 });
    },
    [runClose, y],
  );

  const handleSend = useCallback(async () => {
    if (sendingRef.current || !imageId || !ym) return;
    const t = text.trim();
    if (!t) return;

    sendingRef.current = true;

    const parentId = replyTo?.id ?? null;
    const tempId = `tmp_${Date.now()}_${Math.random()}`;

    const optimistic: LightboxComment = {
      id: tempId,
      parentId,
      user: myName,
      text: t,
      createdAt: Date.now(),
      likes: 0,
      likedByMe: false,
    };

    addComment(imageId, optimistic);
    setText('');
    setReplyTo(null);

    if (!parentId) scrollToBottom();

    try {
      const realId = await addGalleryComment(ym, imageId, t, parentId);
      if (realId) updateComment(imageId, tempId, { id: realId });
    } finally {
      sendingRef.current = false;
    }
  }, [
    text,
    replyTo,
    imageId,
    ym,
    myName,
    addComment,
    updateComment,
    scrollToBottom,
  ]);

  const handleLike = useCallback(
    (c: LightboxComment) => {
      if (!imageId || !ym) return;

      updateComment(imageId, c.id, {
        likedByMe: !c.likedByMe,
        likes: !c.likedByMe ? c.likes + 1 : Math.max(0, c.likes - 1),
      });

      toggleCommentLike(ym, imageId, c.id, !c.likedByMe);
    },
    [imageId, ym, updateComment],
  );

  const handleDelete = useCallback(
    (cid: string) => {
      if (!imageId || !ym) return;
      storeDelete(imageId, cid);
      deleteGalleryComment(ym, imageId, cid);
    },
    [imageId, ym, storeDelete],
  );

  return (
    <AnimatePresence>
      {commentOpen && (
        <motion.div
          key="comment-wrapper"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            pointerEvents: isClosing ? 'none' : 'auto',
          }}
        >
          <Dim
            style={{ opacity: dimOpacity }}
            onClick={runClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />

          <Sheet
            key={imageId}
            style={{ y, opacity: sheetOpacity }}
            drag="y"
            dragElastic={0.12}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragMomentum={false}
            dragPropagation={false}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.32 } }}
            exit={{ opacity: 0, y: 70, transition: { duration: 0.24 } }}
          >
            <DragZone>
              <HandleBar />
              <SheetHeader>
                <Title>댓글 {total}</Title>
                <X className="close" onClick={runClose} />
              </SheetHeader>
            </DragZone>

            <SheetBody ref={bodyRef}>
              {grouped.top.length === 0 && (
                <EmptyState
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  첫 댓글을 남겨보세요
                </EmptyState>
              )}

              <AnimatePresence>
                {grouped.top.map((c) => (
                  <CommentItem
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="row1">
                      <div className="name">{c.user}</div>
                      <div className="time">{formatTimeAgo(c.createdAt)}</div>
                    </div>

                    <div className="text">{c.text}</div>

                    <div className="actions">
                      <motion.div
                        className={`heart ${c.likedByMe ? 'on' : ''}`}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => handleLike(c)}
                        key={c.id + '_like'}
                      >
                        <Heart
                          size={16}
                          fill={c.likedByMe ? '#e63946' : 'none'}
                          color={c.likedByMe ? '#e63946' : '#aaa'}
                        />
                        <span>{c.likes || ''}</span>
                      </motion.div>

                      <button
                        className="replyBtn"
                        onClick={() => {
                          setReplyTo(c);
                          requestAnimationFrame(() =>
                            inputRef.current?.focus(),
                          );
                        }}
                      >
                        답글
                      </button>

                      {c.user === myName && (
                        <button
                          className="delBtn"
                          onClick={() => handleDelete(c.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    {replies(c.id).map((r) => (
                      <ReplyItem
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CornerDownRight size={16} />
                        <div className="inner">
                          <div className="row1">
                            <div className="name">{r.user}</div>
                            <div className="time">
                              {formatTimeAgo(r.createdAt)}
                            </div>
                          </div>

                          <div className="text">{r.text}</div>

                          <div className="actions">
                            <motion.div
                              className={`heart ${r.likedByMe ? 'on' : ''}`}
                              whileTap={{ scale: 0.88 }}
                              onClick={() => handleLike(r)}
                              key={r.id + '_like'}
                            >
                              <Heart
                                size={15}
                                fill={r.likedByMe ? '#e63946' : 'none'}
                                color={r.likedByMe ? '#e63946' : '#aaa'}
                              />
                              <span>{r.likes || ''}</span>
                            </motion.div>

                            {r.user === myName && (
                              <button
                                className="delBtn"
                                onClick={() => handleDelete(r.id)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </ReplyItem>
                    ))}
                  </CommentItem>
                ))}
              </AnimatePresence>
            </SheetBody>

            <InputWrap>
              {replyTo && (
                <ReplyNotice>
                  <span>
                    {replyTo.user === myName
                      ? '나에게 답글 작성 중'
                      : `${replyTo.user}님에게 답글 작성 중`}
                  </span>
                  <button onClick={() => setReplyTo(null)}>취소</button>
                </ReplyNotice>
              )}

              <InputBox>
                <input
                  ref={inputRef}
                  value={text}
                  placeholder="댓글 남기기"
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      !e.nativeEvent.isComposing &&
                      e.key === 'Enter' &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Send className="send" onClick={handleSend} />
              </InputBox>

              <SafeBottom />
            </InputWrap>
          </Sheet>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentSheet;
