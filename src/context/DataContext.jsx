import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import * as api from '../services/api'
import { useToast } from './ToastContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { showToast } = useToast()
  const [employees,  setEmployees]  = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves,     setLeaves]     = useState([])
  const [tasks,      setTasks]      = useState([])
  const [mentors,    setMentors]    = useState([])
  const [governance, setGovernance] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState({})
  const [notifications, setNotifications] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  
  const lastNotifId = useRef(null)
  const isInitialLoad = useRef(true)

  // Store userId so refresh() always has it without needing args
  const userIdRef = useRef(null)

  const loadAll = useCallback(async (userId) => {
    // Accept explicit userId or fall back to stored one
    const uid = userId !== undefined ? userId : userIdRef.current
    if (userId !== undefined) userIdRef.current = userId

    try {
      if (isInitialLoad.current) setLoading(true)

      // Batch: fetch ALL sheet data in a SINGLE HTTP call
      const [batchR, ntfsR] = await Promise.allSettled([
        api.getAllData(),
        uid ? api.getNotifications(uid) : Promise.resolve([]),
      ])

      if (batchR.status === 'fulfilled') {
        const d = batchR.value
        setEmployees(d.Employees || employees)
        setAttendance(d.Attendance || attendance)
        setLeaves(d.Leaves || leaves)
        setMentors(d.Mentors || mentors)
        setTasks(d.Tasks || tasks)
        setGovernance(d.Governance || governance)
        setAuditLogs(d.Audit || auditLogs)
      } else {
        if (isInitialLoad.current) console.error('[DATA_LOAD_ERROR] Batch:', batchR.reason)
        showToast('Some data failed to load. Check connection.', 'error')
      }

      // Attendance summary still needs its own call (computed server-side)
      try {
        const summ = await api.getAttendanceSummary()
        setAttendanceSummary(summ)
      } catch (summErr) {
        if (isInitialLoad.current) console.error('[DATA_LOAD_ERROR] Summary:', summErr)
      }

      const ntfs = ntfsR.status === 'fulfilled' ? ntfsR.value : notifications

      // Notification Detection Logic
      if (ntfs && ntfs.length > 0) {
        const unreadNtfs = ntfs.filter(n => n.read === 'false' || n.read === false)
        const highestId = Math.max(...ntfs.map(n => parseInt(n.id) || 0))
        
        if (!isInitialLoad.current && lastNotifId.current !== null) {
          const newUnread = unreadNtfs.filter(n => (parseInt(n.id) || 0) > lastNotifId.current)
          newUnread.forEach(n => {
            showToast(n.message || 'New notification received', 'info')
          })
        }
        lastNotifId.current = highestId
      }
      
      setNotifications(ntfs)
      setError(null)
      isInitialLoad.current = false
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showToast]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const saved = localStorage.getItem('siswit_user')
    const user = saved ? JSON.parse(saved) : null
    
    loadAll(user?.id)
    
    // Notification Polling every 60s (matches backend cache TTL)
    const ntfsInterval = setInterval(() => {
      loadAll()
    }, 60000)

    return () => clearInterval(ntfsInterval)
  }, [loadAll])

  return (
    <DataContext.Provider value={{
      employees, setEmployees,
      attendance, setAttendance,
      leaves, setLeaves,
      tasks, setTasks,
      mentors, setMentors,
      governance, setGovernance,
      auditLogs, setAuditLogs,
      attendanceSummary, setAttendanceSummary,
      notifications, setNotifications,
      loading, error,
      refresh: loadAll
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() { return useContext(DataContext) }
