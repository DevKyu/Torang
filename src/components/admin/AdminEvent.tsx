import { useEffect, useState, useCallback, useMemo } from 'react';
import { ref, set } from 'firebase/database';
import { toast } from 'sonner';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import AdminLayout from './AdminLayout';
import {
  useEventStore,
  DEFAULT_BADGE_COLOR,
  type MenuBadgeConfig,
} from '../../stores/eventStore';
import type { MatchType } from '../../types/match';
import { db, fetchAllUsers } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/global/commonStyle';
import { distributeMatchPins, rollbackMatchPins } from '../../utils/pin';
import {
  Section,
  SectionTitle,
  MonthSelect,
  SaveButton,
  RewardActionRow,
  RewardActionLabel,
  SectionHint,
  BulkRewardButton,
  RewardGrid,
  RewardCard,
  RewardToggle,
  RewardTitle,
  RateGroup,
  GalleryRewardCard,
  ThresholdRow,
  ThresholdInput,
  MenuCardGrid,
  MenuCard,
  MenuCardHeader,
  MenuControlRow,
  OrderInput,
  BadgeInputGroup,
  BadgeTextInput,
  BadgeColorInput,
  ToggleLabel,
  ToggleGroup,
  GhostButton,
} from '../../styles/admin/AdminEventStyle';

const MENU_KEYS = [
  'user',
  'rank',
  'history',
  'mission',
  'teams',
  'gallery',
  'reward',
  'draw',
] as const;
type MenuKey = (typeof MENU_KEYS)[number];

const MENU_LABEL: Record<MenuKey, string> = {
  user: '내정보',
  rank: '또랑 랭킹',
  history: '활동 기록',
  mission: '활동 미션',
  teams: '팀 편성',
  gallery: '또랑 갤러리',
  reward: '상품 신청',
  draw: '추첨 결과',
};

const PRESET_BADGE: Record<MenuKey, MenuBadgeConfig> = {
  user: { text: '새소식', color: '#0891b2' },
  rank: { text: '접전중', color: '#ef4444' },
  history: { text: '새기록', color: '#f97316' },
  mission: { text: '진행중', color: '#16a34a' },
  teams: { text: '편성중', color: '#7c3aed' },
  gallery: { text: '인기글', color: '#db2777' },
  reward: { text: '임박', color: '#2563eb' },
  draw: { text: '발표', color: '#6b7280' },
};

const PIN_KEYS = [
  'achievement',
  'targetScore',
  'rivalMatch',
  'pinMatch',
] as const;
type PinKey = (typeof PIN_KEYS)[number];

const PIN_LABEL: Record<PinKey, string> = {
  achievement: '🏅 업적',
  targetScore: '🎯 목표 점수',
  rivalMatch: '🥊 라이벌 매치',
  pinMatch: '📌 핀 매치',
};

type MenuDraft = Record<
  MenuKey,
  {
    order?: number;
    badge?: MenuBadgeConfig;
    disabled?: boolean;
    hidden?: boolean;
  }
>;

type RewardDraft = Partial<Record<PinKey, number>>;

const DEFAULT_REWARD: RewardDraft = {
  achievement: 0,
  targetScore: 0,
  rivalMatch: 0,
  pinMatch: 0,
};

const GALLERY_REWARD_KEYS = [
  'upload',
  'likeCreator',
  'commentCreator',
] as const;
type GalleryRewardKey = (typeof GALLERY_REWARD_KEYS)[number];

const GALLERY_REWARD_LABEL: Record<GalleryRewardKey, string> = {
  upload: '📸 업로드 보상',
  likeCreator: '❤️ 좋아요 인기 보상',
  commentCreator: '💬 댓글 인기 보상',
};

const GALLERY_REWARD_UNIT: Record<GalleryRewardKey, string> = {
  upload: '장',
  likeCreator: '개',
  commentCreator: '개',
};

type GalleryRewardDraft = Record<
  GalleryRewardKey,
  { pin: number; threshold: number }
>;

const DEFAULT_GALLERY_REWARD_DRAFT: GalleryRewardDraft = {
  upload: { pin: 0, threshold: 5 },
  likeCreator: { pin: 0, threshold: 10 },
  commentCreator: { pin: 0, threshold: 5 },
};

const RATE_OPTIONS = [0.5, 1, 1.5, 2];

