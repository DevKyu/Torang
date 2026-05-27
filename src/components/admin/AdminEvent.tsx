import { useEffect, useState, useCallback, useMemo } from 'react';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useEventStore } from '../../stores/eventStore';
import type { MatchType } from '../../types/match';
import { db, fetchAllUsers } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/commonStyle';
import { distributeMatchPins } from '../../utils/pin';
import {
  Section,
  SectionTitle,
  MonthSelect,
  SaveButton,
  RewardActionRow,
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
  BadgeSelect,
  ToggleLabel,
  ToggleGroup,
} from '../../styles/AdminEventStyle';

const MENU_KEYS = [
  'user',
  'rank',
  'history',
  'mission',
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
  gallery: '또랑 갤러리',
  reward: '상품 신청',
  draw: '추첨 결과',
};

const PIN_KEYS = [
  'achievement',
  'targetScore',
  'rivalMatch',
  'pinMatch',
  'galleryUpload',
  'referral',
] as const;
type PinKey = (typeof PIN_KEYS)[number];

const PIN_LABEL: Record<PinKey, string> = {
  achievement: '🏅 업적',
  targetScore: '🎯 목표 점수',
  rivalMatch: '🥊 라이벌 매치',
  pinMatch: '📌 핀 매치',
  galleryUpload: '📸 갤러리 업로드',
  referral: '🤝 친구 추천',
};

type MenuDraft = Record<
  MenuKey,
  {
    order?: number;
    badge?: 'new' | 'hot' | 'soon';
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
  galleryUpload: 0,
  referral: 0,
};

const GALLERY_REWARD_KEYS = ['likeCreator', 'commentCreator'] as const;
type GalleryRewardKey = (typeof GALLERY_REWARD_KEYS)[number];

const GALLERY_REWARD_LABEL: Record<GalleryRewardKey, string> = {
  likeCreator: '❤️ 좋아요 인기 보상',
  commentCreator: '💬 댓글 인기 보상',
};

type GalleryRewardDraft = Record<GalleryRewardKey, { pin: number; threshold: number }>;

