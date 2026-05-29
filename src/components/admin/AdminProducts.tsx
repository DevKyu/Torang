import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, update } from 'firebase/database';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';
import { db, getCachedUserName, preloadAllNames } from '../../services/firebase';
import { SmallText } from '../../styles/commonStyle';
import { getQuarterEndYm } from '../../utils/date';
import type { ProductItem } from '../../types/Product';
import {
  Section,
  SectionTitle,
  YmSelect,
  ColHeader,
  ColLabel,
  ProductTable,
  ProductRow,
  ProductInput,
  DetailRow,
  DescriptionInput,
  IconButton,
  AddButton,
  SaveButton,
  RaffleGrid,
  RaffleCard,
  RaffleCardTitle,
  RaffleNames,
  WinnerNames,
  CountBadge,
  ResetButton,
  EmptyNote,
  Divider,
} from '../../styles/AdminProductsStyle';

type DraftProduct = {
  name: string;
  requiredPins: number;
  winnersCount: number;
  description: string;
  imageUrl: string;
  raffle: string[];
  winners: string[];
};

const getQuarterOptions = (): string[] => {
  const now = new Date();
  const results = new Set<string>();
  for (let i = -2; i <= 2; i++) {
    results.add(getQuarterEndYm(new Date(now.getFullYear(), now.getMonth() + i * 3, 1)));
  }
  return [...results].sort();
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const ymOptions = useMemo(() => getQuarterOptions(), []);
  const [selectedYm, setSelectedYm] = useState(getQuarterEndYm());
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [namesLoaded, setNamesLoaded] = useState(false);

  const loadData = useCallback(async (ym: string) => {
    setLoading(true);
    try {
      await preloadAllNames();
      setNamesLoaded(true);

      const snap = await get(ref(db, `products/${ym}/items`));
      if (!snap.exists()) {
        setDrafts([]);
        return;
      }

      const raw = snap.val() as ProductItem[] | Record<string, ProductItem>;
      const items: ProductItem[] = Array.isArray(raw) ? raw : Object.values(raw);

      setDrafts(
        items.map((item) => ({
          name: item.name ?? '',
          requiredPins: item.requiredPins ?? 0,
          winnersCount: item.winnersCount ?? 1,
          description: item.description ?? '',
          imageUrl: item.imageUrl ?? '',
          raffle: item.raffle ?? [],
          winners: item.winners ?? [],
        })),
      );
    } catch {
      toast.error('데이터를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedYm);
  }, [selectedYm, loadData]);

  const updateDraft = (i: number, field: keyof Pick<DraftProduct, 'name' | 'requiredPins' | 'winnersCount' | 'description' | 'imageUrl'>, value: string | number) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const addProduct = () =>
    setDrafts((prev) => [
      ...prev,
      { name: '', requiredPins: 0, winnersCount: 1, description: '', imageUrl: '', raffle: [], winners: [] },
    ]);

  const removeProduct = (i: number) =>
    setDrafts((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (saving) return;
    if (drafts.some((d) => !d.name.trim())) {
      toast.error('상품 이름을 모두 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const items = drafts.map((d, i) => ({
        index: i,
        name: d.name.trim(),
        requiredPins: Number(d.requiredPins),
        winnersCount: Number(d.winnersCount) || 1,
        ...(d.description.trim() ? { description: d.description.trim() } : {}),
        ...(d.imageUrl.trim() ? { imageUrl: d.imageUrl.trim() } : {}),
        ...(d.raffle.length > 0 ? { raffle: d.raffle } : {}),
        ...(d.winners.length > 0 ? { winners: d.winners } : {}),
      }));

      await set(ref(db, `products/${selectedYm}/items`), items);
      toast.success('저장됐어요.');
      await loadData(selectedYm);
    } catch {
      toast.error('저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDraw = async () => {
    if (!confirm('추첨 결과를 초기화할까요?\n응모자(raffle)는 유지되고 당첨자(winners)와 meta만 삭제됩니다.')) return;

    try {
      const updates: Record<string, null> = {
        [`products/${selectedYm}/meta`]: null,
      };
      drafts.forEach((_, i) => {
        updates[`products/${selectedYm}/items/${i}/winners`] = null;
      });
      await update(ref(db), updates);
      toast.success('추첨 결과가 초기화됐어요.');
      await loadData(selectedYm);
    } catch {
      toast.error('초기화에 실패했어요.');
    }
  };

  const formatNames = (ids: string[]) =>
    ids.length === 0 ? '없음' : ids.map((id) => getCachedUserName(id)).join(', ');

  const ymLabel = (ym: string) =>
    `${ym.slice(0, 4)}년 ${Number(ym.slice(4))}월 (${Math.ceil(Number(ym.slice(4)) / 3)}분기)`;

  return (
    <AdminLayout title="📦 상품 관리">
      <YmSelect value={selectedYm} onChange={(e) => setSelectedYm(e.target.value)}>
        {ymOptions.map((ym) => (
          <option key={ym} value={ym}>{ymLabel(ym)}</option>
        ))}
      </YmSelect>

      {loading ? (
        <EmptyNote>불러오는 중...</EmptyNote>
      ) : (
        <>
          <Section>
            <SectionTitle>상품 목록</SectionTitle>
            <ColHeader>
              <ColLabel>상품명</ColLabel>
              <ColLabel>필요 핀</ColLabel>
              <ColLabel>당첨자 수</ColLabel>
              <span />
            </ColHeader>
            <ProductTable>
              {drafts.map((d, i) => (
                <div key={i}>
                  <ProductRow>
                    <ProductInput
                      value={d.name}
                      placeholder="상품명"
                      onChange={(e) => updateDraft(i, 'name', e.target.value)}
                    />
                    <ProductInput
                      type="number"
                      min={0}
                      value={d.requiredPins}
                      onChange={(e) => updateDraft(i, 'requiredPins', e.target.value)}
                    />
                    <ProductInput
                      type="number"
                      min={1}
                      value={d.winnersCount}
                      onChange={(e) => updateDraft(i, 'winnersCount', e.target.value)}
                    />
                    <IconButton onClick={() => removeProduct(i)} title="삭제">✕</IconButton>
                  </ProductRow>
                  <DetailRow>
                    <DescriptionInput
                      value={d.description}
                      placeholder="상품 설명 (선택)"
                      onChange={(e) => updateDraft(i, 'description', e.target.value)}
                    />
                    <ProductInput
                      value={d.imageUrl}
                      placeholder="이미지 URL (선택)"
                      onChange={(e) => updateDraft(i, 'imageUrl', e.target.value)}
                    />
                  </DetailRow>
                </div>
              ))}
            </ProductTable>
            <AddButton onClick={addProduct}>+ 상품 추가</AddButton>
            <SaveButton onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </SaveButton>
          </Section>

          <Divider />

          <Section>
            <SectionTitle>응모 현황</SectionTitle>
            {drafts.length === 0 ? (
              <EmptyNote>등록된 상품이 없어요.</EmptyNote>
            ) : (
              <RaffleGrid>
                {drafts.map((d, i) => (
                  <RaffleCard key={i}>
                    <RaffleCardTitle>
                      {d.name || `상품 ${i + 1}`}
                      <CountBadge>{d.raffle.length}명</CountBadge>
                    </RaffleCardTitle>
                    <RaffleNames>
                      {namesLoaded ? formatNames(d.raffle) : '로딩 중...'}
                    </RaffleNames>
                  </RaffleCard>
                ))}
              </RaffleGrid>
            )}
          </Section>

          <Divider />

          <Section>
            <SectionTitle>추첨 결과</SectionTitle>
            {drafts.length === 0 ? (
              <EmptyNote>등록된 상품이 없어요.</EmptyNote>
            ) : (
              <>
                <RaffleGrid>
                  {drafts.map((d, i) => (
                    <RaffleCard key={i}>
                      <RaffleCardTitle>
                        {d.name || `상품 ${i + 1}`}
                        <CountBadge>{d.winners.length}명 당첨</CountBadge>
                      </RaffleCardTitle>
                      <WinnerNames>
                        {d.winners.length === 0
                          ? '추첨 전'
                          : namesLoaded
                            ? formatNames(d.winners)
                            : '로딩 중...'}
                      </WinnerNames>
                    </RaffleCard>
                  ))}
                </RaffleGrid>
                <div style={{ marginTop: 12 }}>
                  <ResetButton onClick={handleResetDraw}>추첨 초기화</ResetButton>
                </div>
              </>
            )}
          </Section>
        </>
      )}

      <SmallText
        top="middle"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate('/admin', { replace: true })}
      >
        돌아가기
      </SmallText>
    </AdminLayout>
  );
};

export default AdminProducts;
