# Firebase Realtime Database 스키마

또랑(Torang) Firebase Realtime DB 전체 경로 및 필드 구조 참고 문서.  
실제 DB export 기준으로 작성됨.

---

## users/{empId}/

```
{
  name: string,
  join: YM,                    // 가입월 예: "202210"
  type: 'Member' | 'Associate',
  pin: number,
  uid: string,                 // Firebase Auth UID
  lastAchievementCheck: YMD,
  usedItems?: number[],        // 교환한 상품 index 목록
  invitedCount?: number,       // 내가 추천하여 가입한 인원 수 (업적 조건용)

  scores: {
    [year: Year]: { [month: Month]: number }
    // Month는 패딩 없는 문자열 '1'~'12'
  },

  targets: {
    [year: Year]: { [month: Month]: number }
  },

  achievements: {
    [achievementKey: string]: { achievedAt: YM }
  },

  rewards: {
    [ym: YM]: {
      activity?:    { [timestamp]: RewardEntry },
      match?:       { [opponentId]: MatchRewardEntry },
      target?:      TargetRewardEntry,
      achievement?: AchievementRewardEntry,   // 단일 객체 — target과 동일하게 월 1회만 기록
      mission?:     { [timestamp]: RewardEntry },
      referral?:    { [timestamp]: RewardEntry },
      gallery?:     { [timestamp]: RewardEntry }
    }
  },

  gallery?: {
    uploadCount:   { [ym: YM]: number },   // 업로드 보상 기준 횟수
    uploadedCount: { [ym: YM]: number },   // 실제 업로드된 이미지 수
    uploadReward:  { [ym: YM]: { pin: number, rewarded: boolean, rewardedAt: string, rewardedAtMs: number } }
  }
}
```

### RewardEntry (공통)
```
{
  type: string,               // 카테고리명 (단, match는 아래 주의사항 참고)
  direction: 'gain' | 'loss',
  pin: number,
  ym: YM,
  createdAt: string,          // 'YYYYMMDDHHmm' 형태
  createdAtMs?: number,
  detail?: string             // referral: '이름 추천 가입', gallery: '사진 N장 이상 업로드'
}
```

### MatchRewardEntry
```
{
  type: 'pin' | 'rival' | 'match',  // ⚠️ 구 데이터: 'pin'/'rival', 신 데이터: 'match'
  opponentId: string,
  opponentName: string,
  result: 'win' | 'lose' | 'draw' | 'none',
  direction: 'gain' | 'loss',
  pin: number,
  ym: YM,
  createdAt: string,
  createdAtMs: number
}
```

> ⚠️ `rewards.match`의 `type` 필드 불일치: 구 데이터는 `'pin'`/`'rival'`로, 신 데이터는 `'match'`로 저장됨.  
> 카테고리 판단은 상위 key(`match`)를 기준으로 할 것.

### TargetRewardEntry
```
{
  type: 'target',
  myScore: number,
  target: number,
  achieved: boolean,
  special: boolean,
  direction: 'gain',
  pin: number,
  ym: YM,
  createdAt: string,
  createdAtMs: number
}
```

### AchievementRewardEntry
```
{
  type: 'achievement',
  detail: string,        // 콤마로 구분된 업적 key 목록 (예: 'participation_count_10, active_gallery_upload')
  direction: 'gain',
  pin: number,
  ym: YM,
  createdAt: string,
  createdAtMs: number
}
```
> `target`과 동일하게 `rewards/{ym}/achievement` 경로에 단일 객체로 직접 저장됨 (하위에 timestamp key 없음). `grantAchievementPinReward()`가 쓰기 전 `snap.exists()`로 중복 지급을 막기 때문에 월 1회만 기록됨.

---

## referrals/{empId}/

신규 가입 시 추천인을 입력한 경우 생성. `users/{empId}/referrer`에서 마이그레이션된 경로.

