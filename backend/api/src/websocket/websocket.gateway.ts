import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private taskSubscriptions: Map<string, Set<string>> = new Map()

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)

    // Remove client from all subscriptions
    for (const [taskId, clients] of this.taskSubscriptions.entries()) {
      clients.delete(client.id)
      if (clients.size === 0) {
        this.taskSubscriptions.delete(taskId)
      }
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { taskId: string }) {
    const { taskId } = payload

    if (!this.taskSubscriptions.has(taskId)) {
      this.taskSubscriptions.set(taskId, new Set())
    }

    this.taskSubscriptions.get(taskId)!.add(client.id)
    console.log(`Client ${client.id} subscribed to task ${taskId}`)

    return { success: true, taskId }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { taskId: string }) {
    const { taskId } = payload

    if (this.taskSubscriptions.has(taskId)) {
      this.taskSubscriptions.get(taskId)!.delete(client.id)
      console.log(`Client ${client.id} unsubscribed from task ${taskId}`)
    }

    return { success: true, taskId }
  }

  // Broadcast event to all clients subscribed to a task
  broadcastTaskEvent(taskId: string, event: any) {
    const clients = this.taskSubscriptions.get(taskId)

    if (clients && clients.size > 0) {
      this.server.to(Array.from(clients)).emit('task:update', {
        taskId,
        timestamp: new Date(),
        ...event,
      })

      console.log(`Broadcast event to ${clients.size} clients for task ${taskId}`)
    }
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data)
  }
}