const DEFAULT_GALLERY_REWARD_DRAFT: GalleryRewardDraft = {
  likeCreator: { pin: 0, threshold: 0 },
  commentCreator: { pin: 0, threshold: 0 },
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
  const { menu, pinReward, galleryReward, matchType: storedMatchType, loadEventConfig } = useEventStore();
  const ui = useUiStore();
  const navigate = useNavigate();

  const currentYm = String(ui.formatServerDate('ym'));
  const ymOptions = useMemo(() => getYmList(currentYm, 4), [currentYm]);

  const [selectedYm, setSelectedYm] = useState(currentYm);
  const [menuDraft, setMenuDraft] = useState<MenuDraft>({} as MenuDraft);
  const [rewardDraft, setRewardDraft] = useState<RewardDraft>(DEFAULT_REWARD);
  const [galleryRewardDraft, setGalleryRewardDraft] = useState<GalleryRewardDraft>(DEFAULT_GALLERY_REWARD_DRAFT);
  const [matchTypeDraft, setMatchTypeDraft] = useState<MatchType>('rival');
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    loadEventConfig();
  }, [loadEventConfig]);

  useEffect(() => {
    setMatchTypeDraft(storedMatchType);
  }, [storedMatchType]);

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
      likeCreator: cfg?.likeCreator ?? { pin: 0, threshold: 0 },
      commentCreator: cfg?.commentCreator ?? { pin: 0, threshold: 0 },
    });
  }, [galleryReward, selectedYm]);

  const toggleAllRewards = useCallback(() => {
    const allOff = PIN_KEYS.every((k) => (rewardDraft[k] ?? 0) === 0);
    const next: RewardDraft = {};
    PIN_KEYS.forEach((k) => (next[k] = allOff ? 0.5 : 0));
    setRewardDraft(next);
  }, [rewardDraft]);

  const saveAll = useCallback(async () => {
    await Promise.all([
      set(ref(db, 'eventConfig/menu'), menuDraft),
      set(ref(db, `eventConfig/pinReward/${selectedYm}`), rewardDraft),
      set(ref(db, `eventConfig/galleryReward/${selectedYm}`), galleryRewardDraft),
      set(ref(db, 'eventConfig/matchType'), matchTypeDraft),
    ]);
    await loadEventConfig();
    alert('✅ 저장 완료');
  }, [menuDraft, rewardDraft, galleryRewardDraft, matchTypeDraft, selectedYm, loadEventConfig]);

  const handleDistribute = useCallback(async () => {
    const pinRate = pinReward[selectedYm]?.pinMatch ?? 0;
    if (pinRate <= 0) {
      alert('핀 매치 지급 금액이 0입니다. 먼저 저장하세요.');
      return;
    }
    if (!confirm(`${selectedYm} 핀 매치 보상을 지급하시겠습니까?\n(미처리 건만 계산·지급됩니다)`)) return;
    setDistributing(true);
    try {
      const users = await fetchAllUsers();
      const count = await distributeMatchPins(selectedYm, users, pinRate);
      alert(`✅ ${count}건 처리 완료`);
    } catch (e) {
      alert(`❌ 오류: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDistributing(false);
    }
  }, [selectedYm, pinReward]);

  return (
    <AdminLayout title="이벤트 설정">
      <Section>
        <SectionTitle>📋 메뉴 설정</SectionTitle>

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
                    type="number"
                    value={cfg.order ?? 999}
                    onChange={(e) =>
                      setMenuDraft((p) => ({
                        ...p,
                        [id]: { ...cfg, order: Number(e.target.value) },
                      }))
                    }
                  />
                </MenuControlRow>

                <MenuControlRow>
                  <span>뱃지</span>
                  <BadgeSelect
                    value={cfg.badge ?? ''}
                    onChange={(e) =>
                      setMenuDraft((p) => {
                        const next = { ...cfg };
                        if (!e.target.value) delete next.badge;
                        else next.badge = e.target.value as any;
                        return { ...p, [id]: next };
                      })
                    }
                  >
                    <option value="">없음</option>
                    <option value="new">NEW</option>
                    <option value="hot">HOT</option>
                    <option value="soon">SOON</option>
                  </BadgeSelect>
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
            {PIN_KEYS.every((k) => (rewardDraft[k] ?? 0) > 0)
              ? '전체 OFF'
              : '전체 0.5핀'}
          </BulkRewardButton>
        </RewardActionRow>

        <RewardActionRow>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>🥊 매치 방식</span>
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
          <RewardActionRow>
            <BulkRewardButton
              onClick={handleDistribute}
              disabled={distributing}
              style={{ width: '100%' }}
            >
              {distributing ? '처리 중...' : `📌 ${selectedYm} 핀 매치 보상 지급`}
            </BulkRewardButton>
          </RewardActionRow>
        )}

        <RewardGrid>
          {PIN_KEYS.map((k) => {
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
        <SectionTitle>📷 갤러리 인기 보상</SectionTitle>

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
                        [key]: { ...p[key], pin: e.target.checked ? item.pin || 0.5 : 0 },
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
                    type="number"
                    min="1"
                    value={item.threshold || ''}
                    disabled={!enabled}
                    placeholder="0"
                    onChange={(e) =>
                      setGalleryRewardDraft((p) => ({
                        ...p,
                        [key]: { ...p[key], threshold: Number(e.target.value) },
                      }))
                    }
                  />
                  <span>개 이상</span>
                </ThresholdRow>
              </GalleryRewardCard>
            );
          })}
        </RewardGrid>
      </Section>

      <SaveButton onClick={saveAll}>💾 전체 저장</SaveButton>

      <SmallText onClick={() => navigate('/admin', { replace: true })}>
        돌아가기
      </SmallText>
    </AdminLayout>
  );
}
