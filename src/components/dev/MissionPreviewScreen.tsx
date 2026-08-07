import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { ClipLoader } from 'react-spinners';
import { db, checkAdminId, waitForAuthUser } from '../../services/firebase';
import Layout from '../layouts/Layout';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { SmallText } from '../../styles/global/commonStyle';
import {
  isScoreGuessMission,
  isTeamGuessMission,
  isScoreGuessVote,
  isTeamGuessVote,
  type MissionData,
} from '../../hooks/useMission';
import { useMissionViewState } from '../../hooks/useMissionViewState';
import VillainMissionView from '../mission/VillainMissionView';
import ScoreGuessMissionView from '../mission/ScoreGuessMissionView';
import TeamGuessMissionView from '../mission/TeamGuessMissionView';
import { renderMissionBody } from '../mission/missionBody';
import {
  MissionCard,
  CardTitle,
  SectionLabel,
  UpcomingCard,
  UpcomingDays,
  UpcomingLabel,
  MissionLoadingBox,
  MissionEmptyBox,
  MissionEmptyIcon,
  MissionEmptyTitle,
  MissionEmptyDesc,
  MISSION_INFO_MIN_HEIGHT,
} from '../../styles/mission/MissionStyle';
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

  const [data, setData] = useState<MissionData | null>(null);
  const [missionLoading, setMissionLoading] = useState(true);
  const [activityDateNum, setActivityDateNum] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onValue(
      ref(db, `missions/${DEV_PREVIEW_YM}`),
      (snap) => {
        setData(snap.exists() ? (snap.val() as MissionData) : null);
        setMissionLoading(false);
      },
      () => {
        setData(null);
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

  const { daysUntilReveal, viewState } = useMissionViewState(activityDateNum, data);
  const myVote = data?.votes?.[DEV_ME];
  const isReady = !missionLoading;

  if (!adminChecked) return null;

  return (
    <>
      <DevFloatingBar>
        미션 프리뷰
        <DevFloatingLink onClick={() => navigate('/admin/mission-dev-preview')}>설정으로</DevFloatingLink>
      </DevFloatingBar>

      <Layout title="활동 미션" maxWidth="480px">
        <AnimatePresence mode="wait">
          {!isReady ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MissionLoadingBox>
                <ClipLoader size={24} color="#9ca3af" />
              </MissionLoadingBox>
            </motion.div>
          ) : (
            <motion.div
              key={viewState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              style={{
                minHeight: MISSION_INFO_MIN_HEIGHT,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {viewState === 'empty' && (
                <MissionEmptyBox>
                  <MissionEmptyIcon>🤫</MissionEmptyIcon>
                  <MissionEmptyTitle>활동 미션 준비중</MissionEmptyTitle>
                  <MissionEmptyDesc>완료되면 바로 공개될 예정이에요</MissionEmptyDesc>
                </MissionEmptyBox>
              )}

              {viewState === 'upcoming' &&
                (daysUntilReveal !== null ? (
                  <UpcomingCard>
                    <UpcomingDays>D-{daysUntilReveal}</UpcomingDays>
                    <UpcomingLabel>이달의 미션이 {daysUntilReveal}일 후 공개됩니다.</UpcomingLabel>
                  </UpcomingCard>
                ) : (
                  <MissionEmptyBox>
                    <MissionEmptyIcon>⏳</MissionEmptyIcon>
                    <MissionEmptyTitle>이달의 미션 준비중</MissionEmptyTitle>
                    <MissionEmptyDesc>공개 시점이 정해지면 곧 알려드릴게요</MissionEmptyDesc>
                  </MissionEmptyBox>
                ))}

              {viewState === 'preview' && !isScoreGuessMission(data) && !isTeamGuessMission(data) && (
                <>
                  <SectionLabel>이달의 미션</SectionLabel>
                  <MissionCard>
                    {data?.config?.title && <CardTitle>{data.config.title}</CardTitle>}
                    {data?.config?.description && renderMissionBody(data.config.description)}
                  </MissionCard>
                </>
              )}

              {(viewState === 'preview' || viewState === 'voting' || viewState === 'revealed') &&
                (isScoreGuessMission(data) ? (
                  <ScoreGuessMissionView
                    ym={DEV_PREVIEW_YM}
                    viewState={viewState}
                    data={data}
                    myEmpId={DEV_ME}
                    myVote={isScoreGuessVote(myVote) ? myVote : undefined}
                    allNames={MOCK_NAMES}
                    participants={DEV_PARTICIPANTS}
                    activityYmd={activityDateNum ? String(activityDateNum) : undefined}
                  />
                ) : isTeamGuessMission(data) ? (
                  <TeamGuessMissionView
                    ym={DEV_PREVIEW_YM}
                    viewState={viewState}
                    data={data}
                    myEmpId={DEV_ME}
                    myVote={isTeamGuessVote(myVote) ? myVote : undefined}
                    activityYmd={activityDateNum ? String(activityDateNum) : undefined}
                  />
                ) : data ? (
                  <VillainMissionView
                    ym={DEV_PREVIEW_YM}
                    viewState={viewState}
                    data={data}
                    myEmpId={DEV_ME}
                    myVote={typeof myVote === 'string' ? myVote : undefined}
                    allNames={MOCK_NAMES}
                    participants={DEV_PARTICIPANTS}
                  />
                ) : null)}
            </motion.div>
          )}
        </AnimatePresence>

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
    </>
  );
};

export default MissionPreviewScreen;
