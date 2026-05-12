import { useEffect, useState, useCallback, useMemo } from 'react';
import { ref, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useEventStore } from '../../stores/eventStore';
import { db } from '../../services/firebase';
import { useUiStore } from '../../stores/useUiStore';
import { SmallText } from '../../styles/commonStyle';
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
  const { menu, pinReward, loadEventConfig } = useEventStore();
  const ui = useUiStore();
  const navigate = useNavigate();

  const currentYm = String(ui.formatServerDate('ym'));
  const ymOptions = useMemo(() => getYmList(currentYm, 4), [currentYm]);

  const [selectedYm, setSelectedYm] = useState(currentYm);
  const [menuDraft, setMenuDraft] = useState<MenuDraft>({} as MenuDraft);
  const [rewardDraft, setRewardDraft] = useState<RewardDraft>(DEFAULT_REWARD);

  useEffect(() => {
    loadEventConfig();
  }, [loadEventConfig]);

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

  const toggleAllRewards = useCallback(() => {
    const allOff = PIN_KEYS.every((k) => (rewardDraft[k] ?? 0) === 0);
    const next: RewardDraft = {};
    PIN_KEYS.forEach((k) => (next[k] = allOff ? 0.5 : 0));
    setRewardDraft(next);
  }, [rewardDraft]);

  const saveAll = useCallback(async () => {
    await set(ref(db, 'eventConfig/menu'), menuDraft);
    await set(ref(db, `eventConfig/pinReward/${selectedYm}`), rewardDraft);
    await loadEventConfig();
    alert('✅ 저장 완료');
  }, [menuDraft, rewardDraft, selectedYm, loadEventConfig]);

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

      <SaveButton onClick={saveAll}>💾 전체 저장</SaveButton>

      <SmallText onClick={() => navigate('/admin', { replace: true })}>
        돌아가기
      </SmallText>
    </AdminLayout>
  );
}
