import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useBackClose } from '../../hooks/useBackClose';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';
import type { ChecklistItem } from '../../hooks/useMonthlyChecklist';
import {
  Backdrop,
  Card,
  Title,
  Subtitle,
  Divider,
  ItemList,
  ItemRow,
  ItemIcon,
  ItemContent,
  ItemHeaderRow,
  ItemLabel,
  ItemDesc,
  DoneTag,
  GoBtn,
  ConfirmBtn,
} from '../../styles/shared/checklistPopupStyle';

const ACCENT = '#f97316';

type Props = {
  isOpen: boolean;
  items: ChecklistItem[];
  onClose: () => void;
};

const ChecklistPopupModal = ({ isOpen, items, onClose }: Props) => {
  const navigate = useNavigate();
  const allDone = items.length > 0 && items.every((item) => item.done);

  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  useBackClose(isOpen, onClose);

  const handleGo = (path: string) => {
    const backClosed = new Promise<void>((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('popstate', finish);
        resolve();
      };
      window.addEventListener('popstate', finish);
      setTimeout(finish, 500);
    });
    const exitAnimationDone = new Promise<void>((resolve) =>
      setTimeout(resolve, 260),
    );

    onClose();

    Promise.all([backClosed, exitAnimationDone]).then(() => navigate(path));
  };

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
            accent={ACCENT}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Title>{allDone ? '🎉 이달의 체크리스트' : '📋 이달의 체크리스트'}</Title>
            <Subtitle>
              {allDone
                ? '이번 달 활동 준비를 모두 마쳤어요'
                : '이번 달 활동 준비가 아직 안 끝났어요'}
            </Subtitle>
            <Divider />
            <ItemList>
              {items.map((item) => (
                <ItemRow key={item.key}>
                  <ItemIcon>{item.emoji}</ItemIcon>
                  <ItemContent>
                    <ItemHeaderRow>
                      <ItemLabel>{item.label}</ItemLabel>
                      {item.done ? (
                        <DoneTag>
                          <Check size={12} strokeWidth={3} />
                          완료
                        </DoneTag>
                      ) : (
                        <GoBtn
                          type="button"
                          onClick={() => handleGo(item.path)}
                        >
                          {item.actionLabel}
                        </GoBtn>
                      )}
                    </ItemHeaderRow>
                    <ItemDesc>{item.description}</ItemDesc>
                  </ItemContent>
                </ItemRow>
              ))}
            </ItemList>
            <ConfirmBtn color={ACCENT} onClick={onClose}>
              확인
            </ConfirmBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default ChecklistPopupModal;
