'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Task, TaskStatus, CreateTaskInput, DashboardStats } from '@/types'
import { apiClient } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Brain, CheckCircle2, Clock, TrendingUp, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // WebSocket connection for real-time updates
  useWebSocket({
    onEvent: (event) => {
      console.log('Dashboard event:', event)
      // Reload tasks when updates occur
      loadTasks()
    },
    autoConnect: true,
  })

  useEffect(() => {
    loadTasks()
    loadStats()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await apiClient.getActiveTasks()
      if (response.success && response.data) {
        setTasks(response.data)
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiClient.getDashboardStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    setIsLoading(true)
    try {
      const response = await apiClient.createTask(input)
      if (response.success && response.data) {
        // Navigate to task detail page
        router.push(`/tasks/${response.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Не удалось создать задачу. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">MixMyAI</h1>
                <p className="text-sm text-muted-foreground">
                  Мультиагентная AI платформа
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Система активна
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего задач
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  За все время
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Активные задачи
                </CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.activeTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  В работе сейчас
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Завершено
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.completedTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Успешно выполнено
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Эффективность
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.successRate ? `${stats.successRate.toFixed(0)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Успешных решений
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Task Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <CreateTaskForm onSubmit={handleCreateTask} isLoading={isLoading} />
          </motion.div>

          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Последние задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Пока нет задач</p>
                      <p className="text-sm mt-1">Создайте первую задачу</p>
                    </div>
                  ) : (
                    tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="cursor-pointer" onClick={() => handleTaskClick(task.id)}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.agents.length} агентов
                            </p>
                          </div>
                          <Badge variant={task.status === TaskStatus.COMPLETED ? 'success' : 'default'} className="ml-2">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* All Active Tasks */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-6">Активные задачи</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 MixMyAI. Все права защищены.</p>
            <p>Powered by AI Agents</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
