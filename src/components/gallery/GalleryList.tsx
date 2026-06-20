import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Heart, MessageCircle } from 'lucide-react';

import {
  GalleryOuter,
  GalleryBox,
  GalleryTitle,
  AddButton,
} from '../../styles/galleryListStyle';

import {
  HeaderRow,
  MonthNavButton,
  MonthText,
  FilterRow,
  FilterButton,
  EmptyBox,
} from '../../styles/galleryListFilterStyle';

import {
  GridWrapper,
  GridItem,
  Thumb,
  Skeleton,
  InfoBar,
  InfoItem,
} from '../../styles/galleryGridStyle';

import { SmallText } from '../../styles/commonStyle';
import { useLightBoxStore } from '../../stores/lightBoxStore';
import { preloadOpenLightBox } from '../../utils/gallery';
import LightBox from '../lightbox/LightBox';
import { getCurrentUserId } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';

type GalleryItem = {
  id: string;
  url: string;
  caption: string;
  uploadedAt: number;
  order?: number;
  empId: string;
  likes?: Record<string, any>;
  comments?: Record<string, any>;
};

type Props = {
  list: GalleryItem[];
  onMoveUpload: () => void;
  onCancel: () => void;
  onChangeMonth: (ym: string) => void;
  ym: string;
  loading?: boolean;
};

