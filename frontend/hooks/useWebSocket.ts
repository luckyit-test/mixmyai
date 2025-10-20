'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { WebSocketEvent } from '@/types'

interface UseWebSocketOptions {
  taskId?: string
  onEvent?: (event: WebSocketEvent) => void
  autoConnect?: boolean
}

export function useWebSocket({ taskId, onEvent, autoConnect = true }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

    const socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)

      // Subscribe to task updates if taskId provided
      if (taskId) {
        socket.emit('subscribe', { taskId })
      }
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socket.on('task:update', (event: WebSocketEvent) => {
      console.log('Task update received:', event)
      setLastEvent(event)
      onEvent?.(event)
    })

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error)
    })

    socketRef.current = socket
  }, [taskId, onEvent])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const subscribe = useCallback((newTaskId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', { taskId: newTaskId })
    }
  }, [])

  const unsubscribe = useCallback((oldTaskId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', { taskId: oldTaskId })
    }
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  useEffect(() => {
    if (taskId && socketRef.current?.connected) {
      subscribe(taskId)

      return () => {
        unsubscribe(taskId)
      }
    }
  }, [taskId, subscribe, unsubscribe])

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    socket: socketRef.current,
  }
}
