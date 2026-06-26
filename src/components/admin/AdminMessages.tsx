import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';
import MissionRichEditor from './MissionRichEditor';
import MessageReadStatusModal from './MessageReadStatusModal';
import { db, getCurrentUserOrThrow, empIdFromEmail } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/commonStyle';
import {
  FormTitle,
  FieldLabel,
  SaveRow,
  SaveBtn,
  EmptyMsg,
  NameDropdown,
  NameDropdownItem,
  WinnerRow,
  WinnerBtn,
  Divider,
  SectionBlock,
  TitleInput,
  CharCount,
  TargetSearchRow,
  TargetSearchInput,
  LookupBtn,
  ChipRow,
  Chip,
  ChipRemoveBtn,
  HistoryList,
  HistoryRow,
  HistoryRowTop,
  TypeBadge,
  StatusTag,
  HistoryTitle,
  HistoryMeta,
  DangerRow,
  CancelLink,
  DeleteForeverLink,
  DisplayTimeRow,
  DisplayTimeField,
  DisplayTimeCaption,
  DisplayTimeInput,
} from '../../styles/AdminMessagesStyle';
import {
  useAdminMessages,
  sendMessage,
  cancelMessage,
  deleteMessageForever,
  getMessageDisplayStatus,
  MESSAGE_TYPE_COLOR,
  MESSAGE_TYPE_LABEL,
  type AdminMessage,
  type MessageType,
} from '../../hooks/useMessages';

const STATUS_LABEL = {
  scheduled: '예약중',
  active: '발송됨',
  popupEnded: '팝업종료',
  cancelled: '취소됨',
} as const;

const toSuccessStyle = {
  backgroundColor: '#f0fdf4',
  color: '#065f46',
  borderRadius: '10px',
  fontSize: '0.875rem',
};

type TargetUser = { empId: string; name: string };

const MAX_TITLE_LENGTH = 30;
const MAX_CONTENT_LENGTH = 600;

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '');

const formatDate = (createdAt: string) => {
  if (createdAt.length < 12) return createdAt;
  return `${createdAt.slice(0, 4)}-${createdAt.slice(4, 6)}-${createdAt.slice(6, 8)} ${createdAt.slice(8, 10)}:${createdAt.slice(10, 12)}`;
};

