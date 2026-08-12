import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import ScreenLoadingState from '../shared/ScreenLoadingState';
import { useMissionViewState } from '../../hooks/useMissionViewState';
import { useTeamFormation } from '../../hooks/useTeamFormation';
import { useRivalEmpIds } from '../../hooks/useRivalEmpIds';
import VillainMissionView from './VillainMissionView';
import ScoreGuessMissionView from './ScoreGuessMissionView';
import TeamGuessMissionView from './TeamGuessMissionView';
import { renderMissionBody } from './missionBody';
import { findGroupIndexForEmpId } from '../../utils/teamFormation';
import type {
  VillainMissionData,
  ScoreGuessMissionData,
  TeamGuessMissionData,
  ScoreGuessVote,
  TeamGuessVote,
} from '../../hooks/useMission';
import { isScoreGuessVote, isTeamGuessVote } from '../../hooks/useMission';
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
  TabBar,
  TabBtn,
} from '../../styles/mission/MissionStyle';

const MissionPanel = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.25 }}
    style={{ minHeight: MISSION_INFO_MIN_HEIGHT }}
  >
    {children}
  </motion.div>
);

type Props = {
  ym: string;
  villain: VillainMissionData | null;
  predict: ScoreGuessMissionData | TeamGuessMissionData | null;
  predictType: 'scoreGuess' | 'teamGuess' | null;
  myEmpId: string;
  myVillainVote?: string;
  myPredictVote?: ScoreGuessVote | TeamGuessVote;
  allNames: Record<string, string>;
  participants: string[];
  activityYmd?: string;
  isReady: boolean;
};

