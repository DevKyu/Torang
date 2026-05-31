import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import {
  Avatar,
  CloseBtn,
  Dim,
  Header,
  Item,
  List,
  Name,
  Sheet,
  Title,
  Wrapper,
} from '../../styles/likeSheetStyle';
import { getCachedUserName } from '../../services/firebase';
import { getAvatarColor, getInitial } from '../../utils/avatar';

type Props = {
  open: boolean;
  onClose: () => void;
  users: string[];
  myId?: string;
};

export const LikeSheet = ({ open, onClose, users, myId }: Props) => {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a === myId) return -1;
      if (b === myId) return 1;
      return 0;
    });
  }, [users, myId]);

  return (
    <AnimatePresence>
      {open && (
        <Wrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22 } }}
        >
          <Dim onClick={onClose} />

          <Sheet
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Header>
              <Title>
                <Heart size={14} fill="#ff6b6b" stroke="#ff6b6b" />
                <span>좋아요 {users.length}</span>
              </Title>
              <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
            </Header>
            <List>
              {sortedUsers.length === 0 ? (
                <Item>
                  <Name style={{ color: '#999' }}>아직 좋아요가 없어요</Name>
                </Item>
              ) : (
                sortedUsers.map((id) => {
                  const name = id === myId ? '나' : getCachedUserName(id);
                  const bg = getAvatarColor(name);

                  return (
                    <Item key={id}>
                      <Avatar bg={bg}>{getInitial(name)}</Avatar>
                      <Name>{name}</Name>
                    </Item>
                  );
                })
              )}
            </List>
          </Sheet>
        </Wrapper>
      )}
    </AnimatePresence>
  );
};
