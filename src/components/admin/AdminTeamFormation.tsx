import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { ref, get, update, remove, push, set } from 'firebase/database'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AdminLayout from './AdminLayout'
import { db, fetchAllUsers } from '../../services/firebase'
import { useUiStore } from '../../stores/useUiStore'
import { SmallText } from '../../styles/commonStyle'
import { getRecent3Scores, calcAvg } from '../../utils/score'
import {
  generateTeams,
  formationGroupsToFirebase,
  firebaseToFormationGroups,
  calcGroupDiff,
  diffLevel,
  getPastYm,
  buildTeammatePenalties,
  type FormationGroup,
  type FormationPlayer,
  type RawFormationGroups,
  type TeamPairGroup,
} from '../../utils/teamFormation'
import {
  ControlRow,
  MonthSelect,
  LabeledInput,
  ActionRow,
  GenerateBtn,
  ShuffleBtn,
  ConfirmBtn,
  SaveDraftBtn,
  SnapshotList,
  SnapshotItem,
  SnapshotLabel,
  SnapshotLoadBtn,
  SnapshotDeleteBtn,
  ResetBtn,
  ClearBtn,
  ConfirmedBanner,
  GroupTabs,
  GroupTab,
  GroupCard,
  GroupHeader,
  GroupBadge,
  DiffChip,
  TeamsRow,
  TeamBlock,
  TeamLabel,
  TeamTotal,
  PlayerRow,
  PlayerAvg,
  EmptyMsg,
  ParticipantCount,
  EditToggleBtn,
  PlayerEditActions,
  MoveBtn,
  DeleteBtn,
  AddPlayerRow,
  PickerList,
  PickerItem,
  PickerEmpty,
  PickerCancel,
  GuestInputRow,
  GuestDivider,
  GuestBadge,
  PlayerNameCell,
  PlayerNameText,
  SaveImageBtn,
  CaptureHost,
  CaptureWrapper,
  CaptureTitle,
  CaptureCard,
} from '../../styles/AdminTeamFormationStyle'

type FormationStatus = 'none' | 'draft' | 'confirmed'

type SavedFormation = {
  status: FormationStatus
  limitScore: number
  defaultAverage: number
  groups: FormationGroup[]
  isLegacy?: boolean
}

type Snapshot = {
  id: string
  label: string
  savedAt: number
  groups: FormationGroup[]
}

