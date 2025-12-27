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
  MenuGrid,
  MenuHeader,
  MenuRow,
  MenuName,
  OrderInput,
  BadgeSelect,
  ToggleLabel,
  RewardGrid,
  MonthSelect,
  SaveButton,
  RewardActionRow,
  BulkRewardButton,
  RateGroup,
  RewardCard,
  RewardToggle,
  RewardTitle,
} from '../../styles/AdminEventStyle';

const MENU_KEYS = ['user', 'rank', 'reward', 'gallery', 'draw'] as const;
type MenuKey = (typeof MENU_KEYS)[number];

const PIN_KEYS = [
  'achievement',
  'targetScore',
  'rivalMatch',
  'pinMatch',
  'galleryUpload',
] as const;
type PinKey = (typeof PIN_KEYS)[number];

const PIN_LABEL: Record<PinKey, string> = {
  achievement: '🏅 업적',
  targetScore: '🎯 목표 점수',
  rivalMatch: '🥊 라이벌 매치',
  pinMatch: '📌 핀 매치',
  galleryUpload: '📸 갤러리 업로드',
};

type MenuDraft = Record<
  MenuKey,
  { order?: number; badge?: 'new' | 'hot' | 'soon'; disabled?: boolean }
>;

type RewardDraft = Partial<Record<PinKey, number>>;

const DEFAULT_REWARD: RewardDraft = {
  achievement: 0,
  targetScore: 0,
  rivalMatch: 0,
  pinMatch: 0,
  galleryUpload: 0,
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
    setMenuDraft(menu as MenuDraft);
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
        <MenuGrid>
          <MenuHeader>메뉴</MenuHeader>
          <MenuHeader>순서</MenuHeader>
          <MenuHeader>뱃지</MenuHeader>
          <MenuHeader>숨김</MenuHeader>

          {MENU_KEYS.map((id) => {
            const cfg = menuDraft[id] ?? {};
            return (
              <MenuRow key={id}>
                <MenuName>{id}</MenuName>
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
              </MenuRow>
            );
          })}
        </MenuGrid>
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
