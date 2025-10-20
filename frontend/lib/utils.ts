import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AgentType, TaskStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'только что'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн назад`

  return formatDate(d)
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} сек`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (minutes === 0) return `${hours} ч`
  return `${hours} ч ${minutes} мин`
}

export function getAgentColor(agentType: AgentType): string {
  const colors: Record<AgentType, string> = {
    [AgentType.MANAGER]: 'hsl(262, 83%, 58%)',
    [AgentType.SPECIALIST]: 'hsl(217, 91%, 60%)',
    [AgentType.COORDINATOR]: 'hsl(142, 71%, 45%)',
    [AgentType.ANALYST]: 'hsl(48, 96%, 53%)',
  }
  return colors[agentType]
}

export function getAgentGradient(agentType: AgentType): string {
  const gradients: Record<AgentType, string> = {
    [AgentType.MANAGER]: 'from-purple-500 to-indigo-600',
    [AgentType.SPECIALIST]: 'from-blue-500 to-cyan-600',
    [AgentType.COORDINATOR]: 'from-green-500 to-emerald-600',
    [AgentType.ANALYST]: 'from-yellow-400 to-orange-500',
  }
  return gradients[agentType]
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'text-gray-500',
    [TaskStatus.ANALYZING]: 'text-blue-500',
    [TaskStatus.DECOMPOSING]: 'text-purple-500',
    [TaskStatus.EXECUTING]: 'text-indigo-500',
    [TaskStatus.COORDINATING]: 'text-green-500',
    [TaskStatus.SYNTHESIZING]: 'text-yellow-500',
    [TaskStatus.REVIEWING]: 'text-orange-500',
    [TaskStatus.COMPLETED]: 'text-emerald-500',
    [TaskStatus.REVISION_REQUESTED]: 'text-amber-500',
    [TaskStatus.FAILED]: 'text-red-500',
  }
  return colors[status]
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'Ожидание',
    [TaskStatus.ANALYZING]: 'Анализ задачи',
    [TaskStatus.DECOMPOSING]: 'Декомпозиция',
    [TaskStatus.EXECUTING]: 'Выполнение',
    [TaskStatus.COORDINATING]: 'Координация',
    [TaskStatus.SYNTHESIZING]: 'Синтез решения',
    [TaskStatus.REVIEWING]: 'Проверка',
    [TaskStatus.COMPLETED]: 'Завершено',
    [TaskStatus.REVISION_REQUESTED]: 'Требуется доработка',
    [TaskStatus.FAILED]: 'Ошибка',
  }
  return labels[status]
}

export function getTaskProgress(status: TaskStatus): number {
  const progress: Record<TaskStatus, number> = {
    [TaskStatus.PENDING]: 0,
    [TaskStatus.ANALYZING]: 10,
    [TaskStatus.DECOMPOSING]: 20,
    [TaskStatus.EXECUTING]: 50,
    [TaskStatus.COORDINATING]: 70,
    [TaskStatus.SYNTHESIZING]: 85,
    [TaskStatus.REVIEWING]: 95,
    [TaskStatus.COMPLETED]: 100,
    [TaskStatus.REVISION_REQUESTED]: 60,
    [TaskStatus.FAILED]: 0,
  }
  return progress[status]
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateAvatar(name: string): string {
  // Generate a simple avatar URL based on name
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
