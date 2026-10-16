import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'
import { describe, expect, it } from 'vitest'
import { WebSocketServer, type WebSocket } from 'ws'
import {
  createHostControlChannel,
  resolveControlEndpoint,
} from '../src/sidecar-control.ts'

describe('sidecar-control', () => {
  describe('resolveControlEndpoint', () => {
    it('resolves from environment variables', () => {
      const endpoint = resolveControlEndpoint([], {
        BERRY_CONTROL_PORT: '54321',
        BERRY_CONTROL_TOKEN: 'secret-token-123',
      })
      expect(endpoint).toEqual({
        port: 54321,
        token: 'secret-token-123',
      })
    })

    it('resolves from command-line arguments', () => {
      const endpoint = resolveControlEndpoint([
        'node',
        'index.js',
        '--control-port',
        '12345',
        '--control-token',
        'arg-token-456',
      ], {})
      expect(endpoint).toEqual({
        port: 12345,
        token: 'arg-token-456',
      })
    })

    it('returns undefined when configuration is missing', () => {
      const endpoint = resolveControlEndpoint([], {})
      expect(endpoint).toBeUndefined()
    })
  })

  describe('WebSocket control channel', () => {
    it('connects, sends, and receives messages over loopback WebSocket', async () => {
      const server = createServer()
      const wss = new WebSocketServer({ server })
      const token = 'test-token-789'

      let serverReceivedMessage: unknown = null
      let serverClientWs: WebSocket | null = null

      wss.on('connection', (ws, req) => {
        const url = new URL(req.url ?? '', 'http://127.0.0.1')
        expect(url.searchParams.get('token')).toBe(token)
        serverClientWs = ws

        ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
          const raw = Buffer.isBuffer(data)
            ? data.toString('utf8')
            : Array.isArray(data)
              ? Buffer.concat(data).toString('utf8')
              : new TextDecoder().decode(data)
          serverReceivedMessage = JSON.parse(raw) as unknown
        })
      })

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => { resolve() })
      })

      const address = server.address()
      if (typeof address !== 'object' || address === null) {
        throw new Error('Failed to obtain server address')
      }

      const channel = await createHostControlChannel({
        port: address.port,
        token,
      })

      expect(channel.mode).toBe('websocket')

      // Test sending from client to server
      await channel.send({ type: 'ready', url: 'http://127.0.0.1:8080' })

      // Wait a moment for server to receive
      await new Promise(r => setTimeout(r, 50))
      expect(serverReceivedMessage).toEqual({ type: 'ready', url: 'http://127.0.0.1:8080' })

      // Test sending from server to client
      let clientReceivedMessage: unknown = null
      channel.onMessage((msg) => {
        clientReceivedMessage = msg
      })

      if (serverClientWs !== null) {
        (serverClientWs as WebSocket).send(JSON.stringify({ type: 'ping' }))
      }
      await new Promise(r => setTimeout(r, 50))
      expect(clientReceivedMessage).toEqual({ type: 'ping' })

      // Test close and disconnect
      let disconnected = false
      channel.onDisconnect(() => {
        disconnected = true
      })

      await channel.close()
      await new Promise(r => setTimeout(r, 50))
      expect(disconnected).toBe(true)

      wss.close()
      server.close()
    })
  })
})
