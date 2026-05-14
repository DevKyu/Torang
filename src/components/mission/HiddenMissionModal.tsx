import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { HiddenContent } from '../../hooks/useMission';
import { HtmlBody, PlainBody } from '../../styles/MissionStyle';
import {
  Backdrop,
  Card,
  ProgressTrack,
  ProgressFill,
  RoleTag,
  MissionTitle,
  Divider,
  ContentArea,
  ConfirmBtn,
} from '../../styles/HiddenMissionModalStyle';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  role: 'villain' | 'helper';
  hidden: HiddenContent;
};

const ROLE_LABEL = { villain: '또랑 빌런', helper: '빌런 조력자' };
const ROLE_COLOR = { villain: '#ef4444', helper: '#3b82f6' };
const COUNTDOWN_SEC = 5;

const HiddenMissionModal = ({ isOpen, onClose, role, hidden }: Props) => {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCloseRef = useRef(onClose);
  const color = ROLE_COLOR[role];

  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setProgress(100);
    const step = 100 / (COUNTDOWN_SEC * 20);

    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.max(0, p - step));
    }, 50);

    const closeTimer = setTimeout(() => {
      clearInterval(intervalRef.current!);
      onCloseRef.current();
    }, COUNTDOWN_SEC * 1000);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(closeTimer);
    };
  }, [isOpen]);

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
          transition={{ duration: 0.4 }}
          onClick={onClose}
        >
          <Card
            accent={color}
            initial={{ opacity: 0, scale: 0.82, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProgressTrack>
              <ProgressFill color={color} style={{ width: `${progress}%` }} />
            </ProgressTrack>

            <RoleTag color={color}>{ROLE_LABEL[role]}</RoleTag>
            <MissionTitle>{hidden.title}</MissionTitle>
            <Divider />
            <ContentArea color={color}>
              {hidden.description.includes('<')
                ? <HtmlBody dangerouslySetInnerHTML={{ __html: hidden.description }} />
                : <PlainBody>{hidden.description}</PlainBody>
              }
            </ContentArea>

            <ConfirmBtn color={color} onClick={onClose}>
              확인했습니다
            </ConfirmBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default HiddenMissionModal;
