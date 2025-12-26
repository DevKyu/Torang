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
  RewardItem,
  MonthSelect,
  SaveButton,
  RewardActionRow,
  BulkRewardButton,
} from '../../styles/AdminEventStyle';

const MENU_KEYS = ['user', 'rank', 'reward', 'gallery', 'draw'] as const;
type MenuKey = (typeof MENU_KEYS)[number];

const PIN_KEYS = [
  'isTargetScore',
  'isRivalMatch',
  'isPinMatch',
  'isAchievement',
  'isGalleryUpload',
] as const;
type PinKey = (typeof PIN_KEYS)[number];

type MenuDraft = Record<
  MenuKey,
  { order?: number; badge?: 'new' | 'hot' | 'soon'; disabled?: boolean }
>;
type RewardDraft = Partial<Record<PinKey, boolean>>;

const DEFAULT_REWARD: RewardDraft = {
  isTargetScore: false,
  isRivalMatch: false,
  isPinMatch: false,
  isAchievement: false,
  isGalleryUpload: false,
};

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

  const [selectedYm, setSelectedYm] = useState<string>(currentYm);
  const [menuDraft, setMenuDraft] = useState<MenuDraft>({} as MenuDraft);
  const [rewardDraft, setRewardDraft] = useState<RewardDraft>(DEFAULT_REWARD);

  useEffect(() => {
    loadEventConfig();
  }, [loadEventConfig]);

  useEffect(() => {
    setMenuDraft(menu as MenuDraft);
  }, [menu]);

  useEffect(() => {
    const key = String(selectedYm);
    setRewardDraft({ ...DEFAULT_REWARD, ...(pinReward[key] ?? {}) });
  }, [pinReward, selectedYm]);

  const toggleAllRewards = useCallback(() => {
    const all = PIN_KEYS.every((k) => rewardDraft[k]);
    const next: RewardDraft = {};
    PIN_KEYS.forEach((k) => (next[k] = !all));
    setRewardDraft(next);
  }, [rewardDraft]);

  const saveAll = useCallback(async () => {
    await set(ref(db, 'eventConfig/menu'), menuDraft);
    await set(
      ref(db, `eventConfig/pinReward/${String(selectedYm)}`),
      rewardDraft,
    );
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
            onChange={(e) => setSelectedYm(String(e.target.value))}
          >
            {ymOptions.map((ym) => (
              <option key={ym} value={ym}>
                {ym.slice(0, 4)}년 {ym.slice(4, 6)}월
              </option>
            ))}
          </MonthSelect>

          <BulkRewardButton onClick={toggleAllRewards}>
            {PIN_KEYS.every((k) => rewardDraft[k]) ? '전체 해제' : '전체 선택'}
          </BulkRewardButton>
        </RewardActionRow>

        <RewardGrid>
          {PIN_KEYS.map((k) => (
            <RewardItem key={k}>
              <input
                type="checkbox"
                checked={rewardDraft[k] ?? false}
                onChange={(e) =>
                  setRewardDraft((p) => ({ ...p, [k]: e.target.checked }))
                }
              />
              {k}
            </RewardItem>
          ))}
        </RewardGrid>
      </Section>

      <SaveButton onClick={saveAll}>💾 전체 저장</SaveButton>

      <SmallText onClick={() => navigate('/admin', { replace: true })}>
        돌아가기
      </SmallText>
    </AdminLayout>
  );
}
