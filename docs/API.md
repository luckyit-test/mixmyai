# MixMyAI API Documentation

## Overview

MixMyAI предоставляет RESTful API для управления задачами и WebSocket подключения для real-time обновлений.

## Base URLs

- **API Service**: `http://localhost:4000`
- **Orchestration Service**: `http://localhost:8000`
- **WebSocket**: `ws://localhost:4000`

## Authentication

В текущей версии используется базовая аутентификация. В production версии будет JWT токен.

```
Authorization: Bearer <token>
```

## API Endpoints

### Tasks

#### Create Task

Создает новую задачу и запускает multi-agent workflow.

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Разработать систему аналитики",
  "description": "Создать dashboard для отображения метрик пользователей",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_1234567890_abc",
    "title": "Разработать систему аналитики",
    "description": "Создать dashboard для отображения метрик пользователей",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2025-10-20T12:00:00Z",
    "agents": [],
    "subtasks": []
  },
  "message": "Задача успешно создана",
  "timestamp": "2025-10-20T12:00:00Z"
}
```

#### Get Task

Получить информацию о задаче.

```http
GET /api/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_1234567890_abc",
    "title": "Разработать систему аналитики",
    "status": "executing",
    "agents": [
      {
        "id": "agent_1",
        "type": "manager",
        "name": "AI Менеджер",
        "status": "working"
      }
    ],
    "subtasks": [],
    "finalAnswer": null
  }
}
```

#### Get All Tasks

Получить список всех задач с пагинацией.

```http
GET /api/tasks?page=1&pageSize=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

#### Get Active Tasks

Получить все активные задачи.

```http
GET /api/tasks/active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_1",
      "title": "Task 1",
      "status": "executing"
    }
  ]
}
```

#### Request Revision

Отправить задачу на доработку.

```http
POST /api/tasks/:id/revise
Content-Type: application/json

{
  "feedback": "Добавьте больше деталей о производительности системы"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_1234567890_abc",
    "status": "revision_requested",
    "revisionCount": 1
  },
  "message": "Задача отправлена на доработку"
}
```

#### Delete Task

Удалить задачу.

```http
DELETE /api/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Задача удалена"
}
```

#### Get Task Agents

Получить список агентов, работающих над задачей.

```http
GET /api/tasks/:id/agents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent_1",
      "type": "manager",
      "name": "AI Менеджер",
      "status": "working",
      "currentAction": "Analyzing task requirements"
    }
  ]
}
```

### Dashboard

#### Get Statistics

Получить статистику dashboard.

```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 50,
    "activeTasks": 5,
    "completedTasks": 42,
    "averageCompletionTime": 1800,
    "successRate": 95.5,
    "activeAgents": 12
  }
}
```

## WebSocket Events

### Connection

Подключиться к WebSocket серверу:

```javascript
import io from 'socket.io-client'

const socket = io('ws://localhost:4000')

socket.on('connect', () => {
  console.log('Connected to WebSocket')
})
```

### Subscribe to Task Updates

Подписаться на обновления задачи:

```javascript
socket.emit('subscribe', { taskId: 'task_123' })
```

### Unsubscribe from Task Updates

Отписаться от обновлений задачи:

```javascript
socket.emit('unsubscribe', { taskId: 'task_123' })
```

### Receive Task Updates

Получать обновления о задаче:

```javascript
socket.on('task:update', (event) => {
  console.log('Task update:', event)
  /*
  {
    taskId: 'task_123',
    type: 'task:status_changed',
    message: 'Анализ задачи менеджером',
    timestamp: '2025-10-20T12:00:00Z',
    data: {...}
  }
  */
})
```

### Event Types

- `task:created` - Задача создана
- `task:updated` - Задача обновлена
- `task:status_changed` - Изменился статус задачи
- `agent:assigned` - Агент назначен на задачу
- `agent:status_changed` - Изменился статус агента
- `subtask:created` - Создана подзадача
- `subtask:completed` - Подзадача завершена
- `solution:submitted` - Решение отправлено
- `solution:reviewed` - Решение проверено
- `coordination:started` - Началась координация
- `synthesis:completed` - Синтез завершен
- `review:completed` - Проверка завершена
- `task:completed` - Задача завершена
- `error` - Произошла ошибка

## Orchestration Service API

### Start Task Workflow

Запустить multi-agent workflow (вызывается автоматически при создании задачи).

```http
POST /api/orchestration/start
Content-Type: application/json

{
  "taskId": "task_123",
  "title": "Task title",
  "description": "Task description",
  "priority": "medium"
}
```

### Start Revision Workflow

Запустить workflow для доработки задачи.

```http
POST /api/orchestration/revise
Content-Type: application/json

{
  "taskId": "task_123",
  "feedback": "Revision feedback",
  "previousAnswer": "Previous answer content"
}
```

## Error Handling

Все ошибки возвращаются в следующем формате:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-10-20T12:00:00Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API имеет ограничения:
- 100 запросов в 15 минут на IP
- WebSocket подключения не ограничены

## Examples

### Complete Flow Example

```javascript
// 1. Create task
const response = await fetch('http://localhost:4000/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Создать веб-приложение',
    description: 'React + Node.js приложение с авторизацией',
    priority: 'high'
  })
})

const { data: task } = await response.json()

// 2. Connect WebSocket
const socket = io('ws://localhost:4000')

// 3. Subscribe to updates
socket.emit('subscribe', { taskId: task.id })

// 4. Listen for updates
socket.on('task:update', (event) => {
  console.log('Status:', event.message)
})

// 5. Wait for completion
socket.on('task:completed', async () => {
  // Get final result
  const result = await fetch(`http://localhost:4000/api/tasks/${task.id}`)
  const { data } = await result.json()
  console.log('Final answer:', data.finalAnswer)
})

// 6. If needed, request revision
await fetch(`http://localhost:4000/api/tasks/${task.id}/revise`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feedback: 'Добавьте тесты'
  })
})
```

## SDK (Coming Soon)

В планах разработка SDK для популярных языков:
- JavaScript/TypeScript
- Python
- Go
