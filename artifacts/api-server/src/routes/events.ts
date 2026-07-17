import { Router, type IRouter } from "express";
import { addSseClient, removeSseClient } from "../lib/sse";

const router: IRouter = Router();

router.get("/events", (req, res): void => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send initial ping
  res.write("event: connected\ndata: {}\n\n");

  addSseClient(res);

  // Heartbeat every 25 seconds to keep alive
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeSseClient(res);
  });
});

export default router;
