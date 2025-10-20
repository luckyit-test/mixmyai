// Agent Types
export enum AgentType {
  MANAGER = 'manager',
  SPECIALIST = 'specialist',
  COORDINATOR = 'coordinator',
  ANALYST = 'analyst',
}

export enum SpecialistRole {
  DEVELOPER = 'developer',
  RESEARCHER = 'researcher',
  ANALYST = 'analyst',
  DESIGNER = 'designer',
  DATA_SCIENTIST = 'data_scientist',
  WRITER = 'writer',
  QA_ENGINEER = 'qa_engineer',
}

export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface Agent {
  id: string
  type: AgentType
  name: string
  role?: SpecialistRole
  status: AgentStatus
  currentAction?: string
  progress?: number
  avatar?: string
  createdAt: Date
}

// Task Types
export enum TaskStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  DECOMPOSING = 'decomposing',
  EXECUTING = 'executing',
  COORDINATING = 'coordinating',
  SYNTHESIZING = 'synthesizing',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  REVISION_REQUESTED = 'revision_requested',
  FAILED = 'failed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  estimatedDuration?: number
  actualDuration?: number
  userId: string
  agents: Agent[]
  subtasks: Subtask[]
  finalAnswer?: string
  revisionCount: number
  revisionHistory?: RevisionRequest[]
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  description: string
  assignedTo: string // Agent ID
  status: TaskStatus
  solution?: string
  createdAt: Date
  completedAt?: Date
  isAccepted?: boolean
}

export interface RevisionRequest {
  id: string
  taskId: string
  feedback: string
  requestedAt: Date
  requestedBy: string
}

// Solution Types
export interface Solution {
  id: string
  subtaskId: string
  agentId: string
  content: string
  confidence: number
  createdAt: Date
  isAccepted: boolean
  reviewNotes?: string
}

// Real-time Event Types
export enum EventType {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_STATUS_CHANGED = 'task:status_changed',
  AGENT_ASSIGNED = 'agent:assigned',
  AGENT_STATUS_CHANGED = 'agent:status_changed',
  SUBTASK_CREATED = 'subtask:created',
  SUBTASK_COMPLETED = 'subtask:completed',
  SOLUTION_SUBMITTED = 'solution:submitted',
  SOLUTION_REVIEWED = 'solution:reviewed',
  COORDINATION_STARTED = 'coordination:started',
  SYNTHESIS_COMPLETED = 'synthesis:completed',
  FINAL_REVIEW_COMPLETED = 'review:completed',
  TASK_COMPLETED = 'task:completed',
  ERROR = 'error',
}

export interface WebSocketEvent {
  type: EventType
  taskId: string
  timestamp: Date
  data: any
  message?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  role: 'user' | 'admin'
}

// Dashboard Statistics
export interface DashboardStats {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  averageCompletionTime: number
  successRate: number
  activeAgents: number
  tasksByStatus: Record<TaskStatus, number>
  tasksByPriority: Record<TaskPriority, number>
}

// Form Types
export interface CreateTaskInput {
  title: string
  description: string
  priority: TaskPriority
  estimatedDuration?: number
}

export interface RevisionInput {
  taskId: string
  feedback: string
}

// Notification Types
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}
