import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import {
  fetchMessageReadStatus,
  type AdminMessage,
  type ReadStatusEntry,
} from '../../hooks/useMessages';
import {
  Backdrop,
  Card,
  Header,
  ModalTitle,
  Summary,
  Divider,
  List,
  ListContent,
  Row,
  Name,
  ReadTag,
  EmptyMsg,
  LoadingRow,
  Footer,
  CloseBtn,
} from '../../styles/MessageReadStatusModalStyle';

type Props = {
  isOpen: boolean;
  message: AdminMessage | null;
  allNames: Record<string, string>;
  namesLoaded: boolean;
  onClose: () => void;
};

const MessageReadStatusModal = ({
  isOpen,
  message,
  allNames,
  namesLoaded,
  onClose,
}: Props) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [entries, setEntries] = useState<ReadStatusEntry[]>([]);
  const [loading, setLoading] = useState(false);

  if (message && message !== displayMessage) {
    setDisplayMessage(message);
    setEntries([]);
    setLoading(true);
  }

  useEffect(() => {
    if (!isOpen || !displayMessage || !namesLoaded) return;
    setLoading(true);
    fetchMessageReadStatus(displayMessage, allNames)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [isOpen, displayMessage, namesLoaded, allNames]);

  if (!displayMessage) return null;

  const isLoading = loading || !namesLoaded;
  const readCount = entries.filter((e) => e.read).length;

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
              <ModalTitle>{displayMessage.title}</ModalTitle>
              <Summary>
                {isLoading
                  ? '확인 중...'
                  : `${readCount} / ${entries.length}명 읽음`}
              </Summary>
            </Header>
            <Divider />
            <List>
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <ListContent
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LoadingRow>
                      <ClipLoader size={24} color="#9ca3af" />
                    </LoadingRow>
                  </ListContent>
                ) : entries.length === 0 ? (
                  <ListContent
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <EmptyMsg>대상자가 없습니다.</EmptyMsg>
                  </ListContent>
                ) : (
                  <ListContent
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {entries.map((e) => (
                      <Row key={e.empId}>
                        <Name>{e.name}</Name>
                        <ReadTag read={e.read}>
                          {e.read ? '읽음' : '안읽음'}
                        </ReadTag>
                      </Row>
                    ))}
                  </ListContent>
                )}
              </AnimatePresence>
            </List>
            <Footer>
              <CloseBtn onClick={onClose}>닫기</CloseBtn>
            </Footer>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MessageReadStatusModal;