const GalleryList = ({
  list,
  onMoveUpload,
  onCancel,
  onChangeMonth,
  ym,
  loading,
}: Props) => {
  const { images: storeImages, setImages, open } = useLightBoxStore();

  useEffect(() => {
    return () => {
      const s = useLightBoxStore.getState();
      if (s.commentOpen) s.closeComment();
      if (s.open) s.closeLightBox();
      if (s.uploadOpen) s.closeUploadLightBox();
    };
  }, []);

  const [year, setYear] = useState(Number(ym.slice(0, 4)));
  const [month, setMonth] = useState(Number(ym.slice(4, 6)));
  const [filter, setFilter] = useState<'latest' | 'likes' | 'comments'>(
    'latest',
  );

  const [sorted, setSorted] = useState<GalleryItem[]>([]);
  const [pageLoadedCounts, setPageLoadedCounts] = useState<number[]>([]);
  const loadTokenRef = useRef(0);

  const minYear = 2025;
  const minMonth = 10;

  const serverNow = useUiStore.getState().getServerNow();
  const maxYear = serverNow.getFullYear();
  const maxMonth = serverNow.getMonth() + 1;

  const isPrevDisabled =
    year < minYear || (year === minYear && month === minMonth);

  const isNextDisabled =
    year > maxYear || (year === maxYear && month >= maxMonth);

  useEffect(() => {
    setYear(Number(ym.slice(0, 4)));
    setMonth(Number(ym.slice(4, 6)));
    setSorted([]);
    setPageLoadedCounts([]);
  }, [ym]);

  useEffect(() => {
    const clean = list.filter(
      (i) => i.url && i.empId && i.uploadedAt !== undefined,
    );

    const base = clean.map((i) => ({
      ...i,
      likesCount: i.likes ? Object.keys(i.likes).length : 0,
      commentsCount: i.comments
        ? Object.values(i.comments).filter((c: any) => !c?.deleted).length
        : 0,
    }));

    const ordered = [...base].sort((a, b) => {
      if (filter === 'likes') {
        return (
          b.likesCount - a.likesCount ||
          b.uploadedAt - a.uploadedAt ||
          (a.order ?? 0) - (b.order ?? 0)
        );
      }

      if (filter === 'comments') {
        return (
          b.commentsCount - a.commentsCount ||
          b.uploadedAt - a.uploadedAt ||
          (a.order ?? 0) - (b.order ?? 0)
        );
      }

      return b.uploadedAt - a.uploadedAt || (a.order ?? 0) - (b.order ?? 0);
    });

    setSorted(ordered);
  }, [filter, list]);

  useEffect(() => {
    if (open || loading) return;

    setImages(
      sorted.map((i) => ({
        id: i.id,
        preview: i.url,
        description: i.caption ?? '',
        uploadedAt: i.uploadedAt,
        empId: i.empId,
        ym,
        likes: i.likes ? Object.keys(i.likes).length : 0,
        liked: Boolean(i.likes?.[getCurrentUserId()]),
        commentCount: (() => {
          if (!i.comments) return 0;
          const all = Object.values(i.comments) as any[];
          const rootIds = new Set(all.filter((c) => !c.deleted && !c.parentId).map((c) => c.id));
          return all.filter((c) => !c.deleted && (!c.parentId || rootIds.has(c.parentId))).length;
        })(),
      })),
    );
  }, [sorted, open, setImages, ym]);

  const pages = useMemo(() => {
    const rows: (GalleryItem | null)[][] = [];
    for (let i = 0; i < sorted.length; i += 9) {
      const slice = sorted.slice(i, i + 9);
      const filled = [...slice, ...Array(9 - slice.length).fill(null)];
      rows.push(filled);
    }
    return rows;
  }, [sorted]);

  useEffect(() => {
    loadTokenRef.current += 1;
    setPageLoadedCounts(new Array(pages.length).fill(0));
  }, [pages.length, filter]);

  const moveMonth = (dir: -1 | 1) => {
    let nextMonth = month + dir;
    let nextYear = year;

    if (nextMonth <= 0) {
      nextYear -= 1;
      nextMonth = 12;
    } else if (nextMonth > 12) {
      nextYear += 1;
      nextMonth = 1;
    }

    if (nextYear < minYear || (nextYear === minYear && nextMonth < minMonth))
      return;

    if (nextYear > maxYear || (nextYear === maxYear && nextMonth > maxMonth))
      return;

    const ym = `${nextYear}${String(nextMonth).padStart(2, '0')}`;
    setYear(nextYear);
    setMonth(nextMonth);
    onChangeMonth(ym);
  };

  return (
    <>
      <GalleryOuter>
        <GalleryBox>
          <GalleryTitle>또랑 갤러리</GalleryTitle>

          <HeaderRow>
            <MonthNavButton
              disabled={isPrevDisabled}
              onClick={() => moveMonth(-1)}
            >
              <ChevronLeft size={15} />
            </MonthNavButton>
            <MonthText>
              {year}년 {month}월
            </MonthText>
            <MonthNavButton disabled={isNextDisabled} onClick={() => moveMonth(1)}>
              <ChevronRight size={15} />
            </MonthNavButton>
          </HeaderRow>

          <FilterRow>
            <FilterButton
              active={filter === 'latest'}
              onClick={() => setFilter('latest')}
            >
              최신순
            </FilterButton>
            <FilterButton
              active={filter === 'likes'}
              onClick={() => setFilter('likes')}
            >
              좋아요순
            </FilterButton>
            <FilterButton
              active={filter === 'comments'}
              onClick={() => setFilter('comments')}
            >
              댓글순
            </FilterButton>
          </FilterRow>

          <AnimatePresence mode="wait">
            <motion.div
              key={`g-${ym}-${filter}-${loading}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {loading ? (
                <EmptyBox>
                  <ClipLoader size={24} color="#9ca3af" />
                </EmptyBox>
              ) : sorted.length === 0 ? (
                <EmptyBox>{month}월 활동 사진이 없습니다.</EmptyBox>
              ) : (
                <Swiper
                  modules={[Pagination]}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                >
                  {pages.map((page, pageIdx) => {
                    const filled = page;
                    const allLoaded =
                      pageLoadedCounts[pageIdx] >=
                      filled.filter((x) => x !== null).length;

                    return (
                      <SwiperSlide key={pageIdx}>
                        <GridWrapper>
                          {filled.map((img, i) => {
                            if (!img)
                              return (
                                <GridItem
                                  key={`empty-${pageIdx}-${i}`}
                                  style={{ visibility: 'hidden' }}
                                />
                              );

                            const offset = pages[0].length;
                            const storeIdx = pageIdx * offset + i;
                            const storeImg = storeImages[storeIdx];
                            const likes = storeImg?.likes ?? 0;
                            const comments = storeImg?.commentCount ?? 0;

                            return (
                              <GridItem
                                key={img.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                  duration: 0.18,
                                  delay: i * 0.04,
                                  ease: 'easeOut',
                                }}
                                onClick={() => preloadOpenLightBox(storeIdx)}
                              >
                                {!loading && <Skeleton hidden={allLoaded} />}

                                <Thumb
                                  src={img.url}
                                  visible={allLoaded}
                                  loading={pageIdx === 0 ? 'eager' : 'lazy'}
                                  onLoad={(e) => {
                                    const imgEl = e.currentTarget;
                                    const token = loadTokenRef.current;

                                    const commit = () => {
                                      if (loadTokenRef.current !== token) return;
                                      setPageLoadedCounts((p) => {
                                        const next = [...p];
                                        next[pageIdx] += 1;
                                        return next;
                                      });
                                    };

                                    if (imgEl.decode) imgEl.decode().then(commit).catch(commit);
                                    else commit();
                                  }}
                                  onError={() =>
                                    setPageLoadedCounts((p) => {
                                      const next = [...p];
                                      next[pageIdx] += 1;
                                      return next;
                                    })
                                  }
                                />

                                <InfoBar>
                                  <InfoItem
                                    key={`like-${img.id}`}
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                  >
                                    <Heart
                                      fill={storeImg?.liked ? 'red' : 'none'}
                                      color={
                                        storeImg?.liked ? 'red' : 'currentColor'
                                      }
                                    />
                                    {likes}
                                  </InfoItem>

                                  <InfoItem
                                    key={`comment-${img.id}`}
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                  >
                                    <MessageCircle />
                                    {comments}
                                  </InfoItem>
                                </InfoBar>
                              </GridItem>
                            );
                          })}
                        </GridWrapper>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </motion.div>
          </AnimatePresence>

          <AddButton disabled={loading} onClick={onMoveUpload}>
            {month}월 사진 업로드
          </AddButton>
          <SmallText
            top="middle"
            onClick={() => {
              if (loading) return;
              onCancel();
            }}
          >
            돌아가기
          </SmallText>
        </GalleryBox>
      </GalleryOuter>

      <LightBox />
    </>
  );
};

export default GalleryList;
