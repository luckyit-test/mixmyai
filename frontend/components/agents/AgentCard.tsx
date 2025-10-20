'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Agent, AgentType, AgentStatus } from '@/types'
import { getAgentColor, getAgentGradient } from '@/lib/utils'
import { Brain, Code, GitMerge, BarChart3, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  compact?: boolean
}

const agentIcons: Record<AgentType, React.ReactNode> = {
  [AgentType.MANAGER]: <Brain className="w-5 h-5" />,
  [AgentType.SPECIALIST]: <Code className="w-5 h-5" />,
  [AgentType.COORDINATOR]: <GitMerge className="w-5 h-5" />,
  [AgentType.ANALYST]: <BarChart3 className="w-5 h-5" />,
}

const statusIcons: Record<AgentStatus, React.ReactNode> = {
  [AgentStatus.IDLE]: null,
  [AgentStatus.THINKING]: <Loader2 className="w-4 h-4 animate-spin" />,
  [AgentStatus.WORKING]: <Loader2 className="w-4 h-4 animate-spin" />,
  [AgentStatus.REVIEWING]: <Loader2 className="w-4 h-4 animate-spin" />,
  [AgentStatus.COMPLETED]: <CheckCircle2 className="w-4 h-4" />,
  [AgentStatus.ERROR]: <AlertCircle className="w-4 h-4" />,
}

const statusLabels: Record<AgentStatus, string> = {
  [AgentStatus.IDLE]: 'Ожидание',
  [AgentStatus.THINKING]: 'Обдумывает',
  [AgentStatus.WORKING]: 'Работает',
  [AgentStatus.REVIEWING]: 'Проверяет',
  [AgentStatus.COMPLETED]: 'Завершил',
  [AgentStatus.ERROR]: 'Ошибка',
}

const statusColors: Record<AgentStatus, string> = {
  [AgentStatus.IDLE]: 'text-gray-500',
  [AgentStatus.THINKING]: 'text-blue-500',
  [AgentStatus.WORKING]: 'text-purple-500',
  [AgentStatus.REVIEWING]: 'text-orange-500',
  [AgentStatus.COMPLETED]: 'text-green-500',
  [AgentStatus.ERROR]: 'text-red-500',
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, compact = false }) => {
  const gradient = getAgentGradient(agent.type)
  const color = getAgentColor(agent.type)
  const isActive = [AgentStatus.THINKING, AgentStatus.WORKING, AgentStatus.REVIEWING].includes(agent.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-all hover:shadow-lg',
          isActive && 'ring-2 ring-primary ring-opacity-50',
          compact ? 'p-4' : ''
        )}
        style={{
          borderColor: color,
          boxShadow: isActive ? `0 0 20px ${color}33` : undefined,
        }}
      >
        {/* Animated background gradient */}
        {isActive && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r opacity-5',
              gradient
            )}
          />
        )}

        {compact ? (
          <div className="relative flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r text-white',
                gradient
              )}
            >
              {agentIcons[agent.type]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{agent.name}</h4>
                {agent.role && (
                  <Badge variant="outline" className="text-xs">
                    {agent.role}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs', statusColors[agent.status])}>
                  {statusLabels[agent.status]}
                </span>
                {agent.progress !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {agent.progress}%
                  </span>
                )}
              </div>
            </div>

            {statusIcons[agent.status] && (
              <div className={statusColors[agent.status]}>
                {statusIcons[agent.status]}
              </div>
            )}
          </div>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-lg',
                      gradient
                    )}
                  >
                    {agentIcons[agent.type]}
                  </div>

                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    {agent.role && (
                      <Badge variant="outline" className="mt-1">
                        {agent.role}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statusIcons[agent.status] && (
                    <div className={statusColors[agent.status]}>
                      {statusIcons[agent.status]}
                    </div>
                  )}
                  <span className={cn('text-sm font-medium', statusColors[agent.status])}>
                    {statusLabels[agent.status]}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {agent.currentAction && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">
                    {agent.currentAction}
                  </p>
                </div>
              )}

              {agent.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-medium">{agent.progress}%</span>
                  </div>
                  <Progress value={agent.progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  )
}
