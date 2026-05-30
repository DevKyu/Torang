import { useEffect, useRef, useState } from 'react'
import { ref, onValue, get } from 'firebase/database'
import { db } from '../services/firebase'
import {
  firebaseToFormationGroups,
  type FormationGroup,
  type RawFormationGroups,
} from '../utils/teamFormation'

export type TeamFormationStatus = 'none' | 'draft' | 'confirmed'
export type WinnerMap = Record<string, 'team1' | 'team2' | 'draw'>

export type ScoreMap = Record<
  string,
  {
    team1: Record<string, [number, number]>
    team2: Record<string, [number, number]>
  }
>

type RawFormationData = {
  status?: TeamFormationStatus
  limitScore?: number
  defaultAverage?: number
  confirmedAt?: number
  groups?: RawFormationGroups
}

type RawTeamPlayer = {
  name: string
  score1: number
  score2: number
  order?: number
}

type RawTeamGroup = {
  winner?: string
  date?: number
  team1?: Record<string, RawTeamPlayer>
  team2?: Record<string, RawTeamPlayer>
}

type UseTeamFormationResult = {
  status: TeamFormationStatus
  groups: FormationGroup[]
  winnerMap: WinnerMap
  scoreMap: ScoreMap
  loading: boolean
  isLegacy: boolean
  error: boolean
}

function teamDataToFormationGroups(
  raw: Record<string, RawTeamGroup>,
): FormationGroup[] {
  const avgOf = (p: RawTeamPlayer) =>
    p.score2 > 0 ? p.score2 : p.score1 > 0 ? p.score1 : 0

  return Object.keys(raw)
    .sort()
    .map((groupId) => {
      const g = raw[groupId]
      const toPlayers = (
        members?: Record<string, RawTeamPlayer>,
      ): FormationGroup['team1'] =>
        members
          ? Object.entries(members)
              .sort(([, a], [, b]) =>
                a.order !== undefined && b.order !== undefined
                  ? a.order - b.order
                  : avgOf(b) - avgOf(a),
              )
              .map(([empId, p]) => ({ empId, name: p.name, average: avgOf(p) }))
          : []
      return {
        team1: toPlayers(g.team1),
        team2: toPlayers(g.team2),
      }
    })
}

export function useTeamFormation(ym: string): UseTeamFormationResult {
  const [status, setStatus] = useState<TeamFormationStatus>('none')
  const [groups, setGroups] = useState<FormationGroup[]>([])
  const [winnerMap, setWinnerMap] = useState<WinnerMap>({})
  const [scoreMap, setScoreMap] = useState<ScoreMap>({})
  const [loading, setLoading] = useState(true)
  const [isLegacy, setIsLegacy] = useState(false)
  const [error, setError] = useState(false)

  const resolved = useRef({ formation: false, team: false })

  useEffect(() => {
    if (!ym) return

    setLoading(true)
    setGroups([])
    setStatus('none')
    setWinnerMap({})
    setScoreMap({})
    setIsLegacy(false)
    setError(false)
    resolved.current = { formation: false, team: false }

    const tryFinish = () => {
      if (resolved.current.formation && resolved.current.team) {
        setLoading(false)
      }
    }

    const unsubTeam = onValue(
      ref(db, `team/${ym}`),
      (snap) => {
        if (snap.exists()) {
          const raw = snap.val() as Record<
            string,
            { winner?: string; team1?: Record<string, RawTeamPlayer>; team2?: Record<string, RawTeamPlayer> }
          >

          const newWinnerMap: WinnerMap = {}
          const newScoreMap: ScoreMap = {}

          Object.entries(raw).forEach(([gid, g]) => {
            if (g.winner === 'team1' || g.winner === 'team2' || g.winner === 'draw') {
              newWinnerMap[gid] = g.winner
            }
            newScoreMap[gid] = {
              team1: Object.fromEntries(
                Object.entries(g.team1 ?? {}).map(([empId, p]) => [
                  empId,
                  [p.score1 ?? 0, p.score2 ?? 0] as [number, number],
                ]),
              ),
              team2: Object.fromEntries(
                Object.entries(g.team2 ?? {}).map(([empId, p]) => [
                  empId,
                  [p.score1 ?? 0, p.score2 ?? 0] as [number, number],
                ]),
              ),
            }
          })

          setWinnerMap(newWinnerMap)
          setScoreMap(newScoreMap)
        } else {
          setWinnerMap({})
          setScoreMap({})
        }
        resolved.current.team = true
        tryFinish()
      },
      () => {
        resolved.current.team = true
        tryFinish()
      },
    )

    let cancelled = false

    const unsubFormation = onValue(
      ref(db, `teamFormation/${ym}`),
      async (snap) => {
        if (cancelled) return
        if (snap.exists()) {
          const data = snap.val() as RawFormationData
          setStatus(data.status ?? 'none')
          setGroups(data.groups ? firebaseToFormationGroups(data.groups) : [])
          setIsLegacy(false)
        } else {
          try {
            const teamSnap = await get(ref(db, `team/${ym}`))
            if (cancelled) return
            if (teamSnap.exists()) {
              const rawTeams = teamSnap.val() as Record<string, RawTeamGroup>
              const converted = teamDataToFormationGroups(rawTeams)
              const valid = converted.filter(
                (g) => g.team1.length > 0 || g.team2.length > 0,
              )
              setGroups(valid)
              setIsLegacy(valid.length > 0)
              setStatus(valid.length > 0 ? 'confirmed' : 'none')
            } else {
              setStatus('none')
              setGroups([])
              setIsLegacy(false)
            }
          } catch {
            if (cancelled) return
            setStatus('none')
            setGroups([])
            setIsLegacy(false)
            setError(true)
          }
        }
        if (!cancelled) {
          resolved.current.formation = true
          tryFinish()
        }
      },
      () => {
        if (cancelled) return
        setStatus('none')
        setGroups([])
        setIsLegacy(false)
        setError(true)
        resolved.current.formation = true
        tryFinish()
      },
    )

    return () => {
      cancelled = true
      unsubFormation()
      unsubTeam()
    }
  }, [ym])

  return { status, groups, winnerMap, scoreMap, loading, isLegacy, error }
}
