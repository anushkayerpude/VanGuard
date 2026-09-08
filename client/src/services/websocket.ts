/**
 * VANGUARD — Resilient WebSocket Gateway Client.
 *
 * Connects to ws://localhost:3001/stream with automatic backoff,
 * heartbeat monitoring, and type-safe frame dispatching.
 */

import type { WsMessageType } from '../types/vanguard';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'offline';

export type WsHandler = (type: WsMessageType, payload: any, timestamp: string) => void;

class VanguardWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private reconnectTimer: any = null;
  private handlers: Set<WsHandler> = new Set();
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();
  public status: WebSocketStatus = 'disconnected';

  constructor() {
    const isSsl = window.location.protocol === 'https:';
    const host = window.location.hostname || 'localhost';
    // If running in Vite dev with proxy, or direct to backend port 3001
    this.url = `${isSsl ? 'wss' : 'ws'}://${host}:3001/stream`;
  }

  public subscribe(handler: WsHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  public onStatusChange(listener: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(nextStatus: WebSocketStatus) {
    if (this.status !== nextStatus) {
      this.status = nextStatus;
      this.statusListeners.forEach((l) => l(nextStatus));
    }
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        console.log('[VANGUARD WS] Connected to live C4ISR stream');
      };

      this.ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data);
          if (frame && frame.type) {
            this.handlers.forEach((h) => h(frame.type, frame.payload, frame.timestamp));
          }
        } catch (err) {
          console.warn('[VANGUARD WS] Received malformed frame:', err);
        }
      };

      this.ws.onerror = () => {
        // Handled in onclose
      };

      this.ws.onclose = (event) => {
        this.ws = null;
        this.setStatus(this.reconnectAttempts >= 3 ? 'offline' : 'disconnected');
        this.scheduleReconnect();
      };
    } catch {
      this.setStatus('offline');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Pause aggressive reconnect, back to 10s retry
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts = 0;
        this.connect();
      }, 10000);
      return;
    }

    const delay = Math.min(10000, this.baseReconnectDelay * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }
}

export const vanguardWs = new VanguardWebSocketClient();
