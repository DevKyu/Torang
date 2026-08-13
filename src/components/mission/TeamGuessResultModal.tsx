import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useBackClose } from '../../hooks/useBackClose';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';
import type { FormationGroup } from '../../utils/teamFormation';
import TeamGuessRosterCard, { type GroupScores } from './TeamGuessRosterCard';
import {
  Backdrop,
  Card,
  Header,
  Title,
  Sub,
  Divider,
  ScrollArea,
  Empty,
  TabRow,
  TabBtn,
  PickResultRow,
  PickResultLabel,
  PickResultValue,
  CloseBtn,
} from '../../styles/mission/TeamGuessResultModalStyle';

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 18 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -18 }),
};

export type TeamGuessResultSection = {
  groupId: string;
  group: FormationGroup;
  winner?: 'team1' | 'team2' | 'draw';
  myPick?: 'team1' | 'team2' | 'draw';
  pickLabel: string;
  correct: boolean;
  tone: 'mine' | 'bonus';
  scores?: GroupScores;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  myEmpId: string;
  sections: TeamGuessResultSection[];
  rivalIds?: Set<string>;
};

const TeamGuessResultModal = ({ isOpen, onClose, myEmpId, sections, rivalIds }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  useBackClose(isOpen, onClose);

  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setActiveIdx(0);
      setDirection(1);
    }
  }, [isOpen]);

  const selectTab = (idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  };

  const active = sections[Math.min(activeIdx, sections.length - 1)];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <Card
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.25 },
              y: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              layout: { duration: 0.22, ease: 'easeOut' },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>내 예측 결과</Title>
              <Sub>정기전 팀 승부 예측</Sub>
            </Header>

            {sections.length > 1 ? (
              <TabRow>
                {sections.map((section, idx) => (
                  <TabBtn
                    key={section.groupId}
                    active={activeIdx === idx}
                    tone={section.tone}
                    onClick={() => selectTab(idx)}
                  >
                    {section.tone === 'mine' ? '내 조' : '보너스 예측'} · {section.groupId}조
                  </TabBtn>
                ))}
              </TabRow>
            ) : (
              <Divider />
            )}

            <ScrollArea>
              {!active ? (
                <Empty>예측 기록이 없습니다.</Empty>
              ) : (
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={active.groupId}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TeamGuessRosterCard
                      groupLabel={`${active.groupId}조`}
                      group={active.group}
                      myEmpId={myEmpId}
                      winner={active.winner}
                      scores={active.scores}
                      rivalIds={rivalIds}
                    />
                    <PickResultRow correct={active.correct}>
                      <PickResultLabel>내 예측</PickResultLabel>
                      <PickResultValue correct={active.correct}>
                        {active.pickLabel} {active.correct ? '적중' : '실패'}
                      </PickResultValue>
                    </PickResultRow>
                  </motion.div>
                </AnimatePresence>
              )}
            </ScrollArea>
            <CloseBtn onClick={onClose}>닫기</CloseBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default TeamGuessResultModal;
