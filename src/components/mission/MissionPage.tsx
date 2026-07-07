import { useEffect, useMemo, useState } from 'react';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get } from 'firebase/database';
import { ClipLoader } from 'react-spinners';
import Layout from '../layouts/Layout';
import { SmallText } from '../../styles/global/commonStyle';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { useMission, isScoreGuessMission } from '../../hooks/useMission';
import VillainMissionView from './VillainMissionView';
import ScoreGuessMissionView from './ScoreGuessMissionView';
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
} from '../../styles/mission/MissionStyle';

const MissionPage = () => {
  const goBack = useNavigateBack();

  const currentYm = useMemo(() => {
    const now = useUiStore.getState().getServerNow();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const { data, myEmpId, myVote, loading } = useMission(currentYm);
  const [activityDateNum, setActivityDateNum] = useState<number | null>(null);
  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  useEffect(() => {
    const year = currentYm.slice(0, 4);
    const month = String(Number(currentYm.slice(4)));
    Promise.all([
      get(ref(db, `activityDate/${year}/${month}`)),
      get(ref(db, 'names')),
      get(ref(db, `activityParticipants/${year}/${month}`)),
    ])
      .then(([dateSnap, namesSnap, participantsSnap]) => {
        if (dateSnap.exists()) setActivityDateNum(dateSnap.val() as number);
        if (namesSnap.exists())
          setAllNames(namesSnap.val() as Record<string, string>);
        if (participantsSnap.exists())
          setParticipants(
            Object.keys(participantsSnap.val() as Record<string, true>),
          );
        setParticipantsLoaded(true);
      })
      .catch(() => setParticipantsLoaded(true));
  }, [currentYm]);

  const daysUntilReveal = useMemo(() => {
    if (!activityDateNum || !data?.config) return null;
    const revealDays = data.config.revealDays ?? 7;
    const n = activityDateNum;
    const revealTimestamp =
      new Date(
        Math.floor(n / 10000),
        Math.floor((n % 10000) / 100) - 1,
        n % 100,
      ).getTime() -
      revealDays * 86400000;
    return Math.ceil(
      (revealTimestamp - useUiStore.getState().getServerNow().getTime()) /
        86400000,
    );
  }, [activityDateNum, data]);

  const viewState = useMemo(() => {
    if (!data?.config || data.config.status === 'draft') return 'empty';
    const { status } = data.config;
    if (status === 'revealed') return 'revealed';
    if (status === 'voting') return 'voting';
    if (daysUntilReveal === null || daysUntilReveal > 0) return 'upcoming';
    return 'preview';
  }, [data, daysUntilReveal]);

  const isReady = !loading && participantsLoaded;
  const pageTitle = '활동 미션';

  return (
    <Layout title={pageTitle} maxWidth="480px">
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

            {viewState === 'preview' && !isScoreGuessMission(data) && (
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
                  ym={currentYm}
                  viewState={viewState}
                  data={data}
                  myEmpId={myEmpId}
                  myVote={typeof myVote === 'object' ? myVote : undefined}
                  allNames={allNames}
                  participants={participants}
                />
              ) : data ? (
                <VillainMissionView
                  ym={currentYm}
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
