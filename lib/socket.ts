import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private static instance: SocketService

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  connect(userId: string): Socket {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      this.socket.on('connect', () => {
        console.log('Connected to socket server')
        // Authenticate user after connection
        if (this.socket) {
          this.socket.emit('authenticate', userId)
        }
      })

      this.socket.on('auth_error', (error) => {
        console.error('Authentication error:', error)
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
      })
    }

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  // Message events
  sendMessage(chatId: string, message: any): void {
    if (this.socket) {
      this.socket.emit('send_message', { chatId, message })
    }
  }

  joinChat(chatId: string): void {
    if (this.socket) {
      this.socket.emit('join_chat', chatId)
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket) {
      this.socket.emit('leave_chat', chatId)
    }
  }

  // Typing events
  startTyping(chatId: string): void {
    if (this.socket) {
      this.socket.emit('typing_start', chatId)
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket) {
      this.socket.emit('typing_stop', chatId)
    }
  }

  // Online status
  updateOnlineStatus(online: boolean): void {
    if (this.socket) {
      this.socket.emit('update_status', { online })
    }
  }
}

export default SocketService