import { Router } from "express";
import { canPostMemory, canViewMemories, isMemoriesWindowOpen, memoriesExpireAt, msUntilExpiry, visibleMemories } from "../memories.js";
import { store } from "../store.js";
import type { MemoriesWindow } from "../types.js";

export const memoriesRouter = Router({ mergeParams: true });

function requireEvent(req: any, res: any) {
  const event = store.getEvent(req.params.id);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return undefined;
  }
  return event;
}

memoriesRouter.get("/", (req, res) => {
  const event = requireEvent(req, res);
  if (!event) return;

  const userId = req.query.userId as string | undefined;
  const rsvp = userId ? store.getRsvp(event.id, userId) : undefined;
  const isCreator = userId === event.creatorId;

  const gate = canViewMemories(event, rsvp, isCreator);
  if (!gate.allowed) return res.status(403).json({ error: gate.reason });

  res.json({
    memories: visibleMemories(event, store.memoriesForEvent(event.id)),
    expiresAt: memoriesExpireAt(event).toISOString(),
    msUntilExpiry: msUntilExpiry(event),
    windowOpen: isMemoriesWindowOpen(event),
    canPost: canPostMemory(event, rsvp).allowed,
  });
});

memoriesRouter.post("/", (req, res) => {
  const event = requireEvent(req, res);
  if (!event) return;

  const { userId, mediaType, mediaUrl, caption } = req.body as {
    userId?: string;
    mediaType?: string;
    mediaUrl?: string;
    caption?: string;
  };
  if (!userId || !store.getUser(userId)) return res.status(400).json({ error: "Unknown userId" });
  if (mediaType !== "photo" && mediaType !== "video") {
    return res.status(400).json({ error: "mediaType must be 'photo' or 'video'" });
  }
  if (!mediaUrl) return res.status(400).json({ error: "mediaUrl is required" });

  const rsvp = store.getRsvp(event.id, userId);
  const gate = canPostMemory(event, rsvp);
  if (!gate.allowed) return res.status(403).json({ error: gate.reason });

  const memory = store.addMemory({ eventId: event.id, authorId: userId, mediaType, mediaUrl, caption: caption ?? "" });
  res.status(201).json(memory);
});

memoriesRouter.post("/:memoryId/report", (req, res) => {
  const event = requireEvent(req, res);
  if (!event) return;

  const memory = store.getMemory(req.params.memoryId);
  if (!memory || memory.eventId !== event.id) return res.status(404).json({ error: "Memory not found" });

  const { userId } = req.body as { userId?: string };
  if (!userId || !store.getUser(userId)) return res.status(400).json({ error: "Unknown userId" });

  const rsvp = store.getRsvp(event.id, userId);
  const isCreator = userId === event.creatorId;
  const gate = canViewMemories(event, rsvp, isCreator);
  if (!gate.allowed) return res.status(403).json({ error: gate.reason });

  if (memory.authorId === userId) return res.status(400).json({ error: "You can't report your own post." });

  const updated = store.reportMemory(memory.id);
  res.json(updated);
});

memoriesRouter.delete("/:memoryId", (req, res) => {
  const event = requireEvent(req, res);
  if (!event) return;

  const memory = store.getMemory(req.params.memoryId);
  if (!memory || memory.eventId !== event.id) return res.status(404).json({ error: "Memory not found" });

  const userId = req.query.userId as string | undefined;
  const canRemove = userId === event.creatorId || userId === memory.authorId;
  if (!canRemove) return res.status(403).json({ error: "Only the host or the person who posted it can remove this memory." });

  store.removeMemory(memory.id);
  res.status(204).end();
});

memoriesRouter.patch("/settings", (req, res) => {
  const event = requireEvent(req, res);
  if (!event) return;

  const { userId, enabled, windowHours } = req.body as {
    userId?: string;
    enabled?: boolean;
    windowHours?: MemoriesWindow;
  };
  if (userId !== event.creatorId) return res.status(403).json({ error: "Only the event creator can change Memories settings" });
  if (typeof enabled !== "boolean") return res.status(400).json({ error: "enabled must be a boolean" });
  const validWindows: MemoriesWindow[] = [24, 48, 72, 168];
  if (!validWindows.includes(windowHours as MemoriesWindow)) {
    return res.status(400).json({ error: "windowHours must be one of 24, 48, 72, 168" });
  }

  store.updateMemoriesSettings(event.id, enabled, windowHours as MemoriesWindow);
  res.json(store.decorateEvent(event.id));
});
