import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
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
  SheetHeader,
  Title,
  SheetBody,
  CommentItem,
  ReplyItem,
  InputWrap,
  ReplyNotice,
  InputBox,
  SafeBottom,
} from '../../styles/commentSheetStyle';

/* timeago */
const formatTimeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const sec = diff / 1000;
  const min = sec / 60;
  const hour = min / 60;
  const day = hour / 24;

  if (sec < 60) return '방금 전';
  if (min < 60) return `${Math.floor(min)}분 전`;
  if (hour < 24) return `${Math.floor(hour)}시간 전`;
  if (day < 2) return '어제';
  if (day < 7) return `${Math.floor(day)}일 전`;

  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

const fadeSlow = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.33 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
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
    deleteComment,
  } = useLightBoxStore();

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const empId = getCurrentUserId();
  const myName = empId ? getCachedUserName(empId) : '나';

  const img = images[commentIndex];
  const imageId = img?.id;
  const uploadedAt = img?.uploadedAt;

  const list = useMemo(
    () => (imageId ? (comments[imageId] ?? []) : []),
    [comments, imageId],
  );

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<LightboxComment | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;

    setTimeout(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }, 0);
  }, []);

  useEffect(() => {
    if (commentOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [commentOpen]);

  useEffect(() => setReplyTo(null), [commentIndex]);

  const handleSend = async () => {
    const t = text.trim();
    if (!imageId || !uploadedAt || !t) return;

    const tempId = `temp_${Date.now()}`;
    const isReply = Boolean(replyTo);

    const optimistic: LightboxComment = {
      id: tempId,
      parentId: isReply ? replyTo!.id : null,
      user: myName,
      text: t,
      createdAt: Date.now(),
      likes: 0,
      likedByMe: false,
    };

    addComment(imageId, optimistic);
    setText('');
    setReplyTo(null);

    if (!isReply) scrollToBottom();

    const realId = await addGalleryComment(
      uploadedAt,
      imageId,
      t,
      optimistic.parentId,
    );

    if (realId) updateComment(imageId, tempId, { id: realId });
  };

  const handleLike = (c: LightboxComment) => {
    if (!imageId || !uploadedAt) return;

    updateComment(imageId, c.id, {
      likedByMe: !c.likedByMe,
      likes: !c.likedByMe ? c.likes + 1 : Math.max(0, c.likes - 1),
    });

    toggleCommentLike(uploadedAt, imageId, c.id, !c.likedByMe);
  };

  const handleDeleteComment = (cid: string) => {
    if (!imageId || !uploadedAt) return;
    deleteComment(imageId, cid);
    deleteGalleryComment(uploadedAt, imageId, cid);
  };

  const topLevel = useMemo(() => {
    return list.filter((c) => !c.deleted && !c.parentId);
  }, [list]);

  const getReplies = useCallback(
    (pid: string) => list.filter((c) => !c.deleted && c.parentId === pid),
    [list],
  );

  const totalCount = list.filter((c) => !c.deleted).length;

  const handleDragClose = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 160) closeComment();
  };

  if (!commentOpen) return null;

  return (
    <AnimatePresence>
      <>
        <Dim key="dim" {...fadeSlow} onClick={closeComment} />

        <Sheet
          key="sheet"
          drag="y"
          dragElastic={0.15}
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.28 } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          <SheetHeader>
            <Title>댓글 {totalCount}</Title>
            <X className="close" onClick={closeComment} />
          </SheetHeader>

          <SheetBody ref={bodyRef}>
            {topLevel.length === 0 && (
              <motion.div
                {...fadeSlow}
                style={{
                  textAlign: 'center',
                  color: '#777',
                  paddingTop: '22px',
                  fontSize: '14px',
                }}
              >
                아직 댓글이 없어요!
              </motion.div>
            )}

            <AnimatePresence mode="sync">
              {topLevel.map((c) => {
                const replies = getReplies(c.id);

                return (
                  <CommentItem key={c.id} {...fadeSlow}>
                    <div className="row1">
                      <div className="name">{c.user}</div>
                      <div className="time">{formatTimeAgo(c.createdAt)}</div>
                    </div>

                    <div className="text">{c.text}</div>

                    <div className="actions">
                      <motion.div
                        className={`heart ${c.likedByMe ? 'on' : ''}`}
                        onClick={() => handleLike(c)}
                        whileTap={{ scale: 0.92 }}
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
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    <AnimatePresence mode="sync">
                      {replies.map((r) => (
                        <ReplyItem key={r.id} {...fadeSlow}>
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
                                onClick={() => handleLike(r)}
                                whileTap={{ scale: 0.92 }}
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
                                  onClick={() => handleDeleteComment(r.id)}
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                        </ReplyItem>
                      ))}
                    </AnimatePresence>
                  </CommentItem>
                );
              })}
            </AnimatePresence>
          </SheetBody>

          <InputWrap>
            {replyTo && (
              <ReplyNotice>
                <span>
                  {replyTo.user === myName
                    ? '나에게 답글 작성 중…'
                    : `${replyTo.user}님에게 답글 작성 중…`}
                </span>
                <button onClick={() => setReplyTo(null)}>취소</button>
              </ReplyNotice>
            )}

            <InputBox>
              <input
                ref={inputRef}
                value={text}
                placeholder="댓글 입력..."
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Send className="send" onClick={handleSend} />
            </InputBox>

            <SafeBottom />
          </InputWrap>
        </Sheet>
      </>
    </AnimatePresence>
  );
};

export default CommentSheet;
