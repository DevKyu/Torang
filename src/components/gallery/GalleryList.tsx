import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

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
} from '../../styles/galleryGridStyle';

import { SmallText } from '../../styles/commonStyle';
import { useLightBoxStore } from '../../stores/lightBoxStore';
import { preloadOpenLightBox } from '../../utils/gallery';
import LightBox from '../lightbox/LightBox';
import { CommentSheet } from '../lightbox/CommentSheet';
import { getCurrentUserId } from '../../services/firebase';

type GalleryItem = {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  empId: string;
  likes?: Record<string, any>;
  comments?: Record<string, any>;
};

type Props = {
  list: GalleryItem[];
  onMoveUpload: () => void;
  onCancel: () => void;
  onChangeMonth: (ym: string) => void;
  yyyymm: string;
  loading?: boolean;
};

const GalleryList = ({
  list,
  onMoveUpload,
  onCancel,
  onChangeMonth,
  yyyymm,
  loading,
}: Props) => {
  const { setImages, open } = useLightBoxStore();

  const [year, setYear] = useState(Number(yyyymm.slice(0, 4)));
  const [month, setMonth] = useState(Number(yyyymm.slice(4, 6)));
  const [filter, setFilter] = useState<'latest' | 'likes' | 'comments'>(
    'latest',
  );
  const [sortedImages, setSortedImages] = useState<GalleryItem[]>([]);
  const [pageLoadedCounts, setPageLoadedCounts] = useState<number[]>([]);

  const minYear = 2025;
  const minMonth = 10;
  const isPrevDisabled =
    year < minYear || (year === minYear && month === minMonth);

  useEffect(() => {
    setYear(Number(yyyymm.slice(0, 4)));
    setMonth(Number(yyyymm.slice(4, 6)));
    setSortedImages([]);
    setPageLoadedCounts([]);
  }, [yyyymm]);

  useEffect(() => {
    const base = list.map((i) => ({
      ...i,
      likesCount: i.likes ? Object.keys(i.likes).length : 0,
      commentsCount: i.comments
        ? Object.values(i.comments).filter((c: any) => !c?.deleted).length
        : 0,
    }));

    const sorted = [...base].sort((a, b) => {
      if (filter === 'likes') return b.likesCount - a.likesCount;
      if (filter === 'comments') return b.commentsCount - a.commentsCount;
      return Number(b.uploadedAt) - Number(a.uploadedAt);
    });

    setSortedImages(sorted);
  }, [filter, list]);

  useEffect(() => {
    if (open) return;

    setImages(
      sortedImages.map((i) => ({
        id: i.id,
        preview: i.url,
        description: i.caption ?? '',
        uploadedAt: i.uploadedAt,
        empId: i.empId,
        likes: i.likes ? Object.keys(i.likes).length : 0,
        liked: Boolean(i.likes?.[getCurrentUserId()]),
      })),
    );
  }, [sortedImages, setImages, open]);

  const pages = useMemo(() => {
    const arr: (GalleryItem | null)[][] = [];
    for (let i = 0; i < sortedImages.length; i += 9) {
      const slice = sortedImages.slice(i, i + 9);
      const filled = [...slice, ...Array(9 - slice.length).fill(null)];
      arr.push(filled);
    }
    return arr;
  }, [sortedImages]);

  useEffect(() => {
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
              ‹
            </MonthNavButton>

            <MonthText>
              {year}년 {month}월
            </MonthText>

            <MonthNavButton onClick={() => moveMonth(1)}>›</MonthNavButton>
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
              key={`g-${yyyymm}-${filter}-${loading}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {loading ? (
                <EmptyBox>불러오는 중…</EmptyBox>
              ) : sortedImages.length === 0 ? (
                <EmptyBox>{month}월 활동 사진이 없습니다.</EmptyBox>
              ) : (
                <Swiper
                  modules={[Pagination]}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  className="gallery-swiper"
                >
                  {pages.map((page, pageIdx) => {
                    const filled = page;
                    const allLoaded =
                      pageLoadedCounts[pageIdx] >=
                      filled.filter((x) => x !== null).length;

                    return (
                      <SwiperSlide key={pageIdx} className="gallery-slide">
                        <GridWrapper>
                          {filled.map((img, i) => (
                            <GridItem
                              key={img ? img.id : `empty-${pageIdx}-${i}`}
                              onClick={() =>
                                img && preloadOpenLightBox(pageIdx * 9 + i)
                              }
                              style={{
                                visibility: img ? 'visible' : 'hidden',
                              }}
                            >
                              {img && (
                                <>
                                  <Skeleton hidden={allLoaded} />
                                  <Thumb
                                    src={img.url}
                                    visible={allLoaded}
                                    onLoad={() =>
                                      setPageLoadedCounts((prev) => {
                                        const next = [...prev];
                                        next[pageIdx] += 1;
                                        return next;
                                      })
                                    }
                                  />
                                </>
                              )}
                            </GridItem>
                          ))}
                        </GridWrapper>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </motion.div>
          </AnimatePresence>

          <AddButton onClick={onMoveUpload}>+ 사진 업로드</AddButton>
          <SmallText top="middle" onClick={onCancel}>
            돌아가기
          </SmallText>
        </GalleryBox>
      </GalleryOuter>

      <LightBox />
      <CommentSheet />
    </>
  );
};

export default GalleryList;
