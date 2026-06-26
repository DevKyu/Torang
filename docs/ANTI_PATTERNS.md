# ANTI_PATTERNS.md

프로젝트에서 반복적으로 발견되거나 버그로 이어진 패턴 목록.
새로운 코드를 작성하거나 리뷰할 때 체크리스트로 활용한다.

---

## 1. IME composition Enter 미처리

**증상**: 한국어 입력 중 조합 완료 Enter가 검색/제출 핸들러를 즉시 트리거함.

**잘못된 패턴**
```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter') handleSearch();
}}
```

**올바른 패턴**
```tsx
onKeyDown={(e) => {
  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
  if (e.key === 'Enter') handleSearch();
}}
```

**현재 적용 현황**
- 적용됨: `AdminMessages.tsx`, `AdminLeague.tsx`, `AdminMission.tsx`, `AdminUserManagement.tsx`, `AdminTeamFormation.tsx`

---

## 2. `type="number"` 입력 필드

**증상**: iOS 스크롤 휠 UI 노출, 빈 문자열 → `NaN` 변환, 브라우저별 동작 불일치.

**잘못된 패턴**
```tsx
<input type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} />
```

**올바른 패턴**
```tsx
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  autoComplete="off"
  value={val}
  onChange={(e) => /^\d{0,N}$/.test(e.target.value) && setVal(e.target.value)}
/>
```
JS 레벨에서 `Number(value)` 변환 + 범위 검사를 별도 처리한다.

**현재 적용 현황**
- 적용됨: `ScoreDialog.tsx`, `AdminUserManagement.tsx`, `AdminProducts.tsx`, `AdminMission.tsx`, `AdminEvent.tsx`
- 정수 필드: `inputMode="numeric"` + `replace(/[^\d]/g, '')` 필터
- 소수 필드 (rewardPin 계열): `inputMode="decimal"` + `/^[\d.]*$/` 필터

---

## 3. Framer Motion scale 애니메이션과 텍스트 선명도

**증상**: scale 0.9→1 트랜지션 중 서브픽셀 렌더링 변화로 텍스트가 위치가 바뀌거나 선명해지는 것처럼 보임. 특히 텍스트가 주 콘텐츠인 모달에서 두드러짐.

**잘못된 패턴** (텍스트 중심 모달)
```tsx
<Card
  initial={{ opacity: 0, scale: 0.9, y: 16 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.92 }}
/>
```

**올바른 패턴**
```tsx
<Card
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
/>
```

**판단 기준**
- 텍스트가 주 콘텐츠인 모달/카드: scale 제거, opacity + y만 사용
- 이미지 썸네일, 전체화면 오버레이, 메뉴 타일 뱃지 등: scale 유지 가능

**현재 적용 현황**
- 적용됨: `MessageModal.tsx`, `MessageReadStatusModal.tsx`, `CorrectVotersModal.tsx`, `VillainMissionModal.tsx`

---

## 4. Framer Motion MotionValue + `initial` prop 혼용

**증상**: `style={{ y: motionValue }}`와 `initial={{ y: startValue }}`를 같은 element에 쓰면 re-render 시 framer-motion이 MotionValue를 `initial` 값으로 리셋해 애니메이션이 중단/플래시됨.

**잘못된 패턴**
```tsx
// 같은 element에 둘 다 사용 — 금지
<motion.div initial={{ y: 440 }} style={{ y: yMotionValue }} />
```

**올바른 패턴**
```tsx
// useLayoutEffect로 시작 위치 설정, useEffect로 애니메이션 시작
useLayoutEffect(() => { if (open) y.set(startY); }, [open]);
useEffect(() => { if (open) animate(y, 0, { duration, ease }); }, [open]);

<motion.div style={{ y }} /> // initial prop 없음
```

opacity에도 동일하게 적용 (LightBox Overlay 등).

---

## 5. Bottom Sheet `closingRef` 누락

**증상**: 드래그 → 닫기 애니메이션 중 다른 터치 이벤트가 `runClose()`를 재실행하거나, 닫기 완료 후 stale `onDragEnd`가 close 애니메이션을 취소함.

**올바른 패턴**
```tsx
const closingRef = useRef(false);

// 열릴 때 리셋
useEffect(() => {
  if (open) closingRef.current = false;
}, [open]);

// 닫을 때
const runClose = () => {
  if (closingRef.current) return;
  closingRef.current = true;
  animate(y, CLOSED_Y, { onComplete: onClose });
};
```

LightBox는 `lightboxClosingRef`로 동일 패턴 — `isOpen`이 `true`가 될 때마다 `false`로 리셋.

---

## 6. `waitForAuthUser()` 경쟁 조건

**증상**: `auth.currentUser`가 앱 재개 직후 잠깐 `null`인 상태에서 `getCurrentUserId()` 등이 호출돼 throw함.

**잘못된 패턴**
```ts
// Promise.all에 같이 넣으면 waitForAuthUser와 동시에 실행 — 레이스 발생
const [_, userId] = await Promise.all([waitForAuthUser(), getCurrentUserId()]);
```

**올바른 패턴**
```ts
await waitForAuthUser();
const userId = getCurrentUserId(); // 이후에 호출
```

