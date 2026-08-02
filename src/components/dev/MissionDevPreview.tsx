import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../admin/AdminLayout';
import {
  DEV_PREVIEW_YM,
  seedVillainScenario,
  seedScoreGuessScenario,
  seedTeamGuessScenario,
  resetDevPreviewData,
  type VillainScenario,
  type ScoreGuessScenario,
  type TeamGuessScenario,
} from './missionDevPreviewSeed';
import { TypeSelectRow, TypeSelectBtn } from '../../styles/admin/AdminScoreGuessMissionStyle';
import { FormTitle, SectionBlock, Divider, SaveRow, SaveBtn, StatusBtn } from '../../styles/admin/AdminMissionStyle';
import { DevNotice } from '../../styles/dev/MissionDevPreviewStyle';

type Kind = 'villain' | 'scoreGuess' | 'teamGuess';

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
];

const MissionDevPreview = () => {
  const navigate = useNavigate();
  const [kind, setKind] = useState<Kind>('villain');
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
    kind === 'villain' ? VILLAIN_SCENARIOS : kind === 'scoreGuess' ? SCORE_GUESS_SCENARIOS : TEAM_GUESS_SCENARIOS;

  return (
    <AdminLayout title="미션 프리뷰 설정">
      <DevNotice>
        이 화면은 가짜 월(<strong>{DEV_PREVIEW_YM}</strong>)에만 데이터를 씁니다. 실제 운영 데이터에는 영향이
        없습니다. 시나리오를 적용한 뒤 &quot;미리보기 열기&quot;를 누르면 실제 유저가 보는 것과 동일한 화면으로
        확인할 수 있습니다.
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
      </TypeSelectRow>

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
                      : seedTeamGuessScenario(key as TeamGuessScenario),
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
    </AdminLayout>
  );
};

export default MissionDevPreview;
