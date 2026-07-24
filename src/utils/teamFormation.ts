export type FormationPlayer = {
  empId: string
  name: string
  average: number
}

export type FormationGroup = {
  team1: FormationPlayer[]
  team2: FormationPlayer[]
}

export type FormationMember = {
  name: string
  average: number
  order: number
}

export type RawFormationGroups = Record<
  string,
  {
    team1: Record<string, FormationMember>
    team2: Record<string, FormationMember>
  }
>

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function autoPattern(n: number): number[] | null {
  const table: Record<number, number[]> = {
    6: [3, 3],
    7: [2, 2, 2, 1],
    8: [2, 2, 2, 2],
    9: [3, 3, 2, 1],
    10: [3, 3, 2, 2],
    11: [3, 3, 3, 2],
    12: [3, 3, 3, 3],
    13: [3, 3, 2, 2, 2, 1],
    14: [3, 3, 2, 2, 2, 2],
    15: [3, 3, 3, 3, 2, 1],
    16: [3, 3, 3, 3, 2, 2],
    17: [3, 3, 3, 3, 3, 2],
    18: [3, 3, 3, 3, 3, 3],
    19: [3, 3, 3, 3, 2, 2, 2, 1],
    20: [3, 3, 3, 3, 2, 2, 2, 2],
    21: [3, 3, 3, 3, 3, 3, 2, 1],
    22: [3, 3, 3, 3, 3, 3, 2, 2],
    23: [3, 3, 3, 3, 3, 3, 3, 2],
    24: [3, 3, 3, 3, 3, 3, 3, 3],
    25: [4, 3, 3, 3, 3, 3, 3, 3],
    26: [4, 4, 3, 3, 3, 3, 3, 3],
    27: [4, 4, 4, 3, 3, 3, 3, 3],
    28: [4, 4, 4, 4, 3, 3, 3, 3],
    29: [4, 4, 4, 4, 4, 3, 3, 3],
    30: [4, 4, 4, 4, 4, 4, 3, 3],
  }
  return table[n] ?? null
}

function buildGroups(
  players: FormationPlayer[],
  pattern: number[],
): FormationPlayer[][] | null {
  const groups: FormationPlayer[][] = []
  let idx = 0
  for (const size of pattern) {
    const team = players.slice(idx, idx + size)
    if (team.length !== size) return null
    groups.push(team)
    idx += size
  }
  return groups
}

function scoreTeam(team: FormationPlayer[]): { sum: number; avg: number } {
  const sum = team.reduce((a, b) => a + b.average, 0)
  return { sum, avg: sum / team.length }
}

const TEAMMATE_PENALTY_WEIGHTS_BY_MONTHS_AGO = [8, 4, 2]

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

const VALUE_CLUSTER_WEIGHT = 4

function valueClusterPenalty(team: FormationPlayer[]): number {
  const counts = new Map<number, number>()
  for (const p of team) counts.set(p.average, (counts.get(p.average) ?? 0) + 1)
  let penalty = 0
  for (const count of counts.values()) {
    if (count > 1) penalty += (count - 1) * (count - 1) * VALUE_CLUSTER_WEIGHT
  }
  return penalty
}

function hasClusteredTeam(groups: FormationPlayer[][]): boolean {
  return groups.some((team) => team.length >= 2 && team.every((p) => p.average === team[0].average))
}

function teammatePenalty(team: FormationPlayer[], penalties: Map<string, number>): number {
  if (penalties.size === 0) return 0
  let total = 0
  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      total += penalties.get(pairKey(team[i].empId, team[j].empId)) ?? 0
    }
  }
  return total
}

function totalTeammatePenalty(groups: FormationPlayer[][], penalties: Map<string, number>): number {
  return groups.reduce((sum, team) => sum + teammatePenalty(team, penalties), 0)
}

function calcPairScore(
  t1: FormationPlayer[],
  t2: FormationPlayer[],
  teammatePenalties: Map<string, number>,
): number {
  const A = scoreTeam(t1)
  const B = scoreTeam(t2)
  const diff = Math.abs(A.sum - B.sum)
  const varA =
    Math.sqrt(
      t1.reduce((acc, p) => acc + Math.pow(p.average - A.avg, 2), 0) /
        t1.length,
    ) || 0
  const varB =
    Math.sqrt(
      t2.reduce((acc, p) => acc + Math.pow(p.average - B.avg, 2), 0) /
        t2.length,
    ) || 0
  const penalty = teammatePenalty(t1, teammatePenalties) + teammatePenalty(t2, teammatePenalties)
  const valuePenalty = valueClusterPenalty(t1) + valueClusterPenalty(t2)
  return diff + (varA + varB) * 0.05 + penalty + valuePenalty
}

