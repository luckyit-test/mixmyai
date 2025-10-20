'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Task, TaskPriority } from '@/types'
import { getTaskStatusColor, getTaskStatusLabel, getTaskProgress, formatRelativeTime, truncateText } from '@/lib/utils'
import { Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-500',
  [TaskPriority.MEDIUM]: 'bg-blue-500',
  [TaskPriority.HIGH]: 'bg-orange-500',
  [TaskPriority.URGENT]: 'bg-red-500',
}

const priorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Низкий',
  [TaskPriority.MEDIUM]: 'Средний',
  [TaskPriority.HIGH]: 'Высокий',
  [TaskPriority.URGENT]: 'Срочный',
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const progress = getTaskProgress(task.status)
  const statusLabel = getTaskStatusLabel(task.status)
  const statusColor = getTaskStatusColor(task.status)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{task.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {truncateText(task.description, 100)}
              </CardDescription>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge className={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
              {task.revisionCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Доработка {task.revisionCount}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Статус</span>
              <span className={cn('text-sm font-medium', statusColor)}>
                {statusLabel}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Meta information */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(task.createdAt)}</span>
              </div>

              {task.agents.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{task.agents.length} агентов</span>
                </div>
              )}
            </div>

            {/* Completion indicator */}
            {task.completedAt && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Завершено {formatRelativeTime(task.completedAt)}</span>
              </div>
            )}

            {/* Active agents preview */}
            {task.agents.length > 0 && !task.completedAt && (
              <div className="flex -space-x-2 overflow-hidden">
                {task.agents.slice(0, 5).map((agent) => (
                  <div
                    key={agent.id}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-gradient-to-r from-primary to-blue-500"
                    title={agent.name}
                  >
                    <div className="flex h-full w-full items-center justify-center text-xs text-white font-semibold">
                      {agent.name.charAt(0)}
                    </div>
                  </div>
                ))}
                {task.agents.length > 5 && (
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-medium">
                    +{task.agents.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
