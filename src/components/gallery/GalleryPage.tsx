import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { ref, get, update, onValue } from 'firebase/database';
import { toast } from 'sonner';

import GalleryListPage from './GalleryList';
import GalleryUpload from './GalleryUpload';

import {
  uploadGalleryImage,
  saveGalleryMeta,
  checkGalleryUploadAvailability,
} from '../../utils/galleryUpload';

import {
  db,
  empIdFromEmail,
  checkAdminId,
  getUserPins,
  preloadAllNames,
  waitForAuthUser,
} from '../../services/firebase';

import { useLoading } from '../../contexts/LoadingContext';
import { useActivityDates } from '../../hooks/useActivityDates';
import { useUiStore } from '../../stores/useUiStore';
import { useEventStore } from '../../stores/eventStore';
import { getInitialGalleryYm } from '../../utils/gallery';
import type { LightboxComment } from '../../types/lightbox';
import { applyGalleryBoost } from '../../utils/galleryBoost';
import {
  rewardGalleryMaxUpload,
  rewardGalleryLikeCreator,
  rewardGalleryCommentCreator,
} from '../../utils/galleryReward';
import { GALLERY_POLICY } from '../../utils/galleryPolicy';

export type GalleryItem = {
  id: string;
  url: string;
  caption: string;
  empId: string;
  uploadedAt: number;
  order?: number;
  likes?: Record<string, true>;
  comments?: Record<string, LightboxComment>;
};

