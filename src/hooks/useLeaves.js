import { useData } from '../context/DataContext'
import { useCallback } from 'react'
import * as api from '../services/api'

export function useLeaves() {
  const { leaves, setLeaves, refresh } = useData()

  const approve = useCallback(async (id, approvedBy) => {
    await api.approveLeave(id, { approvedBy })
    await refresh()
  }, [refresh])

  const reject = useCallback(async (id, rejectedBy, reason) => {
    await api.rejectLeave(id, { rejectedBy, reason })
    await refresh()
  }, [refresh])

  const pending = leaves.filter(l => l.status === 'pending')

  return { leaves, pending, approve, reject }
}
