import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db, checkAdminId, waitForAuthUser } from '../../services/firebase';
import Layout from '../layouts/Layout';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { SmallText } from '../../styles/global/commonStyle';
import { parseMissionSnapshot, isScoreGuessVote, isTeamGuessVote } from '../../hooks/useMission';
import type { RawMissionSnapshot } from '../../hooks/useMission';
import MissionContentView from '../mission/MissionContentView';
import {
  DEV_PREVIEW_YM,
  DEV_YEAR,
  DEV_MONTH,
  DEV_ME,
  MOCK_NAMES,
  DEV_PARTICIPANTS,
} from './missionDevPreviewSeed';
import { DevFloatingBar, DevFloatingLink } from '../../styles/dev/MissionDevPreviewStyle';

const MissionPreviewScreen = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack('/menu');
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    waitForAuthUser()
      .then(() => checkAdminId())
      .then((ok) => {
        if (cancelled) return;
        if (!ok) navigate('/menu', { replace: true });
        else setAdminChecked(true);
      })
      .catch(() => {
        if (!cancelled) navigate('/menu', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const [parsed, setParsed] = useState(parseMissionSnapshot(null));
  const [missionLoading, setMissionLoading] = useState(true);
  const [activityDateNum, setActivityDateNum] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onValue(
      ref(db, `missions/${DEV_PREVIEW_YM}`),
      (snap) => {
        setParsed(parseMissionSnapshot(snap.exists() ? (snap.val() as RawMissionSnapshot) : null));
        setMissionLoading(false);
      },
      () => {
        setParsed(parseMissionSnapshot(null));
        setMissionLoading(false);
      },
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onValue(
      ref(db, `activityDate/${DEV_YEAR}/${DEV_MONTH}`),
      (snap) => {
        setActivityDateNum(snap.exists() ? (snap.val() as number) : null);
      },
      () => {
        setActivityDateNum(null);
      },
    );
    return unsub;
  }, []);

  const myVillainVote =
    parsed.villain?.votes && typeof parsed.villain.votes[DEV_ME] === 'string'
      ? parsed.villain.votes[DEV_ME]
      : undefined;
  const rawPredictVote = parsed.predict?.votes?.[DEV_ME];
  const myPredictVote =
    isScoreGuessVote(rawPredictVote) || isTeamGuessVote(rawPredictVote) ? rawPredictVote : undefined;

  if (!adminChecked) return null;

  return (
    <>
      <DevFloatingBar>
        미션 프리뷰
        <DevFloatingLink onClick={() => navigate('/admin/mission-dev-preview')}>설정으로</DevFloatingLink>
      </DevFloatingBar>

      <Layout title="활동 미션" maxWidth="480px">
        <MissionContentView
          ym={DEV_PREVIEW_YM}
          villain={parsed.villain}
          predict={parsed.predict}
          predictType={parsed.predictType}
          myEmpId={DEV_ME}
          myVillainVote={myVillainVote}
          myPredictVote={myPredictVote}
          allNames={MOCK_NAMES}
          participants={DEV_PARTICIPANTS}
          activityYmd={activityDateNum ? String(activityDateNum) : undefined}
          isReady={!missionLoading}
        />

        <SmallText
          top="middle"
          onClick={() => {
            if (missionLoading) return;
            goBack();
          }}
        >
          돌아가기
        </SmallText>
      </Layout>
    </>
  );
};

export default MissionPreviewScreen;
