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

      // Use allSettled so one failing endpoint never blocks the others
      const [empsR, attR, lvsR, mntR, tksR, summR, ntfsR, govR, audR] = await Promise.allSettled([
        api.getEmployees(),
        api.getTodayAttendance(),
        api.getLeaves(),
        api.getMentors(),
        api.getTasks(),
        api.getAttendanceSummary(),
        uid ? api.getNotifications(uid) : Promise.resolve([]),
        api.getGovernance(),
        api.getAuditLog()
      ])

      const pick = (result, fallback) =>
        result.status === 'fulfilled' ? result.value : fallback

      const emps = pick(empsR, employees)
      const att  = pick(attR,  attendance)
      const lvs  = pick(lvsR,  leaves)
      const mnt  = pick(mntR,  mentors)
      const tks  = pick(tksR,  tasks)
      const summ = pick(summR, attendanceSummary)
      const ntfs = pick(ntfsR, notifications)
      const gov  = pick(govR,  governance)
      const aud  = pick(audR,  auditLogs)

      setEmployees(emps)
      setAttendance(att)
      setLeaves(lvs)
      setMentors(mnt)
      setTasks(tks)
      setGovernance(gov)
      setAuditLogs(aud)
      setAttendanceSummary(summ)
      
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
    
    // Notification Polling every 45s
    const ntfsInterval = setInterval(() => {
      loadAll()
    }, 15000)

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
