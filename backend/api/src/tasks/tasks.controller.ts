import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TasksService } from './tasks.service'
import { CreateTaskDto, ReviseTaskDto } from './dto/create-task.dto'

@ApiTags('tasks')
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    // In production, get userId from JWT token
    const userId = 'user_demo'
    return await this.tasksService.create(userId, createTaskDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks (paginated)' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return await this.tasksService.findAll(page, pageSize)
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active tasks' })
  async findActive() {
    return await this.tasksService.findActive()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string) {
    return await this.tasksService.findOne(id)
  }

  @Post(':id/revise')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request task revision' })
  async revise(
    @Param('id') id: string,
    @Body() reviseTaskDto: ReviseTaskDto,
  ) {
    // In production, get userId from JWT token
    const userId = 'user_demo'
    return await this.tasksService.revise(id, userId, reviseTaskDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  async remove(@Param('id') id: string) {
    return await this.tasksService.remove(id)
  }

  @Get(':id/agents')
  @ApiOperation({ summary: 'Get agents working on task' })
  async getAgents(@Param('id') id: string) {
    return await this.tasksService.getTaskAgents(id)
  }
}

@ApiTags('dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return await this.tasksService.getDashboardStats()
  }
}
