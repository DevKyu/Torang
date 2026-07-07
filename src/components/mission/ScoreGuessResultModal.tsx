import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useBackClose } from '../../hooks/useBackClose';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';
import {
  Backdrop,
  Card,
  Header,
  Title,
  Sub,
  Divider,
  ScrollArea,
  Empty,
  GroupHeader,
  GroupHeaderName,
  GroupHeaderScore,
  Row,
  NameWrap,
  Name,
  MyTag,
  ScoreCell,
  CheckWrap,
  CloseBtn,
} from '../../styles/mission/ScoreGuessResultModalStyle';

type ScoreGuessVoterEntry = {
  empId: string;
  name: string;
  predictedScore: number;
  correct: boolean;
  isMine: boolean;
};

export type ScoreGuessResultSection = {
  targetEmpId: string;
  targetName: string;
  actualScore?: number;
  voters: ScoreGuessVoterEntry[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sections: ScoreGuessResultSection[];
};

const ScoreGuessResultModal = ({ isOpen, onClose, sections }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  useBackClose(isOpen, onClose);

  const isSingle = sections.length === 1;
  const totalVoters = sections.reduce((sum, s) => sum + s.voters.length, 0);

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>
                {isSingle ? `${sections[0].targetName}님 예측` : '전체 예측 결과'}
              </Title>
              <Sub>총 {totalVoters}명 예측</Sub>
            </Header>
            <Divider />
            <ScrollArea>
              {sections.length === 0 ? (
                <Empty>확정된 후보가 없습니다.</Empty>
              ) : (
                sections.map((section) => (
                  <div key={section.targetEmpId}>
                    {!isSingle && (
                      <GroupHeader>
                        <GroupHeaderName>{section.targetName}</GroupHeaderName>
                        <GroupHeaderScore>실제 {section.actualScore ?? '-'}점</GroupHeaderScore>
                      </GroupHeader>
                    )}
                    {section.voters.length === 0 ? (
                      <Empty>예측한 사람이 없습니다.</Empty>
                    ) : (
                      section.voters.map((voter) => (
                        <Row key={voter.empId} correct={voter.correct}>
                          <NameWrap>
                            <Name>{voter.name}</Name>
                            {voter.isMine && <MyTag>내 예측</MyTag>}
                          </NameWrap>
                          <ScoreCell>{voter.predictedScore}점</ScoreCell>
                          <CheckWrap>
                            {voter.correct && (
                              <Check size={16} color="#059669" strokeWidth={2.5} />
                            )}
                          </CheckWrap>
                        </Row>
                      ))
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
            <Divider />
            <CloseBtn onClick={onClose}>닫기</CloseBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ScoreGuessResultModal;
