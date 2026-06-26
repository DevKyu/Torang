import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import {
  MESSAGE_REACTION_EMOJI_MAP,
  useMessageReadStatus,
  type AdminMessage,
} from '../../hooks/useMessages';
import {
  Backdrop,
  Card,
  Header,
  ModalTitle,
  Summary,
  ReactionSummary,
  Divider,
  List,
  ListContent,
  Row,
  Name,
  ReactionEmoji,
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
  if (message && message !== displayMessage) {
    setDisplayMessage(message);
  }

  const {
    entries,
    reactionCounts,
    loading: isLoading,
  } = useMessageReadStatus(isOpen, displayMessage, allNames, namesLoaded);

  if (!displayMessage) return null;
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
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
              <AnimatePresence initial={false}>
                {!isLoading && reactionCounts.length > 0 && (
                  <motion.div
                    key="reaction-summary"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <ReactionSummary>
                      {reactionCounts.map(({ key, emoji, count }) => (
                        <span key={key}>
                          {emoji} {count}
                        </span>
                      ))}
                    </ReactionSummary>
                  </motion.div>
                )}
              </AnimatePresence>
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
                        {e.reaction && MESSAGE_REACTION_EMOJI_MAP[e.reaction] && (
                          <ReactionEmoji>
                            {MESSAGE_REACTION_EMOJI_MAP[e.reaction]}
                          </ReactionEmoji>
                        )}
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
