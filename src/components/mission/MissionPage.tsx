import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { ref, onValue } from 'firebase/database';
import Layout from '../layouts/Layout';
import { SmallText } from '../../styles/global/commonStyle';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { useActivityDates } from '../../hooks/useActivityDates';
import { useAllNames } from '../../hooks/useAllNames';
import { resolveDisplayYm } from '../../utils/date';
import { useMission } from '../../hooks/useMission';
import MissionContentView from './MissionContentView';

const MissionPage = () => {
  const goBack = useNavigateBack();

  const { formatServerDate } = useUiStore.getState();
  const { maps: activityMaps, loading: activityLoading } = useActivityDates();
  const serverYear = Number(formatServerDate('year'));
  const serverMonth = Number(formatServerDate('month'));
  const currentYm = useMemo(() => useUiStore.getState().formatServerDate('ym'), []);
  const [ym, setYm] = useState(currentYm);
  const [ymPending, setYmPending] = useState(false);
  const ymRef = useRef(ym);
  useEffect(() => {
    ymRef.current = ym;
  }, [ym]);

  useEffect(() => {
    if (activityLoading) return;
    const resolved = resolveDisplayYm(activityMaps, serverYear, serverMonth);
    if (resolved === ymRef.current) return;
    setYmPending(true);
    setYm(resolved);
  }, [activityLoading, activityMaps, serverYear, serverMonth]);

  useEffect(() => {
    setYmPending(false);
  }, [ym]);

  const { villain, predict, predictType, myEmpId, myVillainVote, myPredictVote, loading } =
    useMission(ym);
  const [activityDateNum, setActivityDateNum] = useState<number | null>(null);
  const { allNames } = useAllNames();
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  useEffect(() => {
    setParticipantsLoaded(false);
    setActivityDateNum(null);
    setParticipants([]);
    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));

    const resolved = { date: false, participants: false };
    const tryFinish = () => {
      if (resolved.date && resolved.participants) setParticipantsLoaded(true);
    };

    const unsubDate = onValue(
      ref(db, `activityDate/${year}/${month}`),
      (snap) => {
        setActivityDateNum(snap.exists() ? (snap.val() as number) : null);
        resolved.date = true;
        tryFinish();
      },
      () => {
        resolved.date = true;
        tryFinish();
      },
    );

    const unsubParticipants = onValue(
      ref(db, `activityParticipants/${year}/${month}`),
      (snap) => {
        setParticipants(
          snap.exists() ? Object.keys(snap.val() as Record<string, true>) : [],
        );
        resolved.participants = true;
        tryFinish();
      },
      () => {
        resolved.participants = true;
        tryFinish();
      },
    );

    return () => {
      unsubDate();
      unsubParticipants();
    };
  }, [ym]);

  const isReady = !activityLoading && !ymPending && !loading && participantsLoaded;

  return (
    <Layout title="활동 미션" maxWidth="480px">
      <MissionContentView
        ym={ym}
        villain={villain}
        predict={predict}
        predictType={predictType}
        myEmpId={myEmpId}
        myVillainVote={myVillainVote}
        myPredictVote={myPredictVote}
        allNames={allNames}
        participants={participants}
        activityYmd={activityDateNum ? String(activityDateNum) : undefined}
        isReady={isReady}
      />

      <SmallText
        top="middle"
        onClick={() => {
          if (!isReady) return;
          goBack();
        }}
      >
        돌아가기
      </SmallText>
    </Layout>
  );
};

export default MissionPage;
