import { useEffect, useRef } from 'react'
import SocketService from '@/lib/socket'
import { Socket } from 'socket.io-client'

export const useSocket = (userId: string | null) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (userId) {
      const socketService = SocketService.getInstance()
      socketRef.current = socketService.connect(userId)

      // Set up cleanup on component unmount
      return () => {
        if (socketRef.current) {
          socketService.disconnect()
          socketRef.current = null
        }
      }
    }
  }, [userId])

  return socketRef.current
}