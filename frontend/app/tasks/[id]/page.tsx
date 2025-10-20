'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AgentCard } from '@/components/agents/AgentCard'
import { Task, TaskStatus, WebSocketEvent, EventType } from '@/types'
import { apiClient } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { getTaskStatusLabel, getTaskStatusColor, getTaskProgress, formatRelativeTime, formatDuration } from '@/lib/utils'
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Clock, Users, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false)

  // WebSocket for real-time updates
  const { isConnected, lastEvent } = useWebSocket({
    taskId,
    onEvent: (event: WebSocketEvent) => {
      console.log('Task event:', event)
      handleWebSocketEvent(event)
    },
    autoConnect: true,
  })

  useEffect(() => {
    if (taskId) {
      loadTask()
    }
  }, [taskId])

  const loadTask = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getTask(taskId)
      if (response.success && response.data) {
        setTask(response.data)
      }
    } catch (error) {
      console.error('Failed to load task:', error)
      alert('Не удалось загрузить задачу')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWebSocketEvent = (event: WebSocketEvent) => {
    if (event.taskId !== taskId) return

    // Update task based on event
    switch (event.type) {
      case EventType.TASK_UPDATED:
      case EventType.TASK_STATUS_CHANGED:
      case EventType.AGENT_ASSIGNED:
      case EventType.AGENT_STATUS_CHANGED:
      case EventType.SUBTASK_COMPLETED:
      case EventType.SYNTHESIS_COMPLETED:
      case EventType.TASK_COMPLETED:
        loadTask()
        break
    }
  }

  const handleRevisionSubmit = async () => {
    if (!task || !revisionFeedback.trim()) return

    setIsSubmittingRevision(true)
    try {
      const response = await apiClient.reviseTask({
        taskId: task.id,
        feedback: revisionFeedback,
      })

      if (response.success) {
        setRevisionFeedback('')
        setShowRevisionForm(false)
        loadTask()
      }
    } catch (error) {
      console.error('Failed to submit revision:', error)
      alert('Не удалось отправить на доработку')
    } finally {
      setIsSubmittingRevision(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Загрузка задачи...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg font-semibold mb-2">Задача не найдена</p>
          <Button onClick={() => router.push('/')}>Вернуться на главную</Button>
        </div>
      </div>
    )
  }

  const progress = getTaskProgress(task.status)
  const statusLabel = getTaskStatusLabel(task.status)
  const statusColor = getTaskStatusColor(task.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{task.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn('gap-1', statusColor)}>
                    {statusLabel}
                  </Badge>
                  {isConnected && (
                    <Badge variant="outline" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={loadTask}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle>Описание задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Прогресс выполнения</CardTitle>
                  <span className="text-2xl font-bold text-primary">{progress}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {statusLabel}
                </p>
              </CardContent>
            </Card>

            {/* Agents */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Работающие агенты</CardTitle>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {task.agents.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {task.agents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Агенты еще не назначены
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <AnimatePresence>
                      {task.agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} compact />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Final Answer */}
            {task.finalAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-green-500">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <CardTitle>Итоговый ответ</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap">{task.finalAnswer}</div>
                    </div>

                    {task.status === TaskStatus.COMPLETED && (
                      <div className="mt-6 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowRevisionForm(!showRevisionForm)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Отправить на доработку
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Revision Form */}
            {showRevisionForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Запросить доработку</CardTitle>
                    <CardDescription>
                      Опишите, что нужно изменить или дополнить
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Например: Добавьте больше деталей о производительности системы..."
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />

                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={handleRevisionSubmit}
                        disabled={!revisionFeedback.trim() || isSubmittingRevision}
                      >
                        {isSubmittingRevision ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            Отправка...
                          </>
                        ) : (
                          'Отправить на доработку'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRevisionForm(false)
                          setRevisionFeedback('')
                        }}
                      >
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta Info */}
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Создана</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatRelativeTime(task.createdAt)}</span>
                  </div>
                </div>

                {task.completedAt && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Завершена</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{formatRelativeTime(task.completedAt)}</span>
                    </div>
                  </div>
                )}

                {task.actualDuration && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Время выполнения</div>
                    <div className="text-sm font-medium">
                      {formatDuration(task.actualDuration)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Приоритет</div>
                  <Badge>{task.priority}</Badge>
                </div>

                {task.revisionCount > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Доработки</div>
                    <Badge variant="outline">{task.revisionCount}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Активность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lastEvent && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm"
                    >
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        <div>
                          <p className="font-medium">{lastEvent.message || 'Обновление'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(lastEvent.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="text-sm text-muted-foreground text-center py-4">
                    Обновления в реальном времени
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
