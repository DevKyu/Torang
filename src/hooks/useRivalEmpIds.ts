import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db, waitForAuthUser, auth, empIdFromEmail } from '../services/firebase'

export type UseRivalEmpIdsResult = {
  rivalIds: Set<string>
  loading: boolean
}

export function useRivalEmpIds(ym: string): UseRivalEmpIdsResult {
  const [rivalIds, setRivalIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setRivalIds(new Set())
    setLoading(true)
    if (!ym) {
      setLoading(false)
      return
    }

    const unsubs: (() => void)[] = []
    let cancelled = false
    const resolved: Record<'rival' | 'pin', boolean> = { rival: false, pin: false }
    const tryFinish = () => {
      if (resolved.rival && resolved.pin) setLoading(false)
    }

    waitForAuthUser().then(() => {
      if (cancelled) return
      const myEmpId = empIdFromEmail(auth.currentUser?.email)
      if (!myEmpId) {
        setLoading(false)
        return
      }

      const snaps: [Record<string, unknown>, Record<string, unknown>] = [{}, {}]

      const merge = () => {
        const ids = new Set<string>()
        snaps.forEach((data) => Object.keys(data).forEach((id) => ids.add(id)))
        setRivalIds(ids)
      }

      ;(['rival', 'pin'] as const).forEach((type, i) => {
        unsubs.push(
          onValue(
            ref(db, `match/${ym}/${type}/${myEmpId}`),
            (snap) => {
              snaps[i] = snap.exists() ? snap.val() : {}
              merge()
              resolved[type] = true
              tryFinish()
            },
            () => {
              snaps[i] = {}
              merge()
              resolved[type] = true
              tryFinish()
            },
          ),
        )
      })
    })

    return () => {
      cancelled = true
      unsubs.forEach((u) => u())
    }
  }, [ym])

  return { rivalIds, loading }
}
