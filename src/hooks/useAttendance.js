import { useData } from '../context/DataContext'
import { useState, useEffect } from 'react'
import * as api from '../services/api'

export function useAttendance() {
  const { attendance } = useData()
  const [weeklyGrid, setWeeklyGrid] = useState([])

  useEffect(() => {
    api.getWeeklyGrid().then(setWeeklyGrid).catch(() => {})
  }, [])

  return { attendance, weeklyGrid }
}