auth 의존성 없는 함수(`preloadAllNames`, `syncServerTime`, `loadEventConfig` 등)는 `Promise.all`로 병렬 실행 가능.

---

## 7. `get()` one-shot 읽기 (플레이키 네트워크 false-empty)

**증상**: Realtime Database 연결이 완전히 준비되기 전 `get()`이 빈 값을 반환 → false "데이터 없음" 상태로 UI가 잘못 분기됨 (빈 리스트, 잘못된 리다이렉트 등).

**잘못된 패턴** (초기 데이터 로딩에 one-shot 사용)
```ts
const snap = await get(ref(db, `products/${ym}`));
if (!snap.exists()) navigate('/menu'); // 연결 지연이면 false negative
```

**올바른 패턴**
```ts
// onValue는 연결될 때까지 기다렸다가 데이터 도착하면 콜백 실행
const unsub = onValue(ref(db, `products/${ym}`), (snap) => { ... });
```

**현재 적용 현황**
- 적용됨: `Draw.tsx`, `Reward.tsx` (false-empty 리다이렉트 버그 후 수정), `useRivalEmpIds.ts` (get → onValue + waitForAuthUser 추가)
- 잔여 one-shot: `useActivityDraw.ts` (히스토리용 — 리다이렉트 없어 영향 작음, 허용)

---

## 8. `body { height: 100% }` 제거 부작용

**증상**: GlobalStyle에서 `html, body { height: 100% }` 제거 시 `body { overflow: hidden }`이 효과가 없어짐 — html 레벨로 스크롤이 누출돼 `lockBodyScroll()` 이 동작하지 않음. 또한 어드민 페이지 `OuterWrapper`의 `overflow-y: auto`가 scroll container로 작동하지 않아 스크롤이 깨짐.

**규칙**
- `GlobalStyle`에서 `height: 100%` 는 유지한다
- `background` 는 스플래시 흰색 줄 버그 때문에 GlobalStyle에 넣지 않는다 (`main.tsx`의 `onComplete`에서 인라인 스타일로 적용)
- 어드민 레이아웃처럼 자체 스크롤이 필요한 wrapper는 `height: 100vh; height: 100dvh`로 직접 뷰포트 높이를 지정한다

---

## 9. SmallText ghost-click (메뉴 타일 onPointerUp 잔상)

**증상**: 메뉴 타일 `onPointerUp` → navigate 직후, 동일 좌표에서 trailing `click` 이벤트가 새 페이지의 요소(주로 "돌아가기" SmallText)를 트리거해 즉시 `/menu`로 돌아감.

**두 겹 방어가 모두 필요**

1. `SmallText` 컴포넌트 자체: `onClick` prop을 내부에서 `onPointerUp`으로 바인딩 + `e.preventDefault()` (ghost click 방지)
2. 각 페이지 `SmallText`의 onClick 핸들러: 페이지 로딩 상태 가드
```tsx
<SmallText onClick={() => {
  if (!isReady) return; // ghost click 구간 = 항상 초기 로딩 중
  navigate('/menu', { replace: true });
}}>
  돌아가기
</SmallText>
```

---

## 10. Admin navigate `replace: true` 양방향 필수

**증상**: Admin 서브 페이지 진입 시 `replace: true` 누락 → 히스토리 스택에 `/admin`이 두 개 쌓여 뒤로가기를 두 번 눌러야 어드민 섹션을 탈출할 수 있음.

**규칙**
- `AdminUserManagement`(`/admin`) → 각 서브 페이지: `navigate(path, { replace: true })`
- 각 서브 페이지 → "돌아가기": `navigate('/admin', { replace: true })`
- 양방향 모두 `replace: true` 없으면 stack 중복 발생

---

## 11. `useEffect` deps에 미사용 값 포함

**증상**: effect 본문에서 실제로 참조하지 않는 값이 deps에 있으면 불필요한 effect 재실행 유발.

**예시 (수정됨)**
```ts
// useTargetResult.ts — ym이 effect 본문에서 미사용이었음
}, [user, ym, activityYmd, withinDays, initialized]); // 수정 전
}, [user, activityYmd, withinDays, initialized]);       // 수정 후

// CongratulationOverlay.tsx — isTargetCase가 effect 본문에서 미사용
}, [open, durationMs, onClose, safeResult, isTargetCase]); // 수정 전
}, [open, durationMs, onClose, safeResult]);               // 수정 후
```

**체크 방법**: `tsc -p tsconfig.app.json --noEmit --noUnusedLocals` 로 기본 체크, effect deps는 직접 확인 필요.

---

## 12. Tiptap extension 미등록

**증상**: 툴바 버튼이 존재하지만 클릭해도 아무 동작 안 함.

**예시 (수정됨)**
```ts
// MissionRichEditor.tsx — Underline 버튼이 있었으나 extension 미등록
const EXTENSIONS = [StarterKit, TextStyle, Color]; // 수정 전
const EXTENSIONS = [StarterKit, TextStyle, Color, Underline]; // 수정 후
```

**규칙**: 툴바에 버튼을 추가할 때 `EXTENSIONS` 배열에 해당 extension이 있는지 반드시 확인.
