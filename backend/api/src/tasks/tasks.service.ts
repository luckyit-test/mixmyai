import { Injectable, NotFoundException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { DatabaseService } from '../database/database.service'
import { CreateTaskDto, ReviseTaskDto } from './dto/create-task.dto'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class TasksService {
  private readonly orchestrationUrl: string

  constructor(
    private readonly db: DatabaseService,
    private readonly httpService: HttpService,
  ) {
    this.orchestrationUrl = process.env.ORCHESTRATION_SERVICE_URL || 'http://localhost:8000'
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    // Create task in database
    const task = await this.db.createTask({
      ...createTaskDto,
      userId,
    })

    // Trigger orchestration service to start processing
    try {
      await firstValueFrom(
        this.httpService.post(`${this.orchestrationUrl}/api/orchestration/start`, {
          taskId: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
        })
      )
    } catch (error) {
      console.error('Failed to trigger orchestration:', error.message)
      // Task is created but orchestration failed - will be retried
    }

    return {
      success: true,
      data: task,
      message: 'Задача успешно создана',
      timestamp: new Date(),
    }
  }

  async findOne(id: string) {
    const task = await this.db.getTask(id)

    if (!task) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`)
    }

    return {
      success: true,
      data: task,
      timestamp: new Date(),
    }
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const result = await this.db.getTasks(page, pageSize)

    return {
      success: true,
      data: result,
      timestamp: new Date(),
    }
  }

  async findActive() {
    const tasks = await this.db.getActiveTasks()

    return {
      success: true,
      data: tasks,
      timestamp: new Date(),
    }
  }

  async revise(id: string, userId: string, reviseTaskDto: ReviseTaskDto) {
    const task = await this.db.getTask(id)

    if (!task) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`)
    }

    // Update task with revision
    const updated = await this.db.updateTask(id, {
      status: 'revision_requested',
      revisionCount: (task.revisionCount || 0) + 1,
      revisionHistory: [
        ...(task.revisionHistory || []),
        {
          id: `rev_${Date.now()}`,
          taskId: id,
          feedback: reviseTaskDto.feedback,
          requestedAt: new Date(),
          requestedBy: userId,
        },
      ],
    })

    // Trigger orchestration service to restart with context
    try {
      await firstValueFrom(
        this.httpService.post(`${this.orchestrationUrl}/api/orchestration/revise`, {
          taskId: id,
          feedback: reviseTaskDto.feedback,
          previousAnswer: task.finalAnswer,
        })
      )
    } catch (error) {
      console.error('Failed to trigger revision:', error.message)
    }

    return {
      success: true,
      data: updated,
      message: 'Задача отправлена на доработку',
      timestamp: new Date(),
    }
  }

  async remove(id: string) {
    const deleted = await this.db.deleteTask(id)

    if (!deleted) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`)
    }

    return {
      success: true,
      message: 'Задача удалена',
      timestamp: new Date(),
    }
  }

  async getDashboardStats() {
    const stats = await this.db.getDashboardStats()

    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    }
  }

  async getTaskAgents(id: string) {
    const task = await this.db.getTask(id)

    if (!task) {
      throw new NotFoundException(`Задача с ID ${id} не найдена`)
    }

    return {
      success: true,
      data: task.agents || [],
      timestamp: new Date(),
    }
  }

  // Called by orchestration service
  async updateTaskStatus(id: string, status: string, data: any = {}) {
    const updated = await this.db.updateTask(id, {
      status,
      ...data,
    })

    return updated
  }

  async addAgent(taskId: string, agent: any) {
    const task = await this.db.getTask(taskId)
    if (!task) return null

    const updatedAgents = [...(task.agents || []), agent]
    return await this.db.updateTask(taskId, { agents: updatedAgents })
  }

  async updateAgent(agentId: string, data: any) {
    return await this.db.updateAgent(agentId, data)
  }
}
