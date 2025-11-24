import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, type PanInfo } from 'framer-motion';
import { X, Send, CornerDownRight, Heart } from 'lucide-react';

import { useLightBoxStore } from '../../stores/lightBoxStore';
import type { Comment } from '../../types/lightbox';

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

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  const sec = diff / 1000;
  const min = sec / 60;
  const hour = min / 60;
  const day = hour / 24;

  if (sec < 60) return '방금 전';
  if (min < 60) return `${Math.floor(min)}분 전`;
  if (hour < 24) return `${Math.floor(hour)}시간 전`;
  if (day < 2) return '어제';
  if (day < 7) return `${Math.floor(day)}일 전`;

  const d = new Date(timestamp);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}.${String(d.getDate()).padStart(2, '0')}`;
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

  const myName = '나';

  const currentImage = images[commentIndex];
  const imageId = currentImage?.id;

  const list = (imageId ? comments[imageId] : []) ?? [];

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  useEffect(() => {
    setReplyTo(null);
  }, [commentIndex]);

  useEffect(() => {
    if (commentOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [commentOpen]);

  useEffect(() => {
    if (!commentOpen || !bodyRef.current) return;

    requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [list, commentOpen]);

  const handleSend = () => {
    if (!imageId || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      parentId: replyTo ? replyTo.id : null,
      user: myName,
      text: text.trim(),
      createdAt: Date.now(),
      likes: 0,
      likedByMe: false,
    };

    addComment(imageId, newComment);

    setText('');
    setReplyTo(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleLike = (c: Comment) => {
    updateComment(imageId!, c.id, {
      likedByMe: !c.likedByMe,
      likes: c.likedByMe ? c.likes - 1 : c.likes + 1,
    });
  };

  const topLevel = list.filter((c) => c.parentId === null && !c.deleted);
  const replies = (pid: string) =>
    list.filter((c) => c.parentId === pid && !c.deleted);

  const totalCount = list.filter((c) => !c.deleted).length;

  const replyTargetName =
    replyTo?.user === myName ? '나에게' : `${replyTo?.user}님에게`;

  const handleDragClose = (_: any, info: PanInfo) => {
    if (info.offset.y > 160) closeComment();
  };

  return (
    <AnimatePresence>
      {commentOpen && (
        <>
          <Dim
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            onClick={closeComment}
          />

          <Sheet
            drag="y"
            dragElastic={0.15}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragClose}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <SheetHeader>
              <Title>댓글 {totalCount}</Title>
              <X className="close" onClick={closeComment} />
            </SheetHeader>

            <SheetBody ref={bodyRef}>
              {topLevel.map((c) => (
                <div key={c.id}>
                  <CommentItem>
                    <div className="row1">
                      <div className="name">{c.user}</div>
                      <div className="time">{formatTimeAgo(c.createdAt)}</div>
                    </div>

                    <div className="text">{c.text}</div>

                    <div className="actions">
                      <div
                        className={`heart ${c.likedByMe ? 'on' : ''}`}
                        onClick={() => handleLike(c)}
                      >
                        <Heart
                          size={16}
                          fill={c.likedByMe ? '#e63946' : 'none'}
                          color={c.likedByMe ? '#e63946' : '#aaa'}
                        />
                        {c.likes > 0 && <span>{c.likes}</span>}
                      </div>

                      <button
                        className="replyBtn"
                        onClick={() => setReplyTo(c)}
                      >
                        답글 달기
                      </button>

                      {c.user === myName && (
                        <button
                          className="delBtn"
                          onClick={() => deleteComment(imageId!, c.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    {replies(c.id).map((r) => (
                      <ReplyItem key={r.id}>
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
                            <div
                              className={`heart ${r.likedByMe ? 'on' : ''}`}
                              onClick={() => handleLike(r)}
                            >
                              <Heart
                                size={15}
                                fill={r.likedByMe ? '#e63946' : 'none'}
                                color={r.likedByMe ? '#e63946' : '#aaa'}
                              />
                              {r.likes > 0 && <span>{r.likes}</span>}
                            </div>

                            {r.user === myName && (
                              <button
                                className="delBtn"
                                onClick={() => deleteComment(imageId!, r.id)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </ReplyItem>
                    ))}
                  </CommentItem>
                </div>
              ))}
            </SheetBody>

            <InputWrap>
              {replyTo && (
                <ReplyNotice>
                  <span>{replyTargetName} 답글 작성 중…</span>
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
      )}
    </AnimatePresence>
  );
};

export default CommentSheet;