const formatDateFromMs = (ms: number) => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminMessages = () => {
  const goBack = useNavigateBack('/admin');
  const { messages } = useAdminMessages();

  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [namesLoaded, setNamesLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetMode, setTargetMode] = useState<MessageType>('all');
  const [targetSearch, setTargetSearch] = useState('');
  const [targetDropdown, setTargetDropdown] = useState<[string, string][]>([]);
  const [selectedTargets, setSelectedTargets] = useState<TargetUser[]>([]);
  const [displayStart, setDisplayStart] = useState('');
  const [displayEnd, setDisplayEnd] = useState('');
  const [sending, setSending] = useState(false);
  const [readStatusMessage, setReadStatusMessage] =
    useState<AdminMessage | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await get(ref(db, 'names'));
        if (snap.exists()) setAllNames(snap.val() as Record<string, string>);
      } catch {
      } finally {
        setNamesLoaded(true);
      }
    })();
  }, []);

  const lookupTarget = () => {
    const query = targetSearch.trim().toLowerCase();
    if (!query) return;
    setTargetDropdown([]);
    const matches = Object.entries(allNames).filter(
      ([empId, n]) =>
        n.toLowerCase().includes(query) &&
        !selectedTargets.some((t) => t.empId === empId),
    );
    if (matches.length === 0) {
      toast('등록된 회원이 없습니다.', {
        position: 'top-center',
        duration: 1800,
      });
      return;
    }
    if (matches.length === 1) {
      const [empId, name] = matches[0];
      setSelectedTargets((prev) => [...prev, { empId, name }]);
      setTargetSearch('');
      return;
    }
    setTargetDropdown(matches);
  };

  const addTarget = (empId: string, name: string) => {
    setSelectedTargets((prev) => [...prev, { empId, name }]);
    setTargetSearch('');
    setTargetDropdown([]);
  };

  const removeTarget = (empId: string) => {
    setSelectedTargets((prev) => prev.filter((t) => t.empId !== empId));
  };

  const handleSend = async () => {
    if (!title.trim()) {
      toast('제목을 입력해주세요.', { position: 'top-center' });
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      toast('내용을 입력해주세요.', { position: 'top-center' });
      return;
    }
    if (stripHtml(content).length > MAX_CONTENT_LENGTH) {
      toast(`내용은 최대 ${MAX_CONTENT_LENGTH}자까지 입력 가능합니다.`, {
        position: 'top-center',
      });
      return;
    }
    if (targetMode === 'specific' && selectedTargets.length === 0) {
      toast('대상 유저를 1명 이상 선택해주세요.', { position: 'top-center' });
      return;
    }

    const startMs = displayStart ? new Date(displayStart).getTime() : undefined;
    const endMs = displayEnd ? new Date(displayEnd).getTime() : undefined;
    if (startMs && endMs && endMs <= startMs) {
      toast('팝업 종료 시간은 시작 시간보다 늦어야 합니다.', {
        position: 'top-center',
      });
      return;
    }
    if (endMs && endMs <= useUiStore.getState().getServerNow().getTime()) {
      toast('팝업 종료 시간이 이미 지났습니다.', { position: 'top-center' });
      return;
    }

    const confirmMsg =
      targetMode === 'all'
        ? '⚠️ 전체 회원에게 발송됩니다. 계속하시겠습니까?'
        : `${selectedTargets.length}명에게 발송하시겠습니까?`;
    if (!window.confirm(confirmMsg)) return;

    setSending(true);
    try {
      const myEmpId = empIdFromEmail(getCurrentUserOrThrow().email);
      await sendMessage({
        title: title.trim(),
        content,
        type: targetMode,
        targetEmpIds:
          targetMode === 'specific'
            ? selectedTargets.map((t) => t.empId)
            : undefined,
        createdBy: myEmpId,
        createdByName: allNames[myEmpId] ?? myEmpId,
        displayStartAt: startMs,
        displayEndAt: endMs,
      });
      toast('✅ 메시지가 발송되었습니다.', {
        position: 'top-center',
        duration: 2000,
        style: toSuccessStyle,
      });
      setTitle('');
      setContent('');
      setSelectedTargets([]);
      setTargetMode('all');
      setTargetSearch('');
      setTargetDropdown([]);
      setDisplayStart('');
      setDisplayEnd('');
    } catch {
      toast.error('발송 중 오류가 발생했습니다.', { position: 'top-center' });
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (
      !window.confirm(
        '이 메시지를 취소하시겠습니까? 아직 못 읽은 사용자에게는 더 이상 노출되지 않습니다.',
      )
    )
      return;
    try {
      await cancelMessage(id);
      toast('🗑️ 메시지가 취소되었습니다.', {
        position: 'top-center',
        duration: 2000,
      });
    } catch {
      toast.error('취소 중 오류가 발생했습니다.', { position: 'top-center' });
    }
  };

  const handleDeleteForever = async (m: AdminMessage) => {
    if (
      !window.confirm(
        `⚠️ "${m.title}" 메시지를 영구 삭제하시겠습니까?\n이미 읽은 사용자의 알림함에서도 완전히 사라지며 복구할 수 없습니다.`,
      )
    )
      return;
    try {
      await deleteMessageForever(m.id);
      toast('🗑️ 메시지가 영구 삭제되었습니다.', {
        position: 'top-center',
        duration: 2000,
      });
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.', { position: 'top-center' });
    }
  };

  const formatTarget = (m: AdminMessage) => {
    if (m.type === 'all') return '전체';
    const names = (m.targetEmpIds ?? []).map((id) => allNames[id] ?? id);
    if (names.length <= 3) return `${names.length}명 (${names.join(', ')})`;
    return `${names.length}명 (${names.slice(0, 3).join(', ')} +${names.length - 3}명)`;
  };

  const messagesNow = useUiStore.getState().getServerNow().getTime();

  return (
    <AdminLayout title="공지사항 관리">
      <FormTitle>새 메시지 작성</FormTitle>

      <SectionBlock>
        <FieldLabel>제목</FieldLabel>
        <TitleInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 6월 정기전 일정 안내"
          maxLength={MAX_TITLE_LENGTH}
        />
        <CharCount>
          {title.length} / {MAX_TITLE_LENGTH}
        </CharCount>
      </SectionBlock>

      <SectionBlock>
        <FieldLabel>내용</FieldLabel>
        <MissionRichEditor
          value={content}
          onChange={setContent}
          placeholder="유저에게 보여줄 내용을 입력하세요."
        />
        <CharCount over={stripHtml(content).length > MAX_CONTENT_LENGTH}>
          {stripHtml(content).length} / {MAX_CONTENT_LENGTH}
        </CharCount>
      </SectionBlock>

      <SectionBlock>
        <FieldLabel>발송 대상</FieldLabel>
        <WinnerRow>
          <WinnerBtn
            active={targetMode === 'all'}
            onClick={() => setTargetMode('all')}
          >
            전체 유저
          </WinnerBtn>
          <WinnerBtn
            active={targetMode === 'specific'}
            onClick={() => setTargetMode('specific')}
          >
            특정 유저
          </WinnerBtn>
        </WinnerRow>

        {targetMode === 'specific' && (
          <>
            <TargetSearchRow>
              <TargetSearchInput
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                placeholder="이름 검색"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                    e.preventDefault();
                    lookupTarget();
                  }
                }}
              />
              <LookupBtn type="button" onClick={lookupTarget}>
                조회
              </LookupBtn>
            </TargetSearchRow>
            {targetDropdown.length > 0 && (
              <NameDropdown>
                {targetDropdown.map(([eid, n]) => (
                  <NameDropdownItem key={eid} onClick={() => addTarget(eid, n)}>
                    {n}
                    <span>{eid}</span>
                  </NameDropdownItem>
                ))}
              </NameDropdown>
            )}
            {selectedTargets.length > 0 && (
              <ChipRow>
                {selectedTargets.map((t) => (
                  <Chip key={t.empId}>
                    {t.name}
                    <ChipRemoveBtn
                      type="button"
                      onClick={() => removeTarget(t.empId)}
                    >
                      ×
                    </ChipRemoveBtn>
                  </Chip>
                ))}
              </ChipRow>
            )}
          </>
        )}
      </SectionBlock>

      <SectionBlock>
        <FieldLabel>노출 시간 (선택)</FieldLabel>
        <DisplayTimeRow>
          <DisplayTimeField>
            <DisplayTimeCaption>시작</DisplayTimeCaption>
            <DisplayTimeInput
              type="datetime-local"
              value={displayStart}
              onChange={(e) => setDisplayStart(e.target.value)}
            />
          </DisplayTimeField>
          <DisplayTimeField>
            <DisplayTimeCaption>팝업 종료</DisplayTimeCaption>
            <DisplayTimeInput
              type="datetime-local"
              value={displayEnd}
              onChange={(e) => setDisplayEnd(e.target.value)}
            />
          </DisplayTimeField>
        </DisplayTimeRow>
        <CharCount>
          시작을 비우면 즉시 노출, 종료를 비우면 팝업이 계속 노출됩니다. 종료
          이후에도 알림함에는 계속 남습니다.
        </CharCount>
      </SectionBlock>

      <SaveRow>
        <SaveBtn onClick={handleSend} disabled={sending}>
          {sending ? '발송 중...' : '발송'}
        </SaveBtn>
      </SaveRow>

      <Divider />

      <FormTitle>발송 내역</FormTitle>
      {messages.length === 0 ? (
        <EmptyMsg>아직 발송한 메시지가 없습니다.</EmptyMsg>
      ) : (
        <HistoryList>
          {messages.map((m) => {
            const displayStatus = getMessageDisplayStatus(m, messagesNow);
            return (
              <HistoryRow key={m.id} onClick={() => setReadStatusMessage(m)}>
                <HistoryRowTop>
                  <TypeBadge color={MESSAGE_TYPE_COLOR[m.type]}>
                    {MESSAGE_TYPE_LABEL[m.type]}
                  </TypeBadge>
                  <StatusTag displayStatus={displayStatus}>
                    {STATUS_LABEL[displayStatus]}
                  </StatusTag>
                  <HistoryTitle cancelled={m.status === 'cancelled'}>
                    {m.title}
                  </HistoryTitle>
                </HistoryRowTop>
                <HistoryMeta>
                  {formatTarget(m)} · {formatDate(m.createdAt)}
                  {m.displayStartAt &&
                    ` · 시작 ${formatDateFromMs(m.displayStartAt)}`}
                  {m.displayEndAt &&
                    ` · 팝업종료 ${formatDateFromMs(m.displayEndAt)}`}
                </HistoryMeta>
                <DangerRow onClick={(e) => e.stopPropagation()}>
                  {m.status === 'active' && (
                    <CancelLink onClick={() => handleCancel(m.id)}>
                      취소
                    </CancelLink>
                  )}
                  <DeleteForeverLink onClick={() => handleDeleteForever(m)}>
                    영구삭제
                  </DeleteForeverLink>
                </DangerRow>
              </HistoryRow>
            );
          })}
        </HistoryList>
      )}

      <SmallText
        top="middle"
        onClick={goBack}
      >
        돌아가기
      </SmallText>

      <MessageReadStatusModal
        isOpen={!!readStatusMessage}
        message={readStatusMessage}
        allNames={allNames}
        namesLoaded={namesLoaded}
        onClose={() => setReadStatusMessage(null)}
      />
    </AdminLayout>
  );
};

export default AdminMessages;
