import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../admin/AdminLayout';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import {
  DEV_PREVIEW_YM,
  seedVillainScenario,
  seedScoreGuessScenario,
  seedTeamGuessScenario,
  seedCombinedScenario,
  resetDevPreviewData,
  type VillainScenario,
  type ScoreGuessScenario,
  type TeamGuessScenario,
  type CombinedScenario,
} from './missionDevPreviewSeed';
import { TypeSelectRow, TypeSelectBtn } from '../../styles/admin/AdminScoreGuessMissionStyle';
import { FormTitle, SectionBlock, Divider, SaveRow, SaveBtn, StatusBtn } from '../../styles/admin/AdminMissionStyle';
import { SmallText } from '../../styles/global/commonStyle';
import { DevNotice } from '../../styles/dev/MissionDevPreviewStyle';

type Kind = 'villain' | 'scoreGuess' | 'teamGuess' | 'combined';

const VILLAIN_SCENARIOS: { key: VillainScenario; label: string }[] = [
  { key: 'empty', label: '준비중' },
  { key: 'upcoming', label: '공개 예정(D-day)' },
  { key: 'preview', label: '공개됨' },
  { key: 'votingOpen', label: '투표 진행중' },
  { key: 'revealed_caught', label: '결과공개 - 빌런 검거' },
  { key: 'revealed_survived_solo', label: '결과공개 - 빌런 단독 생존' },
  { key: 'revealed_survived_withHelper', label: '결과공개 - 빌런+조력자 공동수상' },
];

const SCORE_GUESS_SCENARIOS: { key: ScoreGuessScenario; label: string }[] = [
  { key: 'empty', label: '준비중' },
  { key: 'upcoming', label: '공개 예정(D-day)' },
  { key: 'notVotedOpen', label: '예측 전(일반 참여자, 후보 3명)' },
  { key: 'asCandidate', label: '내가 후보(응원 0명)' },
  { key: 'asCandidateWithCheers', label: '내가 후보(응원 5명, 메시지 다양)' },
  { key: 'votedOpen', label: '예측 완료' },
  { key: 'revealed', label: '결과공개(후보 3명)' },
];

const TEAM_GUESS_SCENARIOS: { key: TeamGuessScenario; label: string }[] = [
  { key: 'empty', label: '준비중' },
  { key: 'upcoming', label: '공개 예정(D-day)' },
  { key: 'formationPending', label: '팀편성 미확정' },
  { key: 'notVotedOpen', label: '예측 전(3개 조)' },
  { key: 'votedOpen', label: '예측 완료' },
  { key: 'revealed_bothCorrect', label: '결과공개 - 내조+보너스 모두 적중' },
  { key: 'revealed_myGroupOnly', label: '결과공개 - 내조만 적중' },
  { key: 'revealed_withDraw', label: '결과공개 - 내조 무승부 적중' },
];

const COMBINED_SCENARIOS: { key: CombinedScenario; label: string }[] = [
  { key: 'preActivity_asVillain', label: '활동 전(내가 빌런, 히든버튼)' },
  { key: 'preActivity_asHelper', label: '활동 전(내가 조력자, 히든버튼)' },
  { key: 'preActivity_asNormal', label: '활동 전(일반 참여자, 버튼 없음)' },
  { key: 'postActivity_votingNotVoted', label: '활동 후(빌런 투표중·미투표 + 예측 결과, 탭)' },
  { key: 'postActivity_votingVoted', label: '활동 후(빌런 투표중·투표완료 + 예측 결과, 탭)' },
  { key: 'postActivity_bothRevealed', label: '활동 후(빌런 결과공개 + 예측 결과, 탭)' },
];

const COMBINED_PREDICT_TYPES: { key: 'scoreGuess' | 'teamGuess'; label: string }[] = [
  { key: 'teamGuess', label: '팀 승부 예측' },
  { key: 'scoreGuess', label: '신규회원 점수 맞추기' },
];

