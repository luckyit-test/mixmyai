import { IsString, IsNotEmpty, IsEnum, IsOptional, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Разработать систему аналитики' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string

  @ApiProperty({ example: 'Создать dashboard для отображения метрик пользователей' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority: TaskPriority

  @ApiProperty({ required: false })
  @IsOptional()
  estimatedDuration?: number
}

export class ReviseTaskDto {
  @ApiProperty({ example: 'Добавьте больше деталей о производительности' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  feedback: string
}
