import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'

// Mock database service for demo purposes
// In production, this would use Prisma or another ORM

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  // In-memory storage for demo
  private tasks: Map<string, any> = new Map()
  private agents: Map<string, any> = new Map()
  private subtasks: Map<string, any> = new Map()

  async onModuleInit() {
    console.log('📦 Database service initialized')
  }

  async onModuleDestroy() {
    console.log('📦 Database service destroyed')
  }

  // Tasks
  async createTask(data: any) {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const task = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
      agents: [],
      subtasks: [],
      revisionCount: 0,
    }
    this.tasks.set(id, task)
    return task
  }

  async getTask(id: string) {
    return this.tasks.get(id) || null
  }

  async updateTask(id: string, data: any) {
    const task = this.tasks.get(id)
    if (!task) return null

    const updated = {
      ...task,
      ...data,
      updatedAt: new Date(),
    }
    this.tasks.set(id, updated)
    return updated
  }

  async getTasks(page: number = 1, pageSize: number = 10) {
    const allTasks = Array.from(this.tasks.values())
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      items: allTasks.slice(start, end),
      total: allTasks.length,
      page,
      pageSize,
      totalPages: Math.ceil(allTasks.length / pageSize),
    }
  }

  async getActiveTasks() {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status !== 'completed' && task.status !== 'failed'
    )
  }

  async deleteTask(id: string) {
    return this.tasks.delete(id)
  }

  // Agents
  async createAgent(data: any) {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const agent = {
      id,
      ...data,
      createdAt: new Date(),
    }
    this.agents.set(id, agent)
    return agent
  }

  async updateAgent(id: string, data: any) {
    const agent = this.agents.get(id)
    if (!agent) return null

    const updated = { ...agent, ...data }
    this.agents.set(id, updated)
    return updated
  }

  // Subtasks
  async createSubtask(data: any) {
    const id = `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const subtask = {
      id,
      ...data,
      createdAt: new Date(),
      status: 'pending',
    }
    this.subtasks.set(id, subtask)
    return subtask
  }

  async updateSubtask(id: string, data: any) {
    const subtask = this.subtasks.get(id)
    if (!subtask) return null

    const updated = { ...subtask, ...data }
    this.subtasks.set(id, updated)
    return updated
  }

  // Stats
  async getDashboardStats() {
    const allTasks = Array.from(this.tasks.values())
    const completedTasks = allTasks.filter((t) => t.status === 'completed')

    return {
      totalTasks: allTasks.length,
      activeTasks: allTasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'failed'
      ).length,
      completedTasks: completedTasks.length,
      averageCompletionTime: 0,
      successRate: allTasks.length > 0
        ? (completedTasks.length / allTasks.length) * 100
        : 0,
      activeAgents: this.agents.size,
      tasksByStatus: {},
      tasksByPriority: {},
    }
  }
}
