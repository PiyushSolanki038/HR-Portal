import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'

export function useTasks(empId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTasks = useCallback(async () => {
    if (!empId) return
    setLoading(true)
    try {
      const data = await api.getEmployeeTasks(empId)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [empId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = useCallback(async (data) => {
    await api.addTask({ ...data, empId })
    await loadTasks()
  }, [empId, loadTasks])

  const toggleTask = useCallback(async (taskId) => {
    await api.toggleTask(taskId)
    await loadTasks()
  }, [loadTasks])

  return { tasks, loading, addTask, toggleTask, refresh: loadTasks }
}
