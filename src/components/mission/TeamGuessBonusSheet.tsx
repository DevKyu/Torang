import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useBackClose } from '../../hooks/useBackClose';
import { calcGroupDiff, diffLevel, type FormationGroup } from '../../utils/teamFormation';
import {
  Wrapper,
  Dim,
  Sheet,
  Header,
  CloseBtn,
  Body,
  Hint,
  CandidateList,
  Footer,
  ClearBtn,
  ConfirmBtn,
} from '../../styles/mission/TeamGuessBonusSheetStyle';
import {
  BonusCandidateRow,
  BonusCandidateTitle,
  BonusCandidateLeft,
  DiffChip,
  BonusCandidateCheck,
  BonusPickPanel,
  BonusPickVersusBlock,
  BonusPickTeamLine,
  BonusPickTeamTag,
  BonusPickPlayers,
  PickRow,
  PickBtn,
} from '../../styles/mission/TeamGuessMissionStyle';

type Pick = 'team1' | 'team2' | 'draw';

type Candidate = { groupId: string; group: FormationGroup };

type Props = {
  open: boolean;
  onClose: () => void;
  candidates: Candidate[];
  confirmedGroupId: string;
  confirmedPick: Pick | '';
  onConfirm: (groupId: string, pick: Pick) => void;
  onClear: () => void;
};

const TeamGuessBonusSheet = ({
  open,
  onClose,
  candidates,
  confirmedGroupId,
  confirmedPick,
  onConfirm,
  onClear,
}: Props) => {
  useBackClose(open, onClose);

  const [draftGroupId, setDraftGroupId] = useState('');
  const [draftPick, setDraftPick] = useState<Pick | ''>('');

  useEffect(() => {
    if (!open) return;
    setDraftGroupId(confirmedGroupId);
    setDraftPick(confirmedPick);
  }, [open, confirmedGroupId, confirmedPick]);

  const selectGroup = (groupId: string) => {
    setDraftGroupId((prev) => (prev === groupId ? '' : groupId));
    setDraftPick('');
  };

  return (
    <AnimatePresence>
      {open && (
        <Wrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.22 } }}>
          <Dim onClick={onClose} />
          <Sheet
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Header>
              <span>보너스 픽 선택</span>
              <CloseBtn onClick={onClose}>
                <X size={18} />
              </CloseBtn>
            </Header>
            <Body>
              <Hint>다른 조 승부도 하나 골라보세요. 틀려도 감점 없어요.</Hint>
              <CandidateList>
                {candidates.map(({ groupId, group }) => {
                  const checked = draftGroupId === groupId;
                  const diff = Math.round(calcGroupDiff(group));
                  return (
                    <div key={groupId}>
                      <BonusCandidateRow onClick={() => selectGroup(groupId)}>
                        <BonusCandidateLeft>
                          <BonusCandidateTitle>{groupId}조</BonusCandidateTitle>
                          <DiffChip level={diffLevel(diff)}>전력차 {diff}점</DiffChip>
                        </BonusCandidateLeft>
                        <BonusCandidateCheck checked={checked}>{checked ? '✓' : ''}</BonusCandidateCheck>
                      </BonusCandidateRow>
                      {checked && (
                        <BonusPickPanel>
                          <BonusPickVersusBlock>
                            {(['team1', 'team2'] as const).map((teamKey) => (
                              <BonusPickTeamLine key={teamKey}>
                                <BonusPickTeamTag team={teamKey}>
                                  {teamKey === 'team1' ? '1팀' : '2팀'}
                                </BonusPickTeamTag>
                                <BonusPickPlayers>
                                  {group[teamKey]
                                    .map((p) => `${p.name} ${Math.round(p.average)}`)
                                    .join(' · ')}
                                </BonusPickPlayers>
                              </BonusPickTeamLine>
                            ))}
                          </BonusPickVersusBlock>
                          <PickRow compact>
                            <PickBtn selected={draftPick === 'team1'} onClick={() => setDraftPick('team1')}>
                              1팀 승
                            </PickBtn>
                            <PickBtn selected={draftPick === 'draw'} onClick={() => setDraftPick('draw')}>
                              무승부
                            </PickBtn>
                            <PickBtn selected={draftPick === 'team2'} onClick={() => setDraftPick('team2')}>
                              2팀 승
                            </PickBtn>
                          </PickRow>
                        </BonusPickPanel>
                      )}
                    </div>
                  );
                })}
              </CandidateList>
            </Body>
            <Footer>
              <ClearBtn
                onClick={() => {
                  onClear();
                  onClose();
                }}
              >
                선택 안 함
              </ClearBtn>
              <ConfirmBtn
                disabled={!draftGroupId || !draftPick}
                onClick={() => {
                  if (!draftGroupId || !draftPick) return;
                  onConfirm(draftGroupId, draftPick);
                  onClose();
                }}
              >
                선택 완료
              </ConfirmBtn>
            </Footer>
          </Sheet>
        </Wrapper>
      )}
    </AnimatePresence>
  );
};

export default TeamGuessBonusSheet;
