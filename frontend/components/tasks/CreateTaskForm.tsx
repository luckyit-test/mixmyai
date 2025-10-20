'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskPriority } from '@/types'
import { Sparkles, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateTaskFormProps {
  onSubmit: (data: { title: string; description: string; priority: TaskPriority }) => void
  isLoading?: boolean
}

const priorities: { value: TaskPriority; label: string; description: string }[] = [
  { value: TaskPriority.LOW, label: 'Низкий', description: 'Выполнить когда будет время' },
  { value: TaskPriority.MEDIUM, label: 'Средний', description: 'Обычная задача' },
  { value: TaskPriority.HIGH, label: 'Высокий', description: 'Важная задача' },
  { value: TaskPriority.URGENT, label: 'Срочный', description: 'Требует немедленного внимания' },
]

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSubmit, isLoading = false }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && description.trim()) {
      onSubmit({ title, description, priority })
      setTitle('')
      setDescription('')
      setPriority(TaskPriority.MEDIUM)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Создать новую задачу</CardTitle>
            <CardDescription>
              Опишите задачу, и наши AI-агенты совместно найдут решение
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Название задачи
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Разработать систему аналитики пользователей"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Описание задачи
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробно опишите, что нужно сделать, какие требования и ожидаемый результат..."
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              required
              disabled={isLoading}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Приоритет</label>
            <div className="grid grid-cols-2 gap-3">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  disabled={isLoading}
                  className={cn(
                    'relative rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50',
                    priority === p.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{p.label}</span>
                    {priority === p.value && (
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">
              AI-агенты начнут работу сразу после отправки
            </p>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Создание...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Создать задачу
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