const getYmList = (base: string, count = 4) => {
  const y = Number(base.slice(0, 4));
  const m = Number(base.slice(4, 6));
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date(y, m - 1 + i);
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
};

export default function AdminEvent() {
  const {
    menu,
    pinReward,
    galleryReward,
    matchType: storedMatchType,
    referralPin: storedReferralPin,
    checklistReminderDays: storedChecklistReminderDays,
    loadEventConfig,
  } = useEventStore();
  const ui = useUiStore();
  const goBack = useNavigateBack('/admin');

  const currentYm = String(ui.formatServerDate('ym'));
  const ymOptions = useMemo(() => getYmList(currentYm, 4), [currentYm]);

  const [selectedYm, setSelectedYm] = useState(currentYm);
  const [menuDraft, setMenuDraft] = useState<MenuDraft>({} as MenuDraft);
  const [rewardDraft, setRewardDraft] = useState<RewardDraft>(DEFAULT_REWARD);
  const [galleryRewardDraft, setGalleryRewardDraft] =
    useState<GalleryRewardDraft>(DEFAULT_GALLERY_REWARD_DRAFT);
  const [matchTypeDraft, setMatchTypeDraft] = useState<MatchType>('rival');
  const [referralPinDraft, setReferralPinDraft] = useState<number>(0);
  const [checklistReminderDaysDraft, setChecklistReminderDaysDraft] =
    useState<number>(0);
  const [distributing, setDistributing] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    loadEventConfig();
  }, [loadEventConfig]);

  useEffect(() => {
    setMatchTypeDraft(storedMatchType);
  }, [storedMatchType]);

  useEffect(() => {
    setReferralPinDraft(storedReferralPin);
  }, [storedReferralPin]);

  useEffect(() => {
    setChecklistReminderDaysDraft(storedChecklistReminderDays);
  }, [storedChecklistReminderDays]);

  useEffect(() => {
    const next: MenuDraft = {} as MenuDraft;
    MENU_KEYS.forEach((k) => {
      next[k] = menu[k] ?? {};
    });
    setMenuDraft(next);
  }, [menu]);

  useEffect(() => {
    setRewardDraft({ ...DEFAULT_REWARD, ...(pinReward[selectedYm] ?? {}) });
  }, [pinReward, selectedYm]);

  useEffect(() => {
    const cfg = galleryReward[selectedYm];
    setGalleryRewardDraft({
      upload: cfg?.upload ?? DEFAULT_GALLERY_REWARD_DRAFT.upload,
      likeCreator: cfg?.likeCreator ?? DEFAULT_GALLERY_REWARD_DRAFT.likeCreator,
      commentCreator:
        cfg?.commentCreator ?? DEFAULT_GALLERY_REWARD_DRAFT.commentCreator,
    });
  }, [galleryReward, selectedYm]);

  const visiblePinKeys = useMemo(
    () =>
      PIN_KEYS.filter((k) => {
        if (k === 'rivalMatch') return matchTypeDraft === 'rival';
        if (k === 'pinMatch') return matchTypeDraft === 'pin';
        return true;
      }),
    [matchTypeDraft],
  );

  const toggleAllRewards = useCallback(() => {
    const allOff =
      visiblePinKeys.every((k) => (rewardDraft[k] ?? 0) === 0) &&
      GALLERY_REWARD_KEYS.every((k) => galleryRewardDraft[k].pin === 0);

    const nextPin: RewardDraft = {};
    visiblePinKeys.forEach((k) => (nextPin[k] = allOff ? 0.5 : 0));
    setRewardDraft((p) => ({ ...p, ...nextPin }));

    setGalleryRewardDraft((p) => {
      const next = { ...p };
      GALLERY_REWARD_KEYS.forEach((k) => {
        next[k] = { ...next[k], pin: allOff ? 0.5 : 0 };
      });
      return next;
    });
  }, [visiblePinKeys, rewardDraft, galleryRewardDraft]);

  const setAllBadges = useCallback(
    (preset: Record<MenuKey, MenuBadgeConfig> | null) => {
      const confirmMsg = preset
        ? '현재 뱃지 문구/색상을 추천 값으로 모두 덮어씁니다. 계속할까요?'
        : '모든 메뉴의 뱃지 문구/색상을 초기화합니다. 계속할까요?';
      if (!confirm(confirmMsg)) return;

      setMenuDraft((prev) => {
        const next = { ...prev };
        MENU_KEYS.forEach((id) => {
          const cfg = { ...(next[id] ?? {}) };
          if (preset) {
            cfg.badge = preset[id];
          } else {
            delete cfg.badge;
          }
          next[id] = cfg;
        });
        return next;
      });

      toast.success(
        preset
          ? '추천 뱃지 값을 적용했어요. 전체 저장을 눌러 반영하세요.'
          : '뱃지를 초기화했어요. 전체 저장을 눌러 반영하세요.',
      );
    },
    [],
  );

  const saveAll = useCallback(async () => {
    await Promise.all([
      set(ref(db, 'eventConfig/menu'), menuDraft),
      set(ref(db, `eventConfig/pinReward/${selectedYm}`), rewardDraft),
      set(
        ref(db, `eventConfig/galleryReward/${selectedYm}`),
        galleryRewardDraft,
      ),
      set(ref(db, 'eventConfig/matchType'), matchTypeDraft),
      set(ref(db, 'eventConfig/referralPin'), referralPinDraft),
      set(
        ref(db, 'eventConfig/checklistReminderDays'),
        checklistReminderDaysDraft,
      ),
    ]);
    await loadEventConfig();
    toast.success('저장 완료');
  }, [
    menuDraft,
    rewardDraft,
    galleryRewardDraft,
    matchTypeDraft,
    referralPinDraft,
    checklistReminderDaysDraft,
    selectedYm,
    loadEventConfig,
  ]);

  const handleDistribute = useCallback(async () => {
    const pinRate = pinReward[selectedYm]?.pinMatch ?? 0;
    if (pinRate <= 0) {
      toast.error('핀 매치 지급 금액이 0입니다. 먼저 저장하세요.');
      return;
    }
    if (
      !confirm(
        `${selectedYm} 핀 매치 보상을 지급하시겠습니까?\n(미처리 건만 계산·지급됩니다)`,
      )
    )
      return;
    setDistributing(true);
    try {
      const users = await fetchAllUsers();
      const count = await distributeMatchPins(selectedYm, users, pinRate);
      toast.success(`${count}개 매치 처리 완료\n(참여자 수와 다를 수 있음 — 선택 쌍 기준)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setDistributing(false);
    }
  }, [selectedYm, pinReward]);

  const handleRollback = useCallback(async () => {
    if (
      !confirm(
        `⚠️ ${selectedYm} 핀 매치 지급을 롤백하시겠습니까?\n` +
          `승자 +핀 취소, 패자 -핀 복구, matchResults 초기화가 진행됩니다.\n` +
          `이후 올바른 로직으로 재지급할 수 있습니다.`,
      )
    )
      return;
    setRollingBack(true);
    try {
      const affected = await rollbackMatchPins(selectedYm);
      if (affected > 0) {
        toast.success(`롤백 완료 — ${affected}명 핀 조정`);
      } else {
        toast('롤백할 지급 내역이 없습니다.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setRollingBack(false);
    }
  }, [selectedYm]);

  return (
    <AdminLayout title="이벤트 설정">
      <Section>
        <SectionTitle>📋 메뉴 설정</SectionTitle>

        <RewardActionRow>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            🏷️ 뱃지 문구
          </span>
          <ToggleGroup>
            <GhostButton onClick={() => setAllBadges(null)}>
              전체 초기화
            </GhostButton>
            <BulkRewardButton onClick={() => setAllBadges(PRESET_BADGE)}>
              추천 값 적용
            </BulkRewardButton>
          </ToggleGroup>
        </RewardActionRow>

        <MenuCardGrid>
          {MENU_KEYS.map((id) => {
            const cfg = menuDraft[id] ?? {};
            return (
              <MenuCard key={id}>
                <MenuCardHeader>
                  <span>{MENU_LABEL[id]}</span>
                  <ToggleGroup>
                    <ToggleLabel>
                      <input
                        type="checkbox"
                        checked={cfg.hidden ?? false}
                        onChange={(e) =>
                          setMenuDraft((p) => ({
                            ...p,
                            [id]: { ...cfg, hidden: e.target.checked },
                          }))
                        }
                      />
                      숨김
                    </ToggleLabel>

                    <ToggleLabel>
                      <input
                        type="checkbox"
                        checked={cfg.disabled ?? false}
                        onChange={(e) =>
                          setMenuDraft((p) => ({
                            ...p,
                            [id]: { ...cfg, disabled: e.target.checked },
                          }))
                        }
                      />
                      비활성
                    </ToggleLabel>
                  </ToggleGroup>
                </MenuCardHeader>

                <MenuControlRow>
                  <span>순서</span>
                  <OrderInput
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cfg.order ?? 999}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, '');
                      setMenuDraft((p) => ({
                        ...p,
                        [id]: { ...cfg, order: v === '' ? 999 : Number(v) },
                      }));
                    }}
                  />
                </MenuControlRow>

                <MenuControlRow>
                  <span>뱃지</span>
                  <BadgeInputGroup>
                    <BadgeTextInput
                      type="text"
                      maxLength={6}
                      placeholder="예: NEW"
                      value={cfg.badge?.text ?? ''}
                      onChange={(e) =>
                        setMenuDraft((p) => {
                          const text = e.target.value;
                          const next = { ...cfg };
                          if (!text.trim()) {
                            delete next.badge;
                          } else {
                            next.badge = {
                              text,
                              color: cfg.badge?.color ?? DEFAULT_BADGE_COLOR,
                            };
                          }
                          return { ...p, [id]: next };
                        })
                      }
                    />
                    <BadgeColorInput
                      type="color"
                      disabled={!cfg.badge?.text}
                      value={cfg.badge?.color ?? DEFAULT_BADGE_COLOR}
                      onChange={(e) =>
                        setMenuDraft((p) => {
                          if (!cfg.badge) return p;
                          return {
                            ...p,
                            [id]: {
                              ...cfg,
                              badge: { ...cfg.badge, color: e.target.value },
                            },
                          };
                        })
                      }
                    />
                  </BadgeInputGroup>
                </MenuControlRow>
              </MenuCard>
            );
          })}
        </MenuCardGrid>
      </Section>

      <Section>
        <SectionTitle>🎁 핀 지급 설정</SectionTitle>

        <RewardActionRow>
          <MonthSelect
            value={selectedYm}
            onChange={(e) => setSelectedYm(e.target.value)}
          >
            {ymOptions.map((ym) => (
              <option key={ym} value={ym}>
                {ym.slice(0, 4)}년 {ym.slice(4, 6)}월
              </option>
            ))}
          </MonthSelect>

          <BulkRewardButton onClick={toggleAllRewards}>
            {visiblePinKeys.every((k) => (rewardDraft[k] ?? 0) > 0) &&
            GALLERY_REWARD_KEYS.every((k) => galleryRewardDraft[k].pin > 0)
              ? '전체 OFF'
              : '전체 0.5핀'}
          </BulkRewardButton>
        </RewardActionRow>

        <RewardActionRow>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            🥊 매치 방식
          </span>
          <ToggleGroup>
            <ToggleLabel>
              <input
                type="radio"
                name="matchType"
                value="rival"
                checked={matchTypeDraft === 'rival'}
                onChange={() => setMatchTypeDraft('rival')}
              />
              라이벌
            </ToggleLabel>
            <ToggleLabel>
              <input
                type="radio"
                name="matchType"
                value="pin"
                checked={matchTypeDraft === 'pin'}
                onChange={() => setMatchTypeDraft('pin')}
              />
              핀 매치
            </ToggleLabel>
          </ToggleGroup>
        </RewardActionRow>

        {matchTypeDraft === 'pin' && (
          <>
            <RewardActionRow>
              <BulkRewardButton
                onClick={handleDistribute}
                disabled={distributing || rollingBack}
                style={{ width: '100%' }}
              >
                {distributing
                  ? '처리 중...'
                  : `📌 ${selectedYm} 핀 매치 보상 지급`}
              </BulkRewardButton>
            </RewardActionRow>
            <RewardActionRow>
              <BulkRewardButton
                onClick={handleRollback}
                disabled={distributing || rollingBack}
                style={{ width: '100%', opacity: 0.7 }}
              >
                {rollingBack ? '롤백 중...' : `↩️ ${selectedYm} 핀 매치 지급 롤백`}
              </BulkRewardButton>
            </RewardActionRow>
          </>
        )}

        <RewardGrid>
          {visiblePinKeys.map((k) => {
            const rate = rewardDraft[k] ?? 0;
            const enabled = rate > 0;

            return (
              <RewardCard key={k}>
                <RewardTitle>{PIN_LABEL[k]}</RewardTitle>

                <RewardToggle>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setRewardDraft((p) => ({
                        ...p,
                        [k]: e.target.checked ? rate || 0.5 : 0,
                      }))
                    }
                  />
                  {enabled ? 'ON' : 'OFF'}
                </RewardToggle>

                <RateGroup>
                  {RATE_OPTIONS.map((v) => (
                    <button
                      key={v}
                      className={rate === v ? 'active' : ''}
                      disabled={!enabled}
                      onClick={() => setRewardDraft((p) => ({ ...p, [k]: v }))}
                    >
                      {v}
                    </button>
                  ))}
                </RateGroup>
              </RewardCard>
            );
          })}
        </RewardGrid>
      </Section>

      <Section>
        <SectionTitle>📷 갤러리 보상 설정</SectionTitle>

        <RewardGrid>
          {GALLERY_REWARD_KEYS.map((key) => {
            const item = galleryRewardDraft[key];
            const enabled = item.pin > 0;

            return (
              <GalleryRewardCard key={key}>
                <RewardTitle>{GALLERY_REWARD_LABEL[key]}</RewardTitle>

                <RewardToggle>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setGalleryRewardDraft((p) => ({
                        ...p,
                        [key]: {
                          ...p[key],
                          pin: e.target.checked ? item.pin || 0.5 : 0,
                        },
                      }))
                    }
                  />
                  {enabled ? 'ON' : 'OFF'}
                </RewardToggle>

                <RateGroup>
                  {RATE_OPTIONS.map((v) => (
                    <button
                      key={v}
                      className={item.pin === v ? 'active' : ''}
                      disabled={!enabled}
                      onClick={() =>
                        setGalleryRewardDraft((p) => ({
                          ...p,
                          [key]: { ...p[key], pin: v },
                        }))
                      }
                    >
                      {v}
                    </button>
                  ))}
                </RateGroup>

                <ThresholdRow>
                  <span>임계치</span>
                  <ThresholdInput
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={item.threshold || ''}
                    disabled={!enabled}
                    placeholder="0"
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, '');
                      setGalleryRewardDraft((p) => ({
                        ...p,
                        [key]: { ...p[key], threshold: v === '' ? 0 : Number(v) },
                      }));
                    }}
                  />
                  <span>{GALLERY_REWARD_UNIT[key]} 이상</span>
                </ThresholdRow>
              </GalleryRewardCard>
            );
          })}
        </RewardGrid>
      </Section>

      <Section>
        <SectionTitle>🤝 친구 추천 보상 설정</SectionTitle>
        <RewardActionRow>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            추천인 보상 (고정 핀)
          </span>
          <RateGroup>
            {RATE_OPTIONS.map((v) => (
              <button
                key={v}
                className={referralPinDraft === v ? 'active' : ''}
                onClick={() => setReferralPinDraft(v)}
              >
                {v}
              </button>
            ))}
            <button
              className={referralPinDraft === 0 ? 'active' : ''}
              onClick={() => setReferralPinDraft(0)}
            >
              OFF
            </button>
          </RateGroup>
        </RewardActionRow>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '4px 0 0' }}>
          월별 설정과 무관하게 적용되는 고정 보상입니다. 추천인·신규 가입자
          양측에 동일하게 지급됩니다.
        </p>
      </Section>

      <Section>
        <SectionTitle>📋 체크리스트 알림</SectionTitle>
        <RewardActionRow>
          <RewardActionLabel>알림 시작 시점</RewardActionLabel>
          <RateGroup>
            {[1, 3, 5, 7].map((v) => (
              <button
                key={v}
                className={checklistReminderDaysDraft === v ? 'active' : ''}
                onClick={() => setChecklistReminderDaysDraft(v)}
              >
                {v}일 전
              </button>
            ))}
            <button
              className={checklistReminderDaysDraft === 0 ? 'active' : ''}
              onClick={() => setChecklistReminderDaysDraft(0)}
            >
              제한없음
            </button>
          </RateGroup>
        </RewardActionRow>
        <SectionHint>
          로그인 시 뜨는 체크리스트 팝업을 활동일 며칠 전부터 띄울지 정해요.
        </SectionHint>
      </Section>

      <SaveButton onClick={saveAll}>💾 전체 저장</SaveButton>

      <SmallText onClick={goBack}>
        돌아가기
      </SmallText>
    </AdminLayout>
  );
}
