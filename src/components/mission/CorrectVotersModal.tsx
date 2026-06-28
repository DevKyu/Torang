import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useBackClose } from '../../hooks/useBackClose';
import { Check as CheckIcon } from 'lucide-react';
import {
  Backdrop,
  Card,
  Header,
  Title,
  Sub,
  Divider,
  ScrollArea,
  Row,
  CheckWrap,
  CloseBtn,
} from '../../styles/mission/CorrectVotersModalStyle';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  correctVoters: string[];
  allNames: Record<string, string>;
};

const CorrectVotersModal = ({ isOpen, onClose, correctVoters, allNames }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useBackClose(isOpen, onClose);

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
              <Title>정답 투표자 명단</Title>
              <Sub>총 {correctVoters.length}명</Sub>
            </Header>
            <Divider />
            <ScrollArea>
              {correctVoters.map((id) => (
                <Row key={id}>
                  <span>{allNames[id] ?? id}</span>
                  <CheckWrap>
                    <CheckIcon size={16} color="#10b981" strokeWidth={2.5} />
                  </CheckWrap>
                </Row>
              ))}
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

export default CorrectVotersModal;