function totalPairScore(groups: FormationPlayer[][], teammatePenalties: Map<string, number>): number {
  const diffs: number[] = []
  for (let i = 0; i < groups.length; i += 2) {
    diffs.push(calcPairScore(groups[i], groups[i + 1], teammatePenalties))
  }
  const sum = diffs.reduce((a, b) => a + b, 0)
  const maxDiff = Math.max(...diffs)
  return sum + maxDiff * (1 + diffs.length * 0.25)
}

function rawGroupsToFormationGroups(
  rawGroups: FormationPlayer[][],
): FormationGroup[] {
  const result: FormationGroup[] = []
  for (let i = 0; i < rawGroups.length; i += 2) {
    result.push({
      team1: [...rawGroups[i]].sort((a, b) => b.average - a.average),
      team2: [...rawGroups[i + 1]].sort((a, b) => b.average - a.average),
    })
  }
  return result
}

function buildBalancedSeed(
  players: FormationPlayer[],
  pattern: number[],
): FormationPlayer[][] | null {
  const slots: FormationPlayer[][] = pattern.map(() => [])
  const sums = new Array(pattern.length).fill(0)

  for (const player of players) {
    let best = -1
    let bestSum = Infinity
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].length < pattern[i] && sums[i] < bestSum) {
        bestSum = sums[i]
        best = i
      }
    }
    if (best === -1) return null
    slots[best].push(player)
    sums[best] += player.average
  }

  return slots
}

function improveBySwap(
  groups: FormationPlayer[][],
  teammatePenalties: Map<string, number>,
): FormationPlayer[][] {
  let current = groups.map((g) => [...g])
  let currentScore = totalPairScore(current, teammatePenalties)
  let improved = true
  let guard = 100

  while (improved && guard-- > 0) {
    improved = false
    search: for (let gi = 0; gi + 1 < current.length; gi += 2) {
      const t1 = current[gi]
      const t2 = current[gi + 1]
      for (let i = 0; i < t1.length; i++) {
        for (let j = 0; j < t2.length; j++) {
          const nt1 = [...t1]
          const nt2 = [...t2]
          ;[nt1[i], nt2[j]] = [nt2[j], nt1[i]]
          const candidate = current.map((g, idx) =>
            idx === gi ? nt1 : idx === gi + 1 ? nt2 : g,
          )
          const candScore = totalPairScore(candidate, teammatePenalties)
          if (candScore < currentScore - 0.01) {
            current = candidate
            currentScore = candScore
            improved = true
            break search
          }
        }
      }
    }
  }
  return current
}

export function generateTeams(
  players: FormationPlayer[],
  limitScore: number,
  iterations = 20000,
  teammatePenalties: Map<string, number> = new Map(),
): { candidates: FormationGroup[][] } | { error: string } {
  const pattern = autoPattern(players.length)
  if (!pattern) {
    return { error: `${players.length}명은 편성 패턴을 지원하지 않습니다. (6~30명 지원)` }
  }

  const results: { groups: FormationPlayer[][]; score: number }[] = []

  const sortedDesc = [...players].sort((a, b) => b.average - a.average)
  const seed = buildBalancedSeed(sortedDesc, pattern)
  if (seed) {
    results.push({ groups: seed, score: totalPairScore(seed, teammatePenalties) })
    const seedOpt = improveBySwap(seed, teammatePenalties)
    results.push({ groups: seedOpt, score: totalPairScore(seedOpt, teammatePenalties) })
  }

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffleArray(players)
    const groups = buildGroups(shuffled, pattern)
    if (!groups) continue
    results.push({ groups, score: totalPairScore(groups, teammatePenalties) })
  }

  if (!results.length) return { error: '팀 편성 조합 생성에 실패했습니다.' }

  results.sort((a, b) => a.score - b.score)

  for (const r of results.slice(0, 300)) {
    const optimized = improveBySwap(r.groups, teammatePenalties)
    const newScore = totalPairScore(optimized, teammatePenalties)
    if (newScore < r.score - 0.01) {
      results.push({ groups: optimized, score: newScore })
    }
  }
  results.sort((a, b) => a.score - b.score)

  const filtered = results.filter((r) => {
    for (let i = 0; i + 1 < r.groups.length; i += 2) {
      const A = scoreTeam(r.groups[i])
      const B = scoreTeam(r.groups[i + 1])
      if (Math.abs(A.sum - B.sum) > limitScore) return false
    }
    return true
  })

  const ranked = filtered
    .map((r) => ({
      r,
      teammateTotal: totalTeammatePenalty(r.groups, teammatePenalties),
      clustered: hasClusteredTeam(r.groups),
    }))
    .sort((a, b) => {
      if (Math.abs(a.teammateTotal - b.teammateTotal) > 0.01) return a.teammateTotal - b.teammateTotal
      if (a.clustered !== b.clustered) return (a.clustered ? 1 : 0) - (b.clustered ? 1 : 0)
      return a.r.score - b.r.score
    })
    .map(({ r }) => r)

  if (!ranked.length) {
    const best = results[0]
    let maxDiff = 0
    for (let i = 0; i + 1 < best.groups.length; i += 2) {
      const A = scoreTeam(best.groups[i])
      const B = scoreTeam(best.groups[i + 1])
      maxDiff = Math.max(maxDiff, Math.abs(A.sum - B.sum))
    }
    return {
      error: `점수차 기준(${limitScore}점)을 만족하는 편성이 없습니다. 최선의 편성도 최대 ${maxDiff}점 차이입니다. 기준값을 ${maxDiff}점 이상으로 설정해주세요.`,
    }
  }

  const candidates = ranked.slice(0, 50).map((r) => rawGroupsToFormationGroups(r.groups))
  return { candidates }
}