```
{
  refEmpId: string,          // 나를 추천한 사람의 empId
  referrerName: string,      // 추천인 이름 (가입 시점 캐시)
  rewarded?: boolean,        // 보상 지급 완료 여부 (중복 지급 방지)
  rewardedAt?: string,       // 보상 지급 시각 (YYYYMMDDHHmm)
  pin?: number               // 실제 지급된 핀 수량
}
```

- `rewarded: true` 이면 `applyReferralRewardIfNeeded()` 재실행 시 skip
- 추천인의 `invitedCount`는 `users/{refEmpId}/invitedCount`에서 관리
- 어드민 마이그레이션 버튼으로 기존 `users/*/referrer` 데이터 일괄 이전 가능

---

## names/{empId}

```
"20160774": "이규민"
```

`preloadAllNames()` + `getCachedUserName(empId)`으로 일괄 조회. 이름 변경 시 `users/{empId}/name`과 함께 갱신 필요.

> 정기전 관리(`/admin/league`)에서 이름 검색 기능이 이 경로를 직접 사용: `get(ref(db, 'names'))` 전체 로드 후 클라이언트 필터링.

---

## admins/{uid}

```
{
  empId: number,
  name: string
}
```

관리자 판별은 `auth.currentUser.uid`를 이 경로에서 조회(`checkAdminId()`).

---

## activityDate/{year}/{month}

```
YMD 숫자  예: 20260129
```

> ⚠️ **연도에 따라 저장 형태가 다름**  
> - 2025년: `{ "7": 20250730, "8": 20250827, ... }` — object, 월이 문자열 키  
> - 2026년: `[null, 20260129, 20260226, ...]` — array, index = 월 번호 (0번 null)  
>
> Firebase가 0부터 시작하는 정수 키를 자동으로 배열로 변환하기 때문. `snap.val()`을 그대로 사용하면 두 형태 모두 처리 가능.

---

## activityParticipants/{year}/{month}/{empId}

```
true
```

월별 활동에 참여한 회원 목록. `adjustPinsForCurrentMonth()`에서 PIN 지급 대상 조회에 사용.

---

## afterPartyParticipants/{year}/{month}/{empId}

```
true
```

월별 뒤풀이 참여 여부. 업적 조건(`participation_afterparty_N`) 계산에 사용.

---

## match/{ym}/{type}/{myId}/{targetId}

```
{
  chosenAt: number,    // ms timestamp
  message?: string
}
```

- `type`: `'rival'` | `'pin'`
- 월 최대 2명까지 선택 가능
- 상대방이 수락/거절 전 신청 상태를 나타냄

---

## matchResults/{ym}/{type}/{myId}/{opponentId}

```
{
  myScore: number,
  opponentScore: number,
  delta: number,
  result: 'win' | 'lose' | 'draw' | 'none',
  finalizedAt?: ServerTimestamp,
  pinUpdated?: boolean    // true면 PIN 처리 완료 — 중복 지급 방지 플래그
}
```

- `type`: `'rival'` | `'pin'`
- `rival` 매치는 PIN 변동 없음 (`delta` 있지만 PIN 적용 안 함)
- `saveMatchResult()`로 저장, `getUserMatchResults()`로 조회

---

## team/{yyyymm}/{groupId}/

정기전 경기 결과 저장 경로. 관리자가 `/admin/league`에서 입력.

```
{
  winner: 'team1' | 'team2' | 'draw',
  date: number,              // YYYYMMDD 숫자 (예: 20260518)
  team1: {
    [empId: string]: { name: string, score: number }
  },
  team2: {
    [empId: string]: { name: string, score: number }
  }
}
```

- `groupId`: `'A'` | `'B'` | `'C'` | `'D'` … (알파벳 순 자동 증가)
- empId를 키로 사용 → 나중에 팀 편성 기능 추가 시 재활용 가능
- `useActivityLeague(yyyymm)`: 전체 조 조회 후 현재 사용자 empId가 포함된 조만 필터링

---

## gallery/{ym}/{imageId}

