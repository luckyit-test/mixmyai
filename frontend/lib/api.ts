import axios, { AxiosInstance, AxiosError } from 'axios'
import { Task, CreateTaskInput, RevisionInput, ApiResponse, PaginatedResponse, DashboardStats } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if exists
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Tasks
  async createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    const { data } = await this.client.post('/api/tasks', input)
    return data
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    const { data } = await this.client.get(`/api/tasks/${taskId}`)
    return data
  }

  async getTasks(page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const { data } = await this.client.get('/api/tasks', {
      params: { page, pageSize },
    })
    return data
  }

  async getActiveTasks(): Promise<ApiResponse<Task[]>> {
    const { data } = await this.client.get('/api/tasks/active')
    return data
  }

  async reviseTask(input: RevisionInput): Promise<ApiResponse<Task>> {
    const { data } = await this.client.post(`/api/tasks/${input.taskId}/revise`, {
      feedback: input.feedback,
    })
    return data
  }

  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.delete(`/api/tasks/${taskId}`)
    return data
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await this.client.get('/api/dashboard/stats')
    return data
  }

  // Agents
  async getTaskAgents(taskId: string): Promise<ApiResponse<any>> {
    const { data } = await this.client.get(`/api/tasks/${taskId}/agents`)
    return data
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { data } = await this.client.get('/health')
      return data.status === 'ok'
    } catch (error) {
      return false
    }
  }
}

export const apiClient = new ApiClient()
