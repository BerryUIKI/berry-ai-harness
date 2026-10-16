/**
 * Loopback WebSocket and process IPC control channel for Desktop Host.
 * Protocol generation: 5.
 */

export interface HostControlChannel {
  readonly mode: 'websocket' | 'ipc' | 'noop'
  send(message: object): Promise<void>
  onMessage(handler: (message: unknown) => void): void
  onDisconnect(handler: () => void): void
  close(): Promise<void>
}

export interface ControlEndpointOptions {
  port: number
  token: string
}

/**
 * Resolve control endpoint configuration from environment or command-line arguments.
 * Supports BERRY_CONTROL_PORT / BERRY_CONTROL_TOKEN and --control-port / --control-token flags.
 */
export function resolveControlEndpoint(
  argv: readonly string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env,
): ControlEndpointOptions | undefined {
  let port: number | undefined
  let token: string | undefined

  if (env.BERRY_CONTROL_PORT) {
    const parsed = parseInt(env.BERRY_CONTROL_PORT, 10)
    if (Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 65535) {
      port = parsed
    }
  }
  if (env.BERRY_CONTROL_TOKEN) {
    token = env.BERRY_CONTROL_TOKEN
  }

  for (let i = 0; i < argv.length; i++) {
    const nextArg = argv[i + 1]
    if (argv[i] === '--control-port' && nextArg !== undefined) {
      const parsed = parseInt(nextArg, 10)
      if (Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 65535) {
        port = parsed
      }
    } else if (argv[i] === '--control-token' && nextArg !== undefined) {
      token = nextArg
    }
  }

  if (port !== undefined && token !== undefined) {
    return { port, token }
  }
  return undefined
}

/**
 * Create a bidirectional control channel using loopback WebSocket if configured,
 * otherwise falling back to Node process IPC.
 */
export async function createHostControlChannel(
  options?: ControlEndpointOptions,
): Promise<HostControlChannel> {
  const endpoint = options ?? resolveControlEndpoint()

  if (endpoint !== undefined) {
    return createWebSocketControlChannel(endpoint.port, endpoint.token)
  }

  if (typeof process !== 'undefined' && process.connected && typeof process.send === 'function') {
    return createIpcControlChannel()
  }

  return {
    mode: 'noop',
    send: () => Promise.resolve(),
    onMessage: () => {},
    onDisconnect: () => {},
    close: () => Promise.resolve(),
  }
}

function createIpcControlChannel(): HostControlChannel {
  const messageHandlers = new Set<(message: unknown) => void>()
  const disconnectHandlers = new Set<() => void>()

  process.on('message', (message: unknown) => {
    for (const handler of messageHandlers) {
      handler(message)
    }
  })

  process.once('disconnect', () => {
    for (const handler of disconnectHandlers) {
      handler()
    }
  })

  return {
    mode: 'ipc',
    send: (message: object) => new Promise((resolve, reject) => {
      if (!process.connected || process.send === undefined) {
        resolve()
        return
      }
      process.send(message, (error) => {
        if (error === null) resolve()
        else reject(error)
      })
    }),
    onMessage: (handler) => { messageHandlers.add(handler) },
    onDisconnect: (handler) => { disconnectHandlers.add(handler) },
    close: () => {
      if (process.connected) {
        process.disconnect()
      }
      return Promise.resolve()
    },
  }
}

function createWebSocketControlChannel(port: number, token: string): Promise<HostControlChannel> {
  return new Promise((resolve, reject) => {
    const wsUrl = `ws://127.0.0.1:${port}/control?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)
    const messageHandlers = new Set<(message: unknown) => void>()
    const disconnectHandlers = new Set<() => void>()
    let isClosed = false

    const sendQueue: string[] = []

    ws.addEventListener('open', () => {
      while (sendQueue.length > 0) {
        const item = sendQueue.shift()
        if (item !== undefined) {
          ws.send(item)
        }
      }
      resolve({
        mode: 'websocket',
        send: (message: object) => {
          const payload = JSON.stringify(message)
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(payload)
          } else if (ws.readyState === WebSocket.CONNECTING) {
            sendQueue.push(payload)
          }
          return Promise.resolve()
        },
        onMessage: (handler) => {
          messageHandlers.add(handler)
        },
        onDisconnect: (handler) => {
          disconnectHandlers.add(handler)
        },
        close: () => {
          if (!isClosed) {
            isClosed = true
            ws.close()
          }
          return Promise.resolve()
        },
      })
    })

    ws.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? event.data : String(event.data)
        const parsed = JSON.parse(data) as unknown
        for (const handler of messageHandlers) {
          handler(parsed)
        }
      } catch (error) {
        console.error('Failed to parse incoming WebSocket control message:', error)
      }
    })

    ws.addEventListener('close', () => {
      isClosed = true
      for (const handler of disconnectHandlers) {
        handler()
      }
    })

    ws.addEventListener('error', (event) => {
      if (ws.readyState === WebSocket.CONNECTING) {
        reject(new Error(`Failed to connect to control WebSocket at ${wsUrl}`))
      } else {
        console.error('Control WebSocket error:', event)
      }
    })
  })
}
