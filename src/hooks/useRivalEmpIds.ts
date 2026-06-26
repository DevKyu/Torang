import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db, waitForAuthUser, auth, empIdFromEmail } from '../services/firebase'

export function useRivalEmpIds(ym: string): Set<string> {
  const [rivalIds, setRivalIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!ym) return

    const unsubs: (() => void)[] = []
    let cancelled = false

    waitForAuthUser().then(() => {
      if (cancelled) return
      const myEmpId = empIdFromEmail(auth.currentUser?.email)
      if (!myEmpId) return

      const snaps: [Record<string, unknown>, Record<string, unknown>] = [{}, {}]

      const merge = () => {
        const ids = new Set<string>()
        snaps.forEach((data) => Object.keys(data).forEach((id) => ids.add(id)))
        setRivalIds(ids)
      }

      ;(['rival', 'pin'] as const).forEach((type, i) => {
        unsubs.push(
          onValue(ref(db, `match/${ym}/${type}/${myEmpId}`), (snap) => {
            snaps[i] = snap.exists() ? snap.val() : {}
            merge()
          }),
        )
      })
    })

    return () => {
      cancelled = true
      unsubs.forEach((u) => u())
    }
  }, [ym])

  return rivalIds
}
