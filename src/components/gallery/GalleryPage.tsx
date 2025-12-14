import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  getCurrentUserId,
  checkAdminId,
  getUserPins,
  preloadAllNames,
} from '../../services/firebase';

import { useLoading } from '../../contexts/LoadingContext';
import { useActivityDates } from '../../hooks/useActivityDates';
import { useUiStore } from '../../stores/useUiStore';
import { getInitialGalleryYm } from '../../utils/gallery';
import { applyGalleryBoost } from '../../utils/galleryBoost';
import { rewardGalleryMaxUpload } from '../../utils/galleryReward';
import { GALLERY_POLICY } from '../../utils/galleryPolicy';

export type GalleryItem = {
  id: string;
  url: string;
  caption: string;
  empId: string;
  uploadedAt: string;
  likes?: Record<string, any>;
  comments?: Record<string, any>;
};

const GalleryPage = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { maps: activityMaps, loading: activityLoading } = useActivityDates();
  const { formatServerDate } = useUiStore();

  const [mode, setMode] = useState<'list' | 'upload'>('list');
  const [galleryList, setGalleryList] = useState<GalleryItem[] | null>(null);
  const [uploadCount, setUploadCount] = useState(GALLERY_POLICY.BASE_UPLOAD);

  const [empId, setEmpId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const serverYear = Number(formatServerDate('year'));
  const serverMonth = Number(formatServerDate('month'));
  const [yyyymm, setYyyymm] = useState(formatServerDate('ym'));

  useEffect(() => {
    if (activityLoading) return;
    setYyyymm(getInitialGalleryYm(activityMaps, serverYear, serverMonth));
  }, [activityLoading, activityMaps, serverYear, serverMonth]);

  useEffect(() => {
    try {
      setEmpId(getCurrentUserId());
      preloadAllNames();
    } catch {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!empId) return;
    checkAdminId().then((ok) => setIsAdmin(Boolean(ok)));
  }, [empId]);

  const fetchUploadCount = useCallback(async () => {
    if (!empId) return;

    const snap = await get(
      ref(db, `users/${empId}/gallery/uploadCount/${yyyymm}`),
    );

    setUploadCount(
      snap.exists() ? Number(snap.val()) : GALLERY_POLICY.BASE_UPLOAD,
    );
  }, [empId, yyyymm]);

  useEffect(() => {
    if (!empId) return;

    setGalleryList(null);
    fetchUploadCount();

    const r = ref(db, `gallery/${yyyymm}`);
    const unsub = onValue(r, (snap) => {
      if (!snap.exists()) {
        setGalleryList([]);
        return;
      }

      const list = Object.entries(snap.val()).map(([id, v]: any) => ({
        id,
        url: v.url,
        caption: v.caption ?? '',
        empId: v.empId,
        uploadedAt: String(v.uploadedAt ?? ''),
        likes: v.likes ?? {},
        comments: v.comments ?? {},
      }));

      setGalleryList(list);
    });

    return () => unsub();
  }, [empId, yyyymm, fetchUploadCount]);

  const uploadPolicy = useMemo(() => {
    if (activityLoading) return { allowed: false, reason: 'loading' };
    const y = Number(yyyymm.slice(0, 4));
    const m = Number(yyyymm.slice(4, 6));
    return checkGalleryUploadAvailability(activityMaps, y, m);
  }, [activityLoading, activityMaps, yyyymm]);

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
        for (let i = 0; i < files.length; i++) {
          const { imageId, url } = await uploadGalleryImage(files[i], yyyymm);

          await saveGalleryMeta({
            yyyymm,
            imageId,
            url,
            caption: captions[i] ?? '',
          });
        }

        const nextCount = uploadCount - needed;

        const uploadedRef = ref(
          db,
          `users/${empId}/gallery/uploadedCount/${yyyymm}`,
        );

        const uploadedSnap = await get(uploadedRef);
        const prevUploaded = uploadedSnap.exists()
          ? Number(uploadedSnap.val())
          : 0;

        const uploadedNext = prevUploaded + needed;

        await update(ref(db), {
          [`users/${empId}/gallery/uploadCount/${yyyymm}`]: isAdmin
            ? uploadCount
            : nextCount,
          [`users/${empId}/gallery/uploadedCount/${yyyymm}`]: uploadedNext,
        });

        if (!isAdmin) setUploadCount(nextCount);

        if (uploadedNext >= GALLERY_POLICY.REWARD_THRESHOLD) {
          rewardGalleryMaxUpload(yyyymm).catch(console.error);
        }

        setMode('list');
      } finally {
        hideLoading();
      }
    },
    [empId, isAdmin, uploadCount, yyyymm, showLoading, hideLoading],
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
      const next = await applyGalleryBoost(yyyymm);
      if (typeof next === 'number') setUploadCount(next);
    } finally {
      hideLoading();
    }
  }, [empId, yyyymm, showLoading, hideLoading]);

  return (
    <>
      {mode === 'list' && (
        <GalleryListPage
          list={galleryList ?? []}
          yyyymm={yyyymm}
          loading={galleryList === null}
          onMoveUpload={() => setMode('upload')}
          onCancel={() => navigate('/menu', { replace: true })}
          onChangeMonth={setYyyymm}
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
