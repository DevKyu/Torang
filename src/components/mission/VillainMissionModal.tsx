import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useBackClose } from '../../hooks/useBackClose';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';
import type { HiddenContent } from '../../hooks/useMission';
import { HtmlBody, PlainBody } from '../../styles/mission/MissionStyle';
import {
  Backdrop,
  Card,
  RoleTag,
  MissionTitle,
  Divider,
  ContentArea,
  CloseBtn,
} from '../../styles/mission/HiddenMissionModalStyle';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  hidden: HiddenContent;
};

const VILLAIN_COLOR = '#ef4444';

const VillainMissionModal = ({ isOpen, onClose, hidden }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
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
            accent={VILLAIN_COLOR}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <RoleTag color={VILLAIN_COLOR}>또랑 히든 미션</RoleTag>
            <MissionTitle>{hidden.revealTitle || '이달의 빌런 미션 공개 🎭'}</MissionTitle>
            <Divider />
            <ContentArea color={VILLAIN_COLOR}>
              {hidden.description.includes('<')
                ? <HtmlBody dangerouslySetInnerHTML={{ __html: hidden.description }} />
                : <PlainBody>{hidden.description}</PlainBody>
              }
            </ContentArea>
            <CloseBtn onClick={onClose}>
              닫기
            </CloseBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default VillainMissionModal;
