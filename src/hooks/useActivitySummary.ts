import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db, auth, empIdFromEmail } from '../services/firebase';
import type { ActivityItem } from '../types/activity';

export const useActivitySummary = (ym: string) => {
  const [item, setItem] = useState<ActivityItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      const empId = empIdFromEmail(user?.email);
      if (!empId) {
        setItem(null);
        setLoading(false);
        return;
      }

      try {
        const participantSnap = await get(
          ref(db, `activityParticipants/${year}/${month}/${empId}`),
        );
        if (cancelled) return;

        if (!participantSnap.exists()) {
          setItem(null);
          setLoading(false);
          return;
        }

        const [gallerySnap, achievementsSnap, activityDateSnap] = await Promise.all([
          get(ref(db, `gallery/${ym}`)),
          get(ref(db, `users/${empId}/achievements`)),
          get(ref(db, `activityDate/${year}/${month}`)),
        ]);
        if (cancelled) return;

        let photos = 0;
        let likes = 0;
        let comments = 0;

        if (gallerySnap.exists()) {
          const gallery = gallerySnap.val() as Record<string, Record<string, unknown>>;
          for (const image of Object.values(gallery)) {
            if (image.empId !== empId) continue;
            photos++;
            if (typeof image.likes === 'number') {
              likes += image.likes;
            } else if (image.likes && typeof image.likes === 'object') {
              likes += Object.keys(image.likes as object).length;
            }
            if (image.comments && typeof image.comments === 'object') {
              for (const c of Object.values(image.comments as Record<string, Record<string, unknown>>)) {
                if (!c.deleted) comments++;
              }
            }
          }
        }

        let achievements = 0;
        if (achievementsSnap.exists()) {
          const data = achievementsSnap.val() as Record<string, { achievedAt: string }>;
          for (const entry of Object.values(data)) {
            if (entry.achievedAt === ym) achievements++;
          }
        }

        let activityDate: number;
        if (activityDateSnap.exists()) {
          const dateNum = activityDateSnap.val() as number;
          const y = Math.floor(dateNum / 10000);
          const m = Math.floor((dateNum % 10000) / 100) - 1;
          const d = dateNum % 100;
          activityDate = new Date(y, m, d).getTime();
        } else {
          activityDate = new Date(`${year}-${ym.slice(4)}-01`).getTime();
        }

        setItem({
          id: `activity_${ym}`,
          type: 'activity',
          date: activityDate,
          title: '이번 달 활동 요약',
          description: `사진 ${photos} · 좋아요 ${likes} · 댓글 ${comments} · 업적 ${achievements}`,
          stats: { photos, likes, comments, achievements },
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setItem(null);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [ym]);

  return { item, loading };
};
