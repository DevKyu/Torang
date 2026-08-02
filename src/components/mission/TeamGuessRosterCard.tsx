import { useState } from 'react';
import {
  calcGroupDiff,
  diffLevel,
  type FormationGroup,
  type FormationPlayer,
} from '../../utils/teamFormation';
import {
  RosterCard,
  RosterHeader,
  RosterTitle,
  RosterResultBadge,
  DiffChip,
  RosterTeamsGrid,
  RosterTeamCol,
  RosterTeamLabelRow,
  RosterTeamLabel,
  RosterTeamAvg,
  RosterPlayerRow,
  RosterPlayerNameGroup,
  RosterPlayerName,
  RosterRivalBadge,
  RosterPlayerAvg,
} from '../../styles/mission/TeamGuessMissionStyle';

const WINNER_LABEL: Record<'team1' | 'team2' | 'draw', string> = {
  team1: '1팀 승',
  team2: '2팀 승',
  draw: '무승부',
};

const gameScoreAvg = (scores: [number, number]): number =>
  scores[0] > 0 && scores[1] > 0 ? (scores[0] + scores[1]) / 2 : scores[1] || scores[0];

export type GroupScores = {
  team1: Record<string, [number, number]>;
  team2: Record<string, [number, number]>;
};

const playerEffectiveValue = (p: FormationPlayer, teamScores?: Record<string, [number, number]>) => {
  const s = teamScores?.[p.empId];
  return s && (s[0] > 0 || s[1] > 0) ? gameScoreAvg(s) : p.average;
};

const teamEffectiveAverage = (players: FormationPlayer[], teamScores?: Record<string, [number, number]>) => {
  if (players.length === 0) return 0;
  const total = players.reduce((sum, p) => sum + playerEffectiveValue(p, teamScores), 0);
  return Math.round(total / players.length);
};

type Props = {
  groupLabel: string;
  group: FormationGroup;
  myEmpId?: string;
  winner?: 'team1' | 'team2' | 'draw';
  scores?: GroupScores;
  rivalIds?: Set<string>;
};

const TeamGuessRosterCard = ({ groupLabel, group, myEmpId, winner, scores, rivalIds }: Props) => {
  const [openEmpId, setOpenEmpId] = useState<string | null>(null);
  const diff = Math.round(calcGroupDiff(group));

  return (
    <RosterCard>
      <RosterHeader>
        <RosterTitle>{groupLabel}</RosterTitle>
        {winner ? (
          <RosterResultBadge>{WINNER_LABEL[winner]}</RosterResultBadge>
        ) : (
          <DiffChip level={diffLevel(diff)}>전력차 {diff}점</DiffChip>
        )}
      </RosterHeader>
      <RosterTeamsGrid>
        {(['team1', 'team2'] as const).map((teamKey) => (
          <RosterTeamCol key={teamKey} team={teamKey}>
            <RosterTeamLabelRow>
              <RosterTeamLabel team={teamKey}>
                {teamKey === 'team1' ? '1팀' : '2팀'}
              </RosterTeamLabel>
              <RosterTeamAvg>평균 {teamEffectiveAverage(group[teamKey], scores?.[teamKey])}</RosterTeamAvg>
            </RosterTeamLabelRow>
            {[...group[teamKey]]
              .sort(
                (a, b) =>
                  playerEffectiveValue(b, scores?.[teamKey]) - playerEffectiveValue(a, scores?.[teamKey]),
              )
              .map((p) => {
                const isMe = p.empId === myEmpId;
                const gameScores = scores?.[teamKey]?.[p.empId];
                const hasGameScores = gameScores && (gameScores[0] > 0 || gameScores[1] > 0);
                const isOpen = openEmpId === p.empId;

                return (
                  <RosterPlayerRow
                    key={p.empId}
                    isMe={isMe}
                    clickable={!!hasGameScores}
                    onClick={
                      hasGameScores
                        ? () => setOpenEmpId((prev) => (prev === p.empId ? null : p.empId))
                        : undefined
                    }
                  >
                    <RosterPlayerNameGroup>
                      <RosterPlayerName isMe={isMe}>{p.name}</RosterPlayerName>
                      {rivalIds?.has(p.empId) && <RosterRivalBadge>⚔️</RosterRivalBadge>}
                    </RosterPlayerNameGroup>
                    {isOpen && hasGameScores ? (
                      <RosterPlayerAvg isMe={isMe} detail>
                        {gameScores[0] || '–'}&thinsp;·&thinsp;{gameScores[1] || '–'}
                      </RosterPlayerAvg>
                    ) : hasGameScores ? (
                      <RosterPlayerAvg isMe={isMe}>{Math.round(gameScoreAvg(gameScores))}</RosterPlayerAvg>
                    ) : (
                      <RosterPlayerAvg isMe={isMe}>{Math.round(p.average)}</RosterPlayerAvg>
                    )}
                  </RosterPlayerRow>
                );
              })}
          </RosterTeamCol>
        ))}
      </RosterTeamsGrid>
    </RosterCard>
  );
};

export default TeamGuessRosterCard;