export function formationGroupsToFirebase(groups: FormationGroup[]): RawFormationGroups {
  const result: RawFormationGroups = {}
  groups.forEach((group, idx) => {
    const groupId = String.fromCharCode(65 + idx)
    result[groupId] = {
      team1: Object.fromEntries(
        group.team1.map((p, i) => [
          p.empId,
          { name: p.name, average: p.average, order: i },
        ]),
      ),
      team2: Object.fromEntries(
        group.team2.map((p, i) => [
          p.empId,
          { name: p.name, average: p.average, order: i },
        ]),
      ),
    }
  })
  return result
}

export function firebaseToFormationGroups(
  raw: RawFormationGroups,
): FormationGroup[] {
  return Object.keys(raw)
    .sort()
    .map((groupId) => {
      const g = raw[groupId]
      const toSorted = (
        members: Record<string, FormationMember>,
      ): FormationPlayer[] =>
        Object.entries(members)
          .sort(([, a], [, b]) =>
            a.order !== undefined && b.order !== undefined
              ? a.order - b.order
              : b.average - a.average,
          )
          .map(([empId, m]) => ({ empId, name: m.name, average: m.average }))
      return {
        team1: toSorted(g.team1 ?? {}),
        team2: toSorted(g.team2 ?? {}),
      }
    })
}

export type TeamPairGroup = {
  team1: string[]
  team2: string[]
}

export function getPastYm(ym: string, monthsAgo: number): string {
  const year = Number(ym.slice(0, 4))
  const month = Number(ym.slice(4))
  const total = year * 12 + (month - 1) - monthsAgo
  const pastYear = Math.floor(total / 12)
  const pastMonth = (total % 12) + 1
  return `${pastYear}${String(pastMonth).padStart(2, '0')}`
}

export function buildTeammatePenalties(monthsAgoOrderedTeams: TeamPairGroup[][]): Map<string, number> {
  const penalties = new Map<string, number>()
  monthsAgoOrderedTeams.forEach((groups, monthsAgoIdx) => {
    const weight = TEAMMATE_PENALTY_WEIGHTS_BY_MONTHS_AGO[monthsAgoIdx] ?? 0
    if (weight <= 0) return
    groups.forEach(({ team1, team2 }) => {
      ;[team1, team2].forEach((team) => {
        for (let i = 0; i < team.length; i++) {
          for (let j = i + 1; j < team.length; j++) {
            const key = pairKey(team[i], team[j])
            penalties.set(key, (penalties.get(key) ?? 0) + weight)
          }
        }
      })
    })
  })
  return penalties
}

export function calcGroupDiff(group: FormationGroup): number {
  const s1 = group.team1.reduce((a, p) => a + p.average, 0)
  const s2 = group.team2.reduce((a, p) => a + p.average, 0)
  return Math.abs(s1 - s2)
}

export function diffLevel(diff: number): 'low' | 'mid' | 'high' {
  if (diff <= 3) return 'low'
  if (diff <= 7) return 'mid'
  return 'high'
}