const formatSavedAt = (ts: number) => {
  const d = new Date(ts)
  const mo = d.getMonth() + 1
  const da = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${mo}/${da} ${hh}:${mm}`
}

const AdminTeamFormation = () => {
  const navigate = useNavigate()

  const [currentYm] = useState(() => {
    const now = useUiStore.getState().getServerNow()
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const [ym, setYm] = useState(currentYm)
  const [limitScoreStr, setLimitScoreStr] = useState('10')
  const [defaultAverageStr, setDefaultAverageStr] = useState('80')
  const [iterationsStr, setIterationsStr] = useState('20000')
  const limitScore = Number(limitScoreStr) || 0
  const defaultAverage = Number(defaultAverageStr) || 0
  const iterations = Number(iterationsStr) || 20000

  const [saved, setSaved] = useState<SavedFormation | null>(null)
  const [draft, setDraft] = useState<FormationGroup[] | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])

  const [generating, setGenerating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [savingImage, setSavingImage] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const [activeGroupIdx, setActiveGroupIdx] = useState<number | null>(null)
  const shuffleKeyRef = useRef(0)
  const ymRef = useRef(ym)
  ymRef.current = ym
  const teammatePenaltiesRef = useRef<Map<string, number>>(new Map())

  const [editMode, setEditMode] = useState(false)
  const [allParticipants, setAllParticipants] = useState<FormationPlayer[]>([])
  const [addingTo, setAddingTo] = useState<{ groupIdx: number; team: '1' | '2' } | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestScore, setGuestScore] = useState('')

  const loadSaved = useCallback(async (requestedYm: string) => {
    try {
      const snap = await get(ref(db, `teamFormation/${requestedYm}`))
      if (ymRef.current !== requestedYm) return

      if (snap.exists()) {
        const data = snap.val() as {
          status?: FormationStatus
          limitScore?: number
          defaultAverage?: number
          groups?: RawFormationGroups
        }
        const groups = data.groups ? firebaseToFormationGroups(data.groups) : []
        setSaved({
          status: data.status ?? 'none',
          limitScore: data.limitScore ?? 10,
          defaultAverage: data.defaultAverage ?? 80,
          groups,
        })
        if (data.limitScore) setLimitScoreStr(String(data.limitScore))
        if (data.defaultAverage) setDefaultAverageStr(String(data.defaultAverage))
        if (data.status === 'draft' && groups.length > 0) setDraft(groups)
        return
      }

      const teamSnap = await get(ref(db, `team/${requestedYm}`))
      if (ymRef.current !== requestedYm) return

      if (teamSnap.exists()) {
        const raw = teamSnap.val() as Record<string, {
          winner?: string
          team1?: Record<string, { name: string; score1: number; score2: number; order?: number }>
          team2?: Record<string, { name: string; score1: number; score2: number; order?: number }>
        }>
        const groups = Object.keys(raw).sort().map(gid => {
          const g = raw[gid]
          const toPlayers = (members?: Record<string, { name: string; score1: number; score2: number }>) =>
            members
              ? Object.entries(members)
                  .map(([empId, p]) => ({
                    empId,
                    name: p.name,
                    average: p.score2 > 0 ? p.score2 : p.score1 > 0 ? p.score1 : 0,
                  }))
                  .sort((a, b) => b.average - a.average)
              : []
          return { team1: toPlayers(g.team1), team2: toPlayers(g.team2) }
        }).filter(g => g.team1.length > 0 || g.team2.length > 0)

        setSaved(groups.length > 0
          ? { status: 'confirmed', limitScore: 10, defaultAverage: 80, groups, isLegacy: true }
          : null
        )
      } else {
        setSaved(null)
      }
    } catch {
      if (ymRef.current === requestedYm) setSaved(null)
    }
  }, [])

  const loadSnapshots = useCallback(async (requestedYm: string) => {
    try {
      const snap = await get(ref(db, `teamFormation/${requestedYm}/snapshots`))
      if (ymRef.current !== requestedYm) return
      if (!snap.exists()) { setSnapshots([]); return }
      const raw = snap.val() as Record<string, { label: string; savedAt: number; groups: RawFormationGroups }>
      const list = Object.entries(raw)
        .map(([id, s]) => ({
          id,
          label: s.label,
          savedAt: s.savedAt,
          groups: firebaseToFormationGroups(s.groups),
        }))
        .sort((a, b) => a.savedAt - b.savedAt)
      setSnapshots(list)
    } catch {
      if (ymRef.current === requestedYm) setSnapshots([])
    }
  }, [])

  useEffect(() => {
    loadSaved(ym)
    loadSnapshots(ym)
    setDraft(null)
    setGenerating(false)
    setActiveGroupIdx(null)
    setEditMode(false)
    setAddingTo(null)
    setGuestName('')
    setGuestScore('')
    setAllParticipants([])
    setSnapshots([])
    teammatePenaltiesRef.current = new Map()
  }, [ym, loadSaved, loadSnapshots])

  const loadTeammatePenalties = useCallback(async (targetYm: string) => {
    try {
      const pastYms = [1, 2, 3].map((n) => getPastYm(targetYm, n))
      const snaps = await Promise.all(pastYms.map((pastYm) => get(ref(db, `team/${pastYm}`))))
      const monthlyTeams: TeamPairGroup[][] = snaps.map((snap) => {
        if (!snap.exists()) return []
        const raw = snap.val() as Record<string, {
          team1?: Record<string, unknown>
          team2?: Record<string, unknown>
        }>
        return Object.values(raw).map((g) => ({
          team1: g.team1 ? Object.keys(g.team1) : [],
          team2: g.team2 ? Object.keys(g.team2) : [],
        }))
      })
      return buildTeammatePenalties(monthlyTeams)
    } catch {
      return new Map<string, number>()
    }
  }, [])

  const handleGenerate = () => {
    const requestedYm = ym
    const year = ym.slice(0, 4)
    const month = String(Number(ym.slice(4)))

    setGenerating(true)

    setTimeout(async () => {
      try {
        const [participantSnap, allUsers, teammatePenalties] = await Promise.all([
          get(ref(db, `activityParticipants/${year}/${month}`)),
          fetchAllUsers(),
          loadTeammatePenalties(ym),
        ])

        if (ymRef.current !== requestedYm) return

        if (!participantSnap.exists()) {
          toast('이번 달 활동 참여자가 없습니다.', { position: 'top-center' })
          return
        }

        const participantIds = Object.keys(
          participantSnap.val() as Record<string, true>,
        )

        if (participantIds.length < 6) {
          toast(
            `참여자가 ${participantIds.length}명입니다. 최소 6명 이상 필요합니다.`,
            { position: 'top-center' },
          )
          return
        }

        const players: FormationPlayer[] = participantIds.map((empId) => {
          const user = allUsers[empId]
          const name = user?.name ?? empId
          let avg = defaultAverage
          if (user?.scores) {
            const recent = getRecent3Scores(user.scores)
            const computed = calcAvg(recent)
            if (computed !== null) avg = computed
          }
          return { empId, name, average: avg }
        })

        const result = generateTeams(players, limitScore, iterations, teammatePenalties)

        if ('error' in result) {
          toast(result.error, { position: 'top-center' })
          return
        }

        teammatePenaltiesRef.current = teammatePenalties
        setAllParticipants(players)
        const picked = result.candidates[Math.floor(Math.random() * result.candidates.length)]
        setDraft(picked)
        setEditMode(false)
        setAddingTo(null)
      } catch {
        if (ymRef.current === requestedYm) {
          toast.error('편성 중 오류가 발생했습니다.', { position: 'top-center' })
        }
      } finally {
        if (ymRef.current === requestedYm) setGenerating(false)
      }
    }, 20)
  }

  const handleShuffle = () => {
    if (!draft) return
    const requestedYm = ym
    const currentPlayers = draft.flatMap(g => [...g.team1, ...g.team2])
    setGenerating(true)
    setEditMode(false)
    setAddingTo(null)
    setTimeout(() => {
      if (ymRef.current !== requestedYm) return
      const result = generateTeams(currentPlayers, limitScore, iterations, teammatePenaltiesRef.current)
      if ('error' in result) {
        toast(result.error, { position: 'top-center' })
        setGenerating(false)
        return
      }
      shuffleKeyRef.current += 1
      const picked = result.candidates[Math.floor(Math.random() * result.candidates.length)]
      setDraft(picked)
      setGenerating(false)
    }, 20)
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    setSavingDraft(true)
    try {
      const rawGroups = formationGroupsToFirebase(draft)
      const maxNum = snapshots.reduce((m, s) => {
        const n = parseInt(s.label.replace('편성안 ', ''))
        return isNaN(n) ? m : Math.max(m, n)
      }, 0)
      const label = `편성안 ${maxNum + 1}`
      const snapshotRef = push(ref(db, `teamFormation/${ym}/snapshots`))
      await set(snapshotRef, { label, savedAt: useUiStore.getState().getServerNow().getTime(), groups: rawGroups })
      await loadSnapshots(ym)
      toast(`💾 ${label} 저장됨`, { position: 'top-center' })
    } catch {
      toast.error('저장 중 오류가 발생했습니다.', { position: 'top-center' })
    } finally {
      setSavingDraft(false)
    }
  }

  const handleLoadSnapshot = (snapshot: Snapshot) => {
    setDraft(snapshot.groups)
    setEditMode(false)
    setAddingTo(null)
    toast(`📂 ${snapshot.label} 불러옴`, { position: 'top-center' })
  }

  const handleDeleteSnapshot = async (id: string) => {
    try {
      await remove(ref(db, `teamFormation/${ym}/snapshots/${id}`))
      setSnapshots(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.', { position: 'top-center' })
    }
  }

  const handleConfirm = async () => {
    if (!draft) return
    if (draft.some(g => g.team1.length === 0 || g.team2.length === 0)) {
      toast('빈 팀이 있습니다. 모든 팀에 선수를 배정해주세요.', { position: 'top-center' })
      return
    }
    if (
      saved?.groups && saved.groups.length > 0 &&
      !window.confirm('팀 편성을 재확정하면 정기전 관리에서 입력된 점수가 초기화됩니다.\n계속하시겠습니까?')
    ) return
    setConfirming(true)

    try {
      const year = ym.slice(0, 4)
      const month = String(Number(ym.slice(4)))
      const dateSnap = await get(ref(db, `activityDate/${year}/${month}`))
      const activityDate = dateSnap.exists() ? (dateSnap.val() as number) : 0

      const rawGroups = formationGroupsToFirebase(draft)

      const teamNode: Record<string, unknown> = {}
      Object.entries(rawGroups).forEach(([groupId, g]) => {
        teamNode[groupId] = {
          date: activityDate,
          team1: Object.fromEntries(
            Object.entries(g.team1).map(([empId, m]) => [
              empId,
              { name: m.name, score1: 0, score2: 0, order: m.order },
            ]),
          ),
          team2: Object.fromEntries(
            Object.entries(g.team2).map(([empId, m]) => [
              empId,
              { name: m.name, score1: 0, score2: 0, order: m.order },
            ]),
          ),
        }
      })

      await update(ref(db), {
        [`team/${ym}`]: teamNode,
        [`teamFormation/${ym}/status`]: 'confirmed',
        [`teamFormation/${ym}/limitScore`]: limitScore,
        [`teamFormation/${ym}/defaultAverage`]: defaultAverage,
        [`teamFormation/${ym}/confirmedAt`]: useUiStore.getState().getServerNow().getTime(),
        [`teamFormation/${ym}/groups`]: rawGroups,
      })

      await loadSaved(ym)
      setDraft(null)
      setSnapshots([])
      setEditMode(false)
      setAddingTo(null)

      toast(`✅ ${Number(ym.slice(4))}월 팀 편성이 확정되었습니다.`, {
        position: 'top-center',
        duration: 2500,
        style: {
          backgroundColor: '#f0fdf4',
          color: '#065f46',
          borderRadius: '10px',
          fontSize: '0.875rem',
        },
      })
    } catch {
      toast.error('확정 중 오류가 발생했습니다.', { position: 'top-center' })
    } finally {
      setConfirming(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('팀 편성 확정을 취소하고 재편성 모드로 전환합니까?\n(정기전 관리에서 입력된 점수는 유지됩니다.)'))
      return
    setResetting(true)
    try {
      const prevGroups = displayGroups.length > 0 ? [...displayGroups] : null
      await update(ref(db, `teamFormation/${ym}`), { status: 'draft' })
      await Promise.all([loadSaved(ym), loadSnapshots(ym)])
      setDraft(prevGroups)
      setEditMode(false)
      setAddingTo(null)
      toast('재편성 모드로 전환되었습니다. 편집하거나 자동 편성을 다시 실행하세요.', { position: 'top-center' })
    } catch {
      toast.error('오류가 발생했습니다.', { position: 'top-center' })
    } finally {
      setResetting(false)
    }
  }

  const handleClear = async () => {
    if (!window.confirm(`${Number(ym.slice(4))}월 팀 편성 데이터를 완전히 삭제합니까?\n정기전 점수 데이터도 함께 삭제됩니다.\n삭제 후 복구할 수 없습니다.`))
      return
    setResetting(true)
    try {
      await Promise.all([
        remove(ref(db, `teamFormation/${ym}`)),
        remove(ref(db, `team/${ym}`)),
      ])
      await loadSaved(ym)
      setDraft(null)
      setSnapshots([])
      setEditMode(false)
      setAddingTo(null)
      toast('팀 편성이 초기화되었습니다.', { position: 'top-center' })
    } catch {
      toast.error('오류가 발생했습니다.', { position: 'top-center' })
    } finally {
      setResetting(false)
    }
  }

  const handleSaveImage = async () => {
    if (!captureRef.current || savingImage) return
    setSavingImage(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        skipFonts: true,
      })
      const link = document.createElement('a')
      link.download = `${ym.slice(0, 4)}년_${Number(ym.slice(4))}월_팀편성.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast.error('이미지 저장 중 오류가 발생했습니다.', { position: 'top-center' })
    } finally {
      setSavingImage(false)
    }
  }

  const monthOptions = useMemo(() => {
    const options: string[] = []
    const curY = Number(currentYm.slice(0, 4))
    const curM = Number(currentYm.slice(4))

    for (let y = 2025; y <= curY; y++) {
      const mStart = y === 2025 ? 7 : 1
      const mEnd = y === curY ? curM : 12
      for (let m = mStart; m <= mEnd; m++) {
        options.push(`${y}${String(m).padStart(2, '0')}`)
      }
    }
    return options.reverse()
  }, [currentYm])

  const movePlayer = useCallback((groupIdx: number, fromTeam: '1' | '2', empId: string) => {
    const fromKey = `team${fromTeam}` as 'team1' | 'team2'
    const toKey = fromTeam === '1' ? 'team2' : 'team1'
    setDraft(prev => {
      if (!prev) return prev
      return prev.map((g, i) => {
        if (i !== groupIdx) return g
        const player = g[fromKey].find(p => p.empId === empId)
        if (!player) return g
        return {
          ...g,
          [fromKey]: g[fromKey].filter(p => p.empId !== empId),
          [toKey]: [...g[toKey], player].sort((a, b) => b.average - a.average),
        }
      })
    })
  }, [])

  const removePlayer = useCallback((groupIdx: number, team: '1' | '2', empId: string) => {
    const teamKey = `team${team}` as 'team1' | 'team2'
    setDraft(prev => {
      if (!prev) return prev
      return prev.map((g, i) => {
        if (i !== groupIdx) return g
        return { ...g, [teamKey]: g[teamKey].filter(p => p.empId !== empId) }
      })
    })
    setAddingTo(null)
  }, [])

  const addGuest = useCallback((groupIdx: number, team: '1' | '2') => {
    const name = guestName.trim()
    const score = Number(guestScore) || 0
    if (!name) return
    const player: FormationPlayer = {
      empId: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      average: score,
    }
    const teamKey = `team${team}` as 'team1' | 'team2'
    setDraft(prev => {
      if (!prev) return prev
      return prev.map((g, i) => {
        if (i !== groupIdx) return g
        return {
          ...g,
          [teamKey]: [...g[teamKey], player].sort((a, b) => b.average - a.average),
        }
      })
    })
    setGuestName('')
    setGuestScore('')
    setAddingTo(null)
  }, [guestName, guestScore])

  const handleEditToggle = useCallback(async () => {
    if (!editMode && allParticipants.length === 0) {
      try {
        const year = ym.slice(0, 4)
        const month = String(Number(ym.slice(4)))
        const [snap, allUsers] = await Promise.all([
          get(ref(db, `activityParticipants/${year}/${month}`)),
          fetchAllUsers(),
        ])
        if (snap.exists()) {
          const ids = Object.keys(snap.val() as Record<string, true>)
          setAllParticipants(ids.map(empId => {
            const user = allUsers[empId]
            const name = user?.name ?? empId
            let avg = defaultAverage
            if (user?.scores) {
              const computed = calcAvg(getRecent3Scores(user.scores))
              if (computed !== null) avg = computed
            }
            return { empId, name, average: avg }
          }))
        }
      } catch {}
    }
    setEditMode(v => !v)
    setAddingTo(null)
    setGuestName('')
    setGuestScore('')
  }, [editMode, allParticipants.length, ym, defaultAverage])

  const addPlayer = useCallback((groupIdx: number, team: '1' | '2', player: FormationPlayer) => {
    const teamKey = `team${team}` as 'team1' | 'team2'
    setDraft(prev => {
      if (!prev) return prev
      return prev.map((g, i) => {
        if (i !== groupIdx) return g
        return {
          ...g,
          [teamKey]: [...g[teamKey], player].sort((a, b) => b.average - a.average),
        }
      })
    })
    setAddingTo(null)
  }, [])

  const displayGroups = draft ?? (saved?.groups ?? [])
  const isConfirmed = saved?.status === 'confirmed'
  const isLegacy = saved?.isLegacy ?? false

  const computeGroupStats = (group: FormationGroup) => {
    const t1Total = group.team1.reduce((a, p) => a + p.average, 0)
    const t2Total = group.team2.reduce((a, p) => a + p.average, 0)
    const t1Avg = group.team1.length ? Math.round(t1Total / group.team1.length) : 0
    const t2Avg = group.team2.length ? Math.round(t2Total / group.team2.length) : 0
    const diff = calcGroupDiff(group)
    const level = diffLevel(diff)
    return { t1Total, t2Total, t1Avg, t2Avg, diff, level }
  }

  const usedEmpIds = useMemo(() => {
    return new Set(displayGroups.flatMap(g => [...g.team1, ...g.team2].map(p => p.empId)))
  }, [displayGroups])

  const availableParticipants = useMemo(() => {
    return allParticipants.filter(p => !usedEmpIds.has(p.empId))
  }, [allParticipants, usedEmpIds])
  const showAll = activeGroupIdx === null
  const safeGroupIdx = activeGroupIdx !== null
    ? Math.min(activeGroupIdx, Math.max(0, displayGroups.length - 1))
    : 0
  const activeGroup = displayGroups[safeGroupIdx]
  const canExportImage = isConfirmed && displayGroups.length > 0

  const renderTeamBlock = (
    group: FormationGroup,
    gIdx: number,
    teamNum: '1' | '2',
    stats: ReturnType<typeof computeGroupStats>,
    interactive: boolean,
  ) => {
    const teamKey = `team${teamNum}` as 'team1' | 'team2'
    const players = group[teamKey]
    const total = teamNum === '1' ? stats.t1Total : stats.t2Total
    const avg = teamNum === '1' ? stats.t1Avg : stats.t2Avg
    const isAdding = addingTo?.groupIdx === gIdx && addingTo.team === teamNum

    return (
      <TeamBlock key={teamNum} team={teamNum}>
        <TeamLabel team={teamNum}>
          {teamNum}팀 <TeamTotal>총 {total}점 · 평균 {avg}점</TeamTotal>
        </TeamLabel>
        {players.map((p) => (
          <PlayerRow key={p.empId}>
            <PlayerNameCell>
              <PlayerNameText>{p.name}</PlayerNameText>
              {p.empId.startsWith('guest_') && <GuestBadge>게스트</GuestBadge>}
            </PlayerNameCell>
            <PlayerEditActions>
              <PlayerAvg>{p.average}점</PlayerAvg>
              {interactive && editMode && (
                <>
                  <MoveBtn onClick={() => movePlayer(gIdx, teamNum, p.empId)}>
                    →{teamNum === '1' ? '2' : '1'}팀
                  </MoveBtn>
                  <DeleteBtn onClick={() => removePlayer(gIdx, teamNum, p.empId)}>
                    ×
                  </DeleteBtn>
                </>
              )}
            </PlayerEditActions>
          </PlayerRow>
        ))}
        {interactive && editMode && (
          isAdding ? (
            <PickerList>
              {availableParticipants.length > 0 ? (
                availableParticipants.map(p => (
                  <PickerItem key={p.empId} onClick={() => addPlayer(gIdx, teamNum, p)}>
                    <span>{p.name}</span>
                    <PlayerAvg>{p.average}점</PlayerAvg>
                  </PickerItem>
                ))
              ) : (
                <PickerEmpty>미편성 참여자 없음</PickerEmpty>
              )}
              <GuestDivider>게스트 직접 입력</GuestDivider>
              <GuestInputRow>
                <input
                  placeholder="이름"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  onKeyDown={e => {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                    if (e.key === 'Enter') addGuest(gIdx, teamNum);
                  }}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="점수"
                  value={guestScore}
                  onChange={e => setGuestScore(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && addGuest(gIdx, teamNum)}
                />
                <button onClick={() => addGuest(gIdx, teamNum)}>추가</button>
              </GuestInputRow>
              <PickerCancel onClick={() => { setAddingTo(null); setGuestName(''); setGuestScore('') }}>취소</PickerCancel>
            </PickerList>
          ) : (
            <AddPlayerRow onClick={() => setAddingTo({ groupIdx: gIdx, team: teamNum })}>
              + 선수 추가
            </AddPlayerRow>
          )
        )}
      </TeamBlock>
    )
  }

  return (
    <AdminLayout title="팀 편성 관리">
      <ControlRow>
        <MonthSelect value={ym} onChange={(e) => setYm(e.target.value)}>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m.slice(0, 4)}년 {Number(m.slice(4))}월
            </option>
          ))}
        </MonthSelect>

        <LabeledInput>
          점수차 기준
          <input
            type="text"
            inputMode="numeric"
            value={limitScoreStr}
            onChange={(e) => setLimitScoreStr(e.target.value.replace(/[^\d]/g, ''))}
          />
          점
        </LabeledInput>

        <LabeledInput>
          기본 평균
          <input
            type="text"
            inputMode="numeric"
            value={defaultAverageStr}
            onChange={(e) => setDefaultAverageStr(e.target.value.replace(/[^\d]/g, ''))}
          />
          점
        </LabeledInput>

        <LabeledInput>
          반복 횟수
          <input
            type="text"
            inputMode="numeric"
            value={iterationsStr}
            onChange={(e) => setIterationsStr(e.target.value.replace(/[^\d]/g, ''))}
            style={{ width: 72 }}
          />
          회
        </LabeledInput>
      </ControlRow>

      {isConfirmed && !isLegacy && (
        <ConfirmedBanner>
          <span>✅ {Number(ym.slice(4))}월 팀 편성 확정됨</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {canExportImage && (
              <SaveImageBtn onClick={handleSaveImage} disabled={savingImage}>
                {savingImage ? '저장 중...' : '🖼️ 이미지'}
              </SaveImageBtn>
            )}
            <ResetBtn onClick={handleReset} disabled={resetting}>
              {resetting ? '처리 중...' : '재편성'}
            </ResetBtn>
            <ClearBtn onClick={handleClear} disabled={resetting}>
              초기화
            </ClearBtn>
          </div>
        </ConfirmedBanner>
      )}
      {isConfirmed && isLegacy && (
        <ConfirmedBanner>
          <span>📋 {Number(ym.slice(4))}월 정기전 기록 (읽기 전용)</span>
          {canExportImage && (
            <SaveImageBtn onClick={handleSaveImage} disabled={savingImage}>
              {savingImage ? '저장 중...' : '🖼️ 이미지'}
            </SaveImageBtn>
          )}
        </ConfirmedBanner>
      )}

      {!isConfirmed && (
        <ActionRow>
          {draft ? (
            <ShuffleBtn onClick={handleShuffle} disabled={generating}>
              {generating ? '편성 중...' : '🔀 섞기'}
            </ShuffleBtn>
          ) : (
            <GenerateBtn onClick={handleGenerate} disabled={generating}>
              {generating ? '편성 중...' : '🎲 자동 편성'}
            </GenerateBtn>
          )}
          {draft && (
            <>
              <EditToggleBtn active={editMode} onClick={handleEditToggle}>
                {editMode ? '✓ 완료' : '✏️ 편집'}
              </EditToggleBtn>
              <SaveDraftBtn onClick={handleSaveDraft} disabled={savingDraft || confirming}>
                {savingDraft ? '저장 중...' : '💾 저장'}
              </SaveDraftBtn>
              <ConfirmBtn onClick={handleConfirm} disabled={confirming || savingDraft}>
                {confirming ? '확정 중...' : '✅ 확정'}
              </ConfirmBtn>
            </>
          )}
        </ActionRow>
      )}

      {!isConfirmed && snapshots.length > 0 && (
        <SnapshotList>
          {snapshots.map(s => (
            <SnapshotItem key={s.id}>
              <SnapshotLabel>{s.label} · {formatSavedAt(s.savedAt)}</SnapshotLabel>
              <SnapshotLoadBtn onClick={() => handleLoadSnapshot(s)}>불러오기</SnapshotLoadBtn>
              <SnapshotDeleteBtn onClick={() => handleDeleteSnapshot(s.id)}>×</SnapshotDeleteBtn>
            </SnapshotItem>
          ))}
        </SnapshotList>
      )}

      {displayGroups.length > 0 ? (
        <>
          <ParticipantCount>
            총 {displayGroups.reduce((a, g) => a + g.team1.length + g.team2.length, 0)}명 · {displayGroups.length}조
          </ParticipantCount>

          <GroupTabs>
            <GroupTab active={showAll} onClick={() => setActiveGroupIdx(null)}>
              전체
            </GroupTab>
            {displayGroups.map((_, idx) => (
              <GroupTab
                key={idx}
                active={!showAll && safeGroupIdx === idx}
                onClick={() => setActiveGroupIdx(idx)}
              >
                {String.fromCharCode(65 + idx)}조
              </GroupTab>
            ))}
          </GroupTabs>

          {(showAll ? displayGroups : [activeGroup]).filter(Boolean).map((group, listIdx) => {
            const gIdx = showAll ? listIdx : safeGroupIdx
            const groupId = String.fromCharCode(65 + gIdx)
            const stats = computeGroupStats(group!)

            return (
              <GroupCard
                key={`${groupId}-${shuffleKeyRef.current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <GroupHeader>
                  <GroupBadge>{groupId}조</GroupBadge>
                  {!isLegacy && <DiffChip level={stats.level}>전력차 {stats.diff}점</DiffChip>}
                </GroupHeader>
                <TeamsRow>
                  {(['1', '2'] as const).map((teamNum) =>
                    renderTeamBlock(group!, gIdx, teamNum, stats, true),
                  )}
                </TeamsRow>
              </GroupCard>
            )
          })}
        </>
      ) : !generating && !isConfirmed ? (
        <EmptyMsg>활동 참여자를 기준으로 자동 편성을 시작하세요.</EmptyMsg>
      ) : null}

      {canExportImage && (
        <CaptureHost>
          <CaptureWrapper ref={captureRef}>
            <CaptureTitle>{Number(ym.slice(4))}월 팀 편성 🎳</CaptureTitle>
            {displayGroups.map((group, idx) => {
              const groupId = String.fromCharCode(65 + idx)
              const stats = computeGroupStats(group)

              return (
                <CaptureCard key={groupId}>
                  <GroupHeader>
                    <GroupBadge>{groupId}조</GroupBadge>
                    {!isLegacy && <DiffChip level={stats.level}>전력차 {stats.diff}점</DiffChip>}
                  </GroupHeader>
                  <TeamsRow forceTwoCol>
                    {(['1', '2'] as const).map((teamNum) =>
                      renderTeamBlock(group, idx, teamNum, stats, false),
                    )}
                  </TeamsRow>
                </CaptureCard>
              )
            })}
          </CaptureWrapper>
        </CaptureHost>
      )}

      <SmallText
        top="middle"
        onClick={() => navigate('/admin', { replace: true })}
      >
        돌아가기
      </SmallText>
    </AdminLayout>
  )
}

export default AdminTeamFormation