const MissionDevPreview = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack('/admin');
  const [kind, setKind] = useState<Kind>('villain');
  const [combinedPredictType, setCombinedPredictType] = useState<'scoreGuess' | 'teamGuess'>('teamGuess');
  const [seeding, setSeeding] = useState<string | null>(null);
  const [lastApplied, setLastApplied] = useState<string | null>(null);

  const runScenario = async (run: () => Promise<void>, label: string) => {
    setSeeding(label);
    try {
      await run();
      setLastApplied(label);
      toast(`✅ "${label}" 시나리오 적용됨`, { position: 'top-center', duration: 1800 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '시나리오 적용 중 오류가 발생했습니다.', {
        position: 'top-center',
      });
    } finally {
      setSeeding(null);
    }
  };

  const handleReset = () => {
    setLastApplied(null);
    runScenario(resetDevPreviewData, '초기화');
  };

  const scenarios =
    kind === 'villain'
      ? VILLAIN_SCENARIOS
      : kind === 'scoreGuess'
        ? SCORE_GUESS_SCENARIOS
        : kind === 'teamGuess'
          ? TEAM_GUESS_SCENARIOS
          : COMBINED_SCENARIOS;

  return (
    <AdminLayout title="미션 프리뷰 설정">
      <DevNotice>
        미션 데이터는 가짜 월(<strong>{DEV_PREVIEW_YM}</strong>)에만 씁니다. 단, 결과공개 시나리오는 실제 보상
        지급 로직이 그대로 실행되어 devpreview_ 테스트 계정에 PIN·점수가 실제로 쌓이니, 테스트 후에는 아래
        &quot;전체 초기화&quot;로 함께 지워주세요.
      </DevNotice>

      <FormTitle>미션 타입</FormTitle>
      <TypeSelectRow>
        <TypeSelectBtn active={kind === 'villain'} onClick={() => setKind('villain')}>
          빌런 찾기
        </TypeSelectBtn>
        <TypeSelectBtn active={kind === 'scoreGuess'} onClick={() => setKind('scoreGuess')}>
          신규회원 점수 맞추기
        </TypeSelectBtn>
        <TypeSelectBtn active={kind === 'teamGuess'} onClick={() => setKind('teamGuess')}>
          팀 승부 예측
        </TypeSelectBtn>
        <TypeSelectBtn active={kind === 'combined'} onClick={() => setKind('combined')}>
          빌런+예측형 조합
        </TypeSelectBtn>
      </TypeSelectRow>

      {kind === 'combined' && (
        <>
          <FormTitle>예측형 타입</FormTitle>
          <TypeSelectRow>
            {COMBINED_PREDICT_TYPES.map(({ key, label }) => (
              <TypeSelectBtn
                key={key}
                active={combinedPredictType === key}
                onClick={() => setCombinedPredictType(key)}
              >
                {label}
              </TypeSelectBtn>
            ))}
          </TypeSelectRow>
        </>
      )}

      <FormTitle>시나리오</FormTitle>
      <SectionBlock>
        {scenarios.map(({ key, label }) => (
          <StatusBtn
            key={key}
            color={lastApplied === label ? '#059669' : '#3b82f6'}
            disabled={!!seeding}
            style={{ marginRight: 8, marginBottom: 8 }}
            onClick={() =>
              runScenario(
                () =>
                  kind === 'villain'
                    ? seedVillainScenario(key as VillainScenario)
                    : kind === 'scoreGuess'
                      ? seedScoreGuessScenario(key as ScoreGuessScenario)
                      : kind === 'teamGuess'
                        ? seedTeamGuessScenario(key as TeamGuessScenario)
                        : seedCombinedScenario(key as CombinedScenario, combinedPredictType),
                label,
              )
            }
          >
            {seeding === label ? '적용 중...' : lastApplied === label ? `✓ ${label}` : label}
          </StatusBtn>
        ))}
      </SectionBlock>

      <SaveRow>
        <StatusBtn color="#dc2626" disabled={!!seeding} onClick={handleReset}>
          {seeding === '초기화' ? '초기화 중...' : '전체 초기화'}
        </StatusBtn>
      </SaveRow>

      <Divider />

      <SaveRow>
        <SaveBtn onClick={() => navigate('/admin/mission-preview-screen')}>미리보기 열기 →</SaveBtn>
      </SaveRow>

      <SmallText top="middle" onClick={goBack}>
        돌아가기
      </SmallText>
    </AdminLayout>
  );
};

export default MissionDevPreview;
