import { type Response } from "express";

type SseClient = Response;

const clients = new Set<SseClient>();

export function addSseClient(res: SseClient): void {
  clients.add(res);
}

export function removeSseClient(res: SseClient): void {
  clients.delete(res);
}

export function broadcastPlotChange(type: "create" | "update" | "delete", plotId?: number): void {
  const data = JSON.stringify({ type, plotId });
  const message = `event: plot-change\ndata: ${data}\n\n`;
  for (const client of clients) {
    try {
      client.write(message);
    } catch {
      clients.delete(client);
    }
  }
}