```
{
  empId: string,
  url: string,
  caption: string,
  uploadedAt: string,          // 'YYYYMMDDHHmm' 형태
  likes: number | { [empId]: true },  // 숫자(레거시) 또는 empId 맵
  comments?: {
    [commentId]: {
      id: string,
      empId: string,
      userName: string,
      text: string,
      createdAt: number,       // ms timestamp
      parentId?: string,       // 대댓글 — 부모 commentId
      deleted?: true           // 소프트 삭제 (실제 데이터 유지)
    }
  }
}
```

- 좋아요: 클라이언트 낙관적 업데이트 + 250ms 디바운싱으로 배치 적용
- 댓글 소프트 삭제: `deleted: true` 플래그, 실제 노드는 유지

---

## products/{ym}/

```
{
  items: [
    {
      index: number,
      name: string,
      requiredPins: number,
      raffle: string[],       // 응모한 empId 목록
      winner?: string[]
    }
  ],
  meta: {
    drawOrder: number[],      // 추첨 순서 (item index 배열)
    generatedAt: number,
    status: 'done' | string,
    winnersReady: boolean
  },
  settings?: any
}
```

---

## eventConfig/

```
{
  menu: {
    draw:    { visible: boolean, ... },
    gallery: { visible: boolean, ... },
    history: { visible: boolean, ... },
    rank:    { visible: boolean, ... },
    reward:  { visible: boolean, ... },
    user:    { visible: boolean, ... }
  },
  matchType: 'rival' | 'pin',
  referralPin: number,         // 친구 추천 고정 보상 핀 (월별 설정과 무관)
  pinReward: {
    [ym: YM]: {
      achievement:   number,
      galleryUpload: number,
      pinMatch:      number,
      rivalMatch:    number,
      targetScore:   number
    }
  }
}
```

- `useEventStore.getPinRewardRate(key)`로 월별 보상 조회. key는 `'achievement'` | `'pinMatch'` | `'rivalMatch'` | `'targetScore'`
- `useEventStore.getReferralPin()`으로 추천 보상 조회 (루트 고정값, 월별 아님)

---

## missions/{yyyymm}/

활동 미션 기능 데이터. 관리자가 `/admin/mission`에서 입력.

```
{
  config: {
    title: string,                    // 전체 공개 미션 제목
    description: string,              // 전체 공개 미션 내용
    revealDays: number,               // 활동일 N일 전부터 공개 (기본값: 7)
    rewardPin: number,                // 보상 핀 수량
    helperVoteThreshold: number,      // 조력자 공동 수상 최소 득표수 (기본값: 3)
    status: 'draft' | 'active' | 'voting' | 'revealed'
  },
  hidden: {
    villain: { title: string, description: string },  // 빌런 전용 히든 미션
    helper:  { title: string, description: string }   // 조력자 전용 히든 미션
  },
  roles: {
    villain: string,    // empId (또랑 빌런)
    helper:  string,    // empId (빌런 조력자)
    assignedAt: number  // ms timestamp
  },
  votes: {
    [voterEmpId: string]: string  // 투표자 empId → 지목한 empId (1인 1표)
  },
  result: {
    revealed: boolean,
    revealedAt: number,
    villainWon: boolean,          // 빌런이 아무도 맞추지 못해 보상 수령
    helperWon:  boolean,          // 조력자도 공동 수상
    correctVoters: string[]       // 빌런 정답 맞춘 사람 empId 목록
  }
}
```

### 상태 전환 흐름
- `draft` → `active`: 관리자가 "미션 공개" 버튼 클릭
- `active` → `voting`: 관리자가 "투표 시작" 버튼 클릭
- `voting` → `revealed`: 관리자가 "결과 공개" 버튼 클릭 (보상 핀 자동 배분)

### 보상 로직
- 빌런 득표 ≥ 1: 정답 투표자 전원에게 `rewardPin` 지급
- 빌런 득표 = 0: 빌런에게 `rewardPin` 지급 + 조력자 득표 ≥ `helperVoteThreshold`이면 조력자도 지급
- 핀 저장 경로: `users/{empId}/rewards/{yyyymm}/mission/{timestamp}`
