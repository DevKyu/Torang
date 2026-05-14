import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import type { MissionRoles } from '../../hooks/useMission';
import {
  Backdrop,
  Card,
  Header,
  Title,
  Sub,
  Divider,
  ScrollArea,
  Row,
  Name,
  RoleTag,
  BarWrap,
  Bar,
  Count,
  Empty,
  CloseBtn,
} from '../../styles/VoteResultModalStyle';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  votes: Record<string, string>;
  roles: MissionRoles;
  allNames: Record<string, string>;
};

const VoteResultModal = ({ isOpen, onClose, votes, roles, allNames }: Props) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const voteCounts: Record<string, number> = {};
  for (const target of Object.values(votes)) {
    voteCounts[target] = (voteCounts[target] ?? 0) + 1;
  }

  const totalVotes = Object.keys(votes).length;
  const sorted = Object.entries(voteCounts).sort(([, a], [, b]) => b - a);
  const maxVotes = sorted[0]?.[1] ?? 1;

  const roleOf = (empId: string) =>
    empId === roles.villain ? 'villain' : empId === roles.helper ? 'helper' : null;

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
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>투표 현황</Title>
              <Sub>총 {totalVotes}명 참여</Sub>
            </Header>
            <Divider />
            <ScrollArea>
              {sorted.length === 0 ? (
                <Empty>투표 기록이 없습니다.</Empty>
              ) : sorted.map(([empId, count]) => {
                const role = roleOf(empId);
                return (
                  <Row key={empId} role={role ?? undefined}>
                    <Name role={role ?? undefined}>
                      {allNames[empId] ?? empId}
                      {role === 'villain' && <RoleTag color="#ef4444">빌런</RoleTag>}
                      {role === 'helper' && <RoleTag color="#3b82f6">조력자</RoleTag>}
                    </Name>
                    <BarWrap>
                      <Bar
                        pct={Math.round((count / maxVotes) * 100)}
                        color={
                          role === 'villain' ? '#ef4444'
                          : role === 'helper' ? '#3b82f6'
                          : '#9ca3af'
                        }
                      />
                    </BarWrap>
                    <Count>{count}표</Count>
                  </Row>
                );
              })}
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

export default VoteResultModal;
