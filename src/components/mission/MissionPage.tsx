import { useEffect, useMemo, useState } from 'react';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get, onValue } from 'firebase/database';
import { ClipLoader } from 'react-spinners';
import Layout from '../layouts/Layout';
import ScreenLoadingState from '../shared/ScreenLoadingState';
import { SmallText } from '../../styles/global/commonStyle';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { useActivityDates } from '../../hooks/useActivityDates';
import { resolveDisplayYm } from '../../utils/date';
import {
  useMission,
  isScoreGuessMission,
  isTeamGuessMission,
  isScoreGuessVote,
  isTeamGuessVote,
} from '../../hooks/useMission';
import { useMissionViewState } from '../../hooks/useMissionViewState';
import VillainMissionView from './VillainMissionView';
import ScoreGuessMissionView from './ScoreGuessMissionView';
import TeamGuessMissionView from './TeamGuessMissionView';
import { renderMissionBody } from './missionBody';
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

const MissionPage = () => {
  const goBack = useNavigateBack();

  const { formatServerDate } = useUiStore.getState();
  const { maps: activityMaps, loading: activityLoading } = useActivityDates();
  const serverYear = Number(formatServerDate('year'));
  const serverMonth = Number(formatServerDate('month'));
  const currentYm = useMemo(() => useUiStore.getState().formatServerDate('ym'), []);
  const [ym, setYm] = useState(currentYm);
  const [ymPending, setYmPending] = useState(false);

  useEffect(() => {
    if (activityLoading) return;
    const resolved = resolveDisplayYm(activityMaps, serverYear, serverMonth);
    if (resolved === currentYm) return;
    setYmPending(true);
    setYm(resolved);
  }, [activityLoading, activityMaps, serverYear, serverMonth, currentYm]);

  useEffect(() => {
    setYmPending(false);
  }, [ym]);

  const { data, myEmpId, myVote, loading } = useMission(ym);
  const [activityDateNum, setActivityDateNum] = useState<number | null>(null);
  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  useEffect(() => {
    setParticipantsLoaded(false);
    setActivityDateNum(null);
    setParticipants([]);
    const year = ym.slice(0, 4);
    const month = String(Number(ym.slice(4)));

    get(ref(db, 'names'))
      .then((namesSnap) => {
        if (namesSnap.exists())
          setAllNames(namesSnap.val() as Record<string, string>);
      })
      .catch(() => {});

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

  const { daysUntilReveal, viewState } = useMissionViewState(
    activityDateNum,
    data,
  );

  const isReady = !activityLoading && !ymPending && !loading && participantsLoaded;
  const pageTitle = '활동 미션';

  return (
    <Layout title={pageTitle} maxWidth="480px">
      <AnimatePresence mode="wait" initial={false}>
        {!isReady ? (
          <ScreenLoadingState key="loading">
            <MissionLoadingBox>
              <ClipLoader size={24} color="#9ca3af" />
            </MissionLoadingBox>
          </ScreenLoadingState>
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
                  <UpcomingLabel>
                    이달의 미션이 {daysUntilReveal}일 후 공개됩니다.
                  </UpcomingLabel>
                </UpcomingCard>
              ) : (
                <MissionEmptyBox>
                  <MissionEmptyIcon>⏳</MissionEmptyIcon>
                  <MissionEmptyTitle>이달의 미션 준비중</MissionEmptyTitle>
                  <MissionEmptyDesc>
                    공개 시점이 정해지면 곧 알려드릴게요
                  </MissionEmptyDesc>
                </MissionEmptyBox>
              ))}

            {viewState === 'preview' &&
              !isScoreGuessMission(data) &&
              !isTeamGuessMission(data) && (
              <>
                <SectionLabel>이달의 미션</SectionLabel>
                <MissionCard>
                  {data?.config?.title && (
                    <CardTitle>{data.config.title}</CardTitle>
                  )}
                  {data?.config?.description &&
                    renderMissionBody(data.config.description)}
                </MissionCard>
              </>
            )}

            {(viewState === 'preview' ||
              viewState === 'voting' ||
              viewState === 'revealed') &&
              (isScoreGuessMission(data) ? (
                <ScoreGuessMissionView
                  ym={ym}
                  viewState={viewState}
                  data={data}
                  myEmpId={myEmpId}
                  myVote={isScoreGuessVote(myVote) ? myVote : undefined}
                  allNames={allNames}
                  participants={participants}
                  activityYmd={
                    activityDateNum ? String(activityDateNum) : undefined
                  }
                />
              ) : isTeamGuessMission(data) ? (
                <TeamGuessMissionView
                  ym={ym}
                  viewState={viewState}
                  data={data}
                  myEmpId={myEmpId}
                  myVote={isTeamGuessVote(myVote) ? myVote : undefined}
                  activityYmd={
                    activityDateNum ? String(activityDateNum) : undefined
                  }
                />
              ) : data ? (
                <VillainMissionView
                  ym={ym}
                  viewState={viewState}
                  data={data}
                  myEmpId={myEmpId}
                  myVote={typeof myVote === 'string' ? myVote : undefined}
                  allNames={allNames}
                  participants={participants}
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
  );
};

export default MissionPage;