const MissionContentView = ({
  ym,
  villain,
  predict,
  predictType,
  myEmpId,
  myVillainVote,
  myPredictVote,
  allNames,
  participants,
  activityYmd,
  isReady,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'villain' | 'predict'>('villain');

  const villainAutoOpenGuardRef = useRef(false);
  useEffect(() => {
    villainAutoOpenGuardRef.current = false;
  }, [ym]);

  const { daysUntilReveal: villainDaysUntilReveal, viewState: villainViewState } =
    useMissionViewState(activityYmd, villain);
  const { daysUntilReveal: predictDaysUntilReveal, viewState: predictViewState } =
    useMissionViewState(activityYmd, predict);

  const teamFormationYm =
    predictType === 'teamGuess' && predictViewState !== 'empty' && predictViewState !== 'upcoming' ? ym : '';
  const {
    status: formationStatus,
    groups: formationGroups,
    winnerMap: formationWinnerMap,
    scoreMap: formationScoreMap,
    loading: formationLoading,
  } = useTeamFormation(teamFormationYm);
  const { rivalIds, loading: rivalsLoading } = useRivalEmpIds(teamFormationYm);

  const hasVillain = !!villain;
  const hasPredict = !!predict;
  const postMode =
    (hasVillain && villainViewState !== 'empty' && villainViewState !== 'upcoming' && villainViewState !== 'preview') ||
    (hasPredict && predictViewState !== 'empty' && predictViewState !== 'upcoming' && predictViewState !== 'preview');

  const renderEmptyOrUpcoming = (viewState: 'empty' | 'upcoming', daysUntilReveal: number | null) =>
    viewState === 'empty' ? (
      <MissionEmptyBox>
        <MissionEmptyIcon>🤫</MissionEmptyIcon>
        <MissionEmptyTitle>활동 미션 준비중</MissionEmptyTitle>
        <MissionEmptyDesc>완료되면 바로 공개될 예정이에요</MissionEmptyDesc>
      </MissionEmptyBox>
    ) : daysUntilReveal !== null ? (
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
    );

  const renderVillainTab = () => {
    if (villainViewState === 'empty' || villainViewState === 'upcoming') {
      return renderEmptyOrUpcoming(villainViewState, villainDaysUntilReveal);
    }
    if (villainViewState === 'preview') {
      return (
        <>
          <SectionLabel>이달의 미션</SectionLabel>
          <MissionCard>
            {villain?.config?.title && <CardTitle>{villain.config.title}</CardTitle>}
            {villain?.config?.description && renderMissionBody(villain.config.description)}
          </MissionCard>
          <VillainMissionView
            ym={ym}
            viewState="preview"
            data={villain!}
            myEmpId={myEmpId}
            myVote={myVillainVote}
            allNames={allNames}
            participants={participants}
            autoOpenGuardRef={villainAutoOpenGuardRef}
          />
        </>
      );
    }
    return (
      <VillainMissionView
        ym={ym}
        viewState={villainViewState as 'voting' | 'revealed'}
        data={villain!}
        myEmpId={myEmpId}
        myVote={myVillainVote}
        allNames={allNames}
        participants={participants}
      />
    );
  };

  const renderPredictTab = (allowHiddenTrigger = false) => {
    if (predictViewState === 'empty' || predictViewState === 'upcoming') {
      return renderEmptyOrUpcoming(predictViewState, predictDaysUntilReveal);
    }
    const hiddenMissionData =
      allowHiddenTrigger && hasVillain && villainViewState === 'preview' ? villain! : undefined;
    if (predictType === 'scoreGuess') {
      return (
        <ScoreGuessMissionView
          ym={ym}
          viewState={predictViewState as 'preview' | 'voting' | 'revealed'}
          data={predict as ScoreGuessMissionData}
          myEmpId={myEmpId}
          myVote={isScoreGuessVote(myPredictVote) ? myPredictVote : undefined}
          allNames={allNames}
          participants={participants}
          activityYmd={activityYmd}
          hiddenMissionData={hiddenMissionData}
          hiddenMissionAutoOpenGuardRef={villainAutoOpenGuardRef}
        />
      );
    }
    return (
      <TeamGuessMissionView
        ym={ym}
        viewState={predictViewState as 'preview' | 'voting' | 'revealed'}
        data={predict as TeamGuessMissionData}
        myEmpId={myEmpId}
        myVote={isTeamGuessVote(myPredictVote) ? myPredictVote : undefined}
        activityYmd={activityYmd}
        hiddenMissionData={hiddenMissionData}
        hiddenMissionAutoOpenGuardRef={villainAutoOpenGuardRef}
        status={formationStatus}
        groups={formationGroups}
        winnerMap={formationWinnerMap}
        scoreMap={formationScoreMap}
        formationLoading={formationLoading}
        rivalIds={rivalIds}
        rivalsLoading={rivalsLoading}
      />
    );
  };

  const isVillainEmpty = !hasVillain || villainViewState === 'empty';
  const isPredictEmpty = !hasPredict || predictViewState === 'empty';

  const predictAccessible =
    predictType === 'scoreGuess'
      ? participants.includes(myEmpId)
      : predictType === 'teamGuess'
        ? formationStatus === 'confirmed' && findGroupIndexForEmpId(formationGroups, myEmpId) !== -1
        : true;

  const villainMergedIntoPredict =
    hasVillain &&
    villainViewState === 'preview' &&
    predictViewState !== 'empty' &&
    predictViewState !== 'upcoming' &&
    predictAccessible;

  const villainMergeUndetermined =
    hasVillain && villainViewState === 'preview' && teamFormationYm !== '' && formationLoading;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isReady ? (
        <ScreenLoadingState key="loading">
          <MissionLoadingBox>
            <ClipLoader size={24} color="#9ca3af" />
          </MissionLoadingBox>
        </ScreenLoadingState>
      ) : isVillainEmpty && isPredictEmpty ? (
        <MissionPanel key="empty">{renderEmptyOrUpcoming('empty', null)}</MissionPanel>
      ) : postMode && hasVillain && hasPredict ? (
        <MissionPanel key="post-tabs">
          <TabBar>
            <TabBtn active={activeTab === 'villain'} onClick={() => setActiveTab('villain')}>
              빌런 찾기
            </TabBtn>
            <TabBtn active={activeTab === 'predict'} onClick={() => setActiveTab('predict')}>
              {predictType === 'scoreGuess' ? '신규회원 예측' : '팀 승부 예측'}
            </TabBtn>
          </TabBar>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'villain' ? renderVillainTab() : renderPredictTab()}
            </motion.div>
          </AnimatePresence>
        </MissionPanel>
      ) : postMode ? (
        <MissionPanel key="post-single">{hasVillain ? renderVillainTab() : renderPredictTab()}</MissionPanel>
      ) : (
        <MissionPanel key="pre">
          {!hasPredict ? (
            renderVillainTab()
          ) : villainMergeUndetermined ? (
            <MissionLoadingBox>
              <ClipLoader size={24} color="#9ca3af" />
            </MissionLoadingBox>
          ) : (
            <>
              {!isVillainEmpty && !villainMergedIntoPredict && renderVillainTab()}
              {!isPredictEmpty && renderPredictTab(villainMergedIntoPredict)}
            </>
          )}
        </MissionPanel>
      )}
    </AnimatePresence>
  );
};

export default MissionContentView;
