import { Router } from "express";
import { store } from "../store.js";

export const eventsRouter = Router();

eventsRouter.get("/", (_req, res) => {
  res.json(store.events.map((e) => store.decorateEvent(e.id)));
});

eventsRouter.get("/:id", (req, res) => {
  const event = store.decorateEvent(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

eventsRouter.post("/:id/rsvp", (req, res) => {
  const event = store.getEvent(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const { userId, status } = req.body as { userId?: string; status?: string };
  if (!userId || !store.getUser(userId)) return res.status(400).json({ error: "Unknown userId" });
  if (status !== "going" && status !== "interested") {
    return res.status(400).json({ error: "status must be 'going' or 'interested'" });
  }

  const rsvp = store.upsertRsvp(event.id, userId, status);
  res.status(200).json(rsvp);
});
