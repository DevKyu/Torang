import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { toast } from 'sonner';

import GalleryListPage from './GalleryList';
import GalleryUpload from './GalleryUpload';

import {
  uploadGalleryImage,
  saveGalleryMeta,
  checkGalleryUploadAvailability,
} from '../../utils/galleryUpload';
import { getYearMonth } from '../../utils/date';
import { addPinUsage } from '../../utils/pin';

import {
  db,
  getCurrentUserId,
  checkAdminId,
  getUserPins,
} from '../../services/firebase';

import { useLoading } from '../../contexts/LoadingContext';
import { useActivityDates } from '../../hooks/useActivityDates';
import { useUiStore } from '../../stores/useUiStore';

const BASE_UPLOAD = 3;

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
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [empId, setEmpId] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(BASE_UPLOAD);

  const yyyymm = getYearMonth();
  const year = Number(formatServerDate('year'));
  const month = Number(formatServerDate('month'));

  useEffect(() => {
    try {
      setEmpId(getCurrentUserId());
    } catch {
      navigate('/', { replace: true });
    }
  }, []);

  useEffect(() => {
    if (!empId) return;

    (async () => {
      const ok = await checkAdminId();
      setIsAdmin(Boolean(ok));
    })();
  }, [empId]);

  const fetchUploadCount = useCallback(async () => {
    if (!empId) return;

    const snap = await get(ref(db, `users/${empId}/uploadCount/${yyyymm}`));
    setUploadCount(snap.exists() ? snap.val() : BASE_UPLOAD);
  }, [empId, yyyymm]);

  const fetchGallery = useCallback(async () => {
    const snap = await get(ref(db, `gallery/${yyyymm}`));

    if (!snap.exists()) {
      setGalleryList([]);
      return;
    }

    const data = snap.val();
    const list = Object.entries(data)
      .map(([id, v]: any) => ({
        id,
        url: v.url,
        caption: v.caption ?? '',
        empId: v.empId,
        uploadedAt: v.uploadedAt,
        likes: v.likes ?? {},
        comments: v.comments ?? {},
      }))
      .sort((a, b) => Number(b.uploadedAt) - Number(a.uploadedAt));

    setGalleryList(list);
  }, [yyyymm]);

  useEffect(() => {
    if (!empId) return;
    fetchUploadCount();
    fetchGallery();
  }, [empId, fetchUploadCount, fetchGallery]);

  const uploadPolicy = useMemo(() => {
    if (activityLoading) return { allowed: false, reason: 'loading' };
    return checkGalleryUploadAvailability(activityMaps, year, month);
  }, [activityLoading, activityMaps, year, month]);

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

        if (!isAdmin) {
          const next = uploadCount - needed;

          await update(ref(db), {
            [`users/${empId}/uploadCount/${yyyymm}`]: next,
          });

          setUploadCount(next);
        }

        await fetchGallery();
        setMode('list');
      } finally {
        hideLoading();
      }
    },
    [
      empId,
      isAdmin,
      uploadCount,
      yyyymm,
      showLoading,
      hideLoading,
      fetchGallery,
    ],
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
      await addPinUsage(1, 'gallery_boost', '업로드 횟수 +3');

      const next = uploadCount + BASE_UPLOAD;

      await update(ref(db), {
        [`users/${empId}/uploadCount/${yyyymm}`]: next,
      });

      setUploadCount(next);
    } finally {
      hideLoading();
    }
  }, [empId, uploadCount, yyyymm, showLoading, hideLoading]);

  return (
    <>
      {mode === 'list' && (
        <GalleryListPage
          list={galleryList}
          onMoveUpload={() => setMode('upload')}
          onCancel={() => navigate('/menu', { replace: true })}
        />
      )}

      {mode === 'upload' && (
        <GalleryUpload
          disabled={!uploadPolicy.allowed}
          availableCount={!isAdmin ? uploadCount : Infinity}
          reason={uploadPolicy.reason}
          onUpload={handleUpload}
          onCancel={() => setMode('list')}
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
