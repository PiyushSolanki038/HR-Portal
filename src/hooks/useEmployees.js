import { useData } from '../context/DataContext'
import { useCallback } from 'react'
import * as api from '../services/api'

export function useEmployees() {
  const { employees, setEmployees, refresh } = useData()

  const addEmployee = useCallback(async (data) => {
    await api.addEmployee(data)
    await refresh()
  }, [refresh])

  const updateEmployee = useCallback(async (id, data) => {
    await api.updateEmployee(id, data)
    await refresh()
  }, [refresh])

  return { employees, addEmployee, updateEmployee }
}
