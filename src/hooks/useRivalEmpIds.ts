import { useEffect, useState } from 'react'
import { ref, get } from 'firebase/database'
import { db, auth, empIdFromEmail } from '../services/firebase'

export function useRivalEmpIds(ym: string): Set<string> {
  const [rivalIds, setRivalIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const myEmpId = empIdFromEmail(auth.currentUser?.email)
    if (!myEmpId || !ym) return

    let cancelled = false

    Promise.all([
      get(ref(db, `match/${ym}/rival/${myEmpId}`)),
      get(ref(db, `match/${ym}/pin/${myEmpId}`)),
    ])
      .then(([rivalSnap, pinSnap]) => {
        if (cancelled) return
        const ids = new Set<string>()
        if (rivalSnap.exists()) Object.keys(rivalSnap.val()).forEach((id) => ids.add(id))
        if (pinSnap.exists()) Object.keys(pinSnap.val()).forEach((id) => ids.add(id))
        setRivalIds(ids)
      })
      .catch(() => {
        if (!cancelled) setRivalIds(new Set())
      })

    return () => { cancelled = true }
  }, [ym])

  return rivalIds
}
