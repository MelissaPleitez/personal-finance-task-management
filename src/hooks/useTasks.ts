import api from '@/lib/axios'
import type { Task } from '@/types/task.types'
import { TaskStatus } from '@/types/task.types'
import { useEffect, useState } from 'react'

interface TaskStatusTotals {
  taskCompleted: number
  taskOnGoing:   number
  taskStart:     number
}

const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskStatus, setTaskStatus] = useState<TaskStatusTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)

      const [tasksRes, statusRes] = await Promise.all([
        api.get<Task[]>(`/tasks`),
        api.get<TaskStatusTotals>('/tasks/total'),
      ])

      setTasks(tasksRes.data)
      setTaskStatus(statusRes.data)
    } catch {
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // ── derived values ──
const totalTasks     = tasks.length
const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length
const pendingTasks   = tasks.filter(t => t.status === TaskStatus.PENDING).length
const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length

  return {
    tasks,
    taskStatus,
    loading,
    error,
    refetch: fetchTasks,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
  }
}

export default useTasks