const GalleryPage = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const { showLoading, hideLoading } = useLoading();
  const { maps: activityMaps, loading: activityLoading } = useActivityDates();
  const { formatServerDate } = useUiStore();

  const [mode, setMode] = useState<'list' | 'upload'>('list');
  const [galleryList, setGalleryList] = useState<GalleryItem[] | null>(null);
  const [uploadCount, setUploadCount] = useState(GALLERY_POLICY.BASE_UPLOAD);

  const [empId, setEmpId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const eventLoaded = useEventStore((s) => s.loaded);
  const rewardCheckedYm = useRef('');
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (galleryList !== null) initialLoadDone.current = true;
  }, [galleryList]);

  const serverYear = Number(formatServerDate('year'));
  const serverMonth = Number(formatServerDate('month'));
  const [ym, setYm] = useState(formatServerDate('ym'));

  useEffect(() => {
    if (activityLoading) return;
    setYm(getInitialGalleryYm(activityMaps, serverYear, serverMonth));
  }, [activityLoading, activityMaps, serverYear, serverMonth]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [user] = await Promise.all([waitForAuthUser(), preloadAllNames()]);
        if (cancelled) return;
        setEmpId(empIdFromEmail(user?.email));
      } catch {
        if (!cancelled) navigate('/', { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    if (!empId) return;
    checkAdminId().then((ok) => setIsAdmin(Boolean(ok)));
  }, [empId]);

  const fetchUploadCount = useCallback(async () => {
    if (!empId) return;

    const snap = await get(
      ref(db, `users/${empId}/gallery/uploadCount/${ym}`),
    );

    setUploadCount(
      snap.exists() ? Number(snap.val()) : GALLERY_POLICY.BASE_UPLOAD,
    );
  }, [empId, ym]);

  useEffect(() => {
    if (!empId) return;

    setGalleryList(null);
    fetchUploadCount();

    const r = ref(db, `gallery/${ym}`);
    const unsub = onValue(r, (snap) => {
      if (!snap.exists()) {
        setGalleryList([]);
        return;
      }

      const list = Object.entries(snap.val() as Record<string, GalleryItem>).map(([id, v]) => ({
        id,
        url: v.url,
        caption: v.caption ?? '',
        empId: v.empId,
        uploadedAt: Number(v.uploadedAt ?? 0),
        order: v.order ?? 0,
        likes: v.likes ?? {},
        comments: v.comments ?? {},
      }));

      setGalleryList(list);
    });

    return () => unsub();
  }, [empId, ym, fetchUploadCount]);

  useEffect(() => {
    if (!empId || !galleryList || !eventLoaded) return;
    if (rewardCheckedYm.current === ym) return;
    rewardCheckedYm.current = ym;

    galleryList
      .filter((img) => img.empId === empId)
      .forEach((img) => {
        rewardGalleryLikeCreator(ym, img.id, empId, Object.keys(img.likes ?? {})).catch(() => {});
        rewardGalleryCommentCreator(ym, img.id, empId, img.comments ?? {}).catch(() => {});
      });
  }, [empId, ym, galleryList, eventLoaded]);

  const uploadPolicy = useMemo(() => {
    if (activityLoading) return { allowed: false, reason: 'loading' };
    const y = Number(ym.slice(0, 4));
    const m = Number(ym.slice(4, 6));
    return checkGalleryUploadAvailability(activityMaps, y, m);
  }, [activityLoading, activityMaps, ym]);

  const gallerySkipState: 'checking' | 'known-empty' | undefined =
    uploadPolicy.reason === 'loading'
      ? 'checking'
      : uploadPolicy.reason === 'no_activity' ||
          uploadPolicy.reason === 'before_activity'
        ? 'known-empty'
        : undefined;

  const handleUpload = useCallback(
    async (files: File[], captions: string[]) => {
      if (!empId) return;

      const needed = files.length;

      if (!isAdmin && uploadCount < needed) {
        toast.error('업로드 가능 횟수가 부족해요.');
        return;
      }

      showLoading();

      try {
        const baseTime = useUiStore.getState().getServerNow().getTime();

        for (let i = 0; i < files.length; i++) {
          const { imageId, url } = await uploadGalleryImage(files[i], ym);

          await saveGalleryMeta({
            ym,
            imageId,
            url,
            caption: captions[i] ?? '',
            uploadedAt: baseTime + i,
            order: i,
          });
        }

        const nextCount = uploadCount - needed;

        const uploadedRef = ref(
          db,
          `users/${empId}/gallery/uploadedCount/${ym}`,
        );

        const uploadedSnap = await get(uploadedRef);
        const prevUploaded = uploadedSnap.exists()
          ? Number(uploadedSnap.val())
          : 0;

        const uploadedNext = prevUploaded + needed;

        await update(ref(db), {
          [`users/${empId}/gallery/uploadCount/${ym}`]: isAdmin
            ? uploadCount
            : nextCount,
          [`users/${empId}/gallery/uploadedCount/${ym}`]: uploadedNext,
        });

        if (!isAdmin) setUploadCount(nextCount);

        rewardGalleryMaxUpload(ym, uploadedNext).catch(() => {});

        setMode('list');
      } finally {
        hideLoading();
      }
    },
    [empId, isAdmin, uploadCount, ym, showLoading, hideLoading],
  );

  const handleBoost = useCallback(async () => {
    if (!empId) return;

    const pin = await getUserPins();
    if (pin < 1) {
      toast.error('핀 개수가 부족해요.');
      return;
    }

    showLoading();
    try {
      const next = await applyGalleryBoost(ym);
      if (typeof next === 'number') setUploadCount(next);
    } finally {
      hideLoading();
    }
  }, [empId, ym, showLoading, hideLoading]);

  return (
    <>
      {mode === 'list' && (
        <GalleryListPage
          list={galleryList}
          ym={ym}
          loading={!initialLoadDone.current && galleryList === null}
          emptyState={gallerySkipState}
          onMoveUpload={() => setMode('upload')}
          onCancel={goBack}
          onChangeMonth={(newYm) => { setGalleryList(null); setYm(newYm); }}
        />
      )}

      {mode === 'upload' && (
        <GalleryUpload
          disabled={!uploadPolicy.allowed}
          availableCount={!isAdmin ? uploadCount : Infinity}
          reason={uploadPolicy.reason}
          onUpload={handleUpload}
          onCancel={() => {
            setMode('list');
            navigate('.', { replace: true });
          }}
          onBoost={
            !isAdmin && uploadCount <= 0 && uploadPolicy.allowed
              ? handleBoost
              : undefined
          }
        />
      )}
    </>
  );
};

export default GalleryPage;
