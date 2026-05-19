import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import type { HiddenContent } from '../../hooks/useMission';
import { HtmlBody, PlainBody } from '../../styles/MissionStyle';
import {
  Backdrop,
  Card,
  RoleTag,
  MissionTitle,
  Divider,
  ContentArea,
  ConfirmBtn,
} from '../../styles/HiddenMissionModalStyle';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  hidden: HiddenContent;
};

const VILLAIN_COLOR = '#ef4444';

const VillainMissionModal = ({ isOpen, onClose, hidden }: Props) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <RoleTag color={VILLAIN_COLOR}>또랑 빌런 미션</RoleTag>
            <MissionTitle>{hidden.revealTitle || '또랑 빌런 미션 공개'}</MissionTitle>
            <Divider />
            <ContentArea color={VILLAIN_COLOR}>
              {hidden.description.includes('<')
                ? <HtmlBody dangerouslySetInnerHTML={{ __html: hidden.description }} />
                : <PlainBody>{hidden.description}</PlainBody>
              }
            </ContentArea>
            <ConfirmBtn color="#9ca3af" onClick={onClose}>
              닫기
            </ConfirmBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default VillainMissionModal;
