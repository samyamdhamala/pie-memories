import { randomUUID } from "node:crypto";
import { events, memories, rsvps, users } from "./data/seed.js";
import type { Event, Memory, MemoriesWindow, Rsvp, RsvpStatus, User } from "./types.js";

/** In-memory data layer for the demo — swap for a real DB in production. */
class Store {
  users: User[] = users;
  events: Event[] = events;
  rsvps: Rsvp[] = rsvps;
  memories: Memory[] = memories;

  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getEvent(id: string): Event | undefined {
    return this.events.find((e) => e.id === id);
  }

  getRsvp(eventId: string, userId: string): Rsvp | undefined {
    return this.rsvps.find((r) => r.eventId === eventId && r.userId === userId);
  }

  goingUserIds(eventId: string): string[] {
    return this.rsvps.filter((r) => r.eventId === eventId && r.status === "going").map((r) => r.userId);
  }

  interestedUserIds(eventId: string): string[] {
    return this.rsvps.filter((r) => r.eventId === eventId && r.status === "interested").map((r) => r.userId);
  }

  upsertRsvp(eventId: string, userId: string, status: RsvpStatus): Rsvp {
    const existing = this.getRsvp(eventId, userId);
    if (existing) {
      existing.status = status;
      return existing;
    }
    const rsvp: Rsvp = { id: randomUUID(), eventId, userId, status, attended: false };
    this.rsvps.push(rsvp);
    return rsvp;
  }

  memoriesForEvent(eventId: string): Memory[] {
    return this.memories.filter((m) => m.eventId === eventId);
  }

  addMemory(input: Omit<Memory, "id" | "createdAt" | "reported">): Memory {
    const memory: Memory = { ...input, id: randomUUID(), createdAt: new Date().toISOString(), reported: false };
    this.memories.push(memory);
    return memory;
  }

  getMemory(memoryId: string): Memory | undefined {
    return this.memories.find((m) => m.id === memoryId);
  }

  reportMemory(memoryId: string): Memory | undefined {
    const memory = this.getMemory(memoryId);
    if (!memory) return undefined;
    memory.reported = true;
    return memory;
  }

  removeMemory(memoryId: string): boolean {
    const index = this.memories.findIndex((m) => m.id === memoryId);
    if (index === -1) return false;
    this.memories.splice(index, 1);
    return true;
  }

  updateMemoriesSettings(eventId: string, enabled: boolean, windowHours: MemoriesWindow): Event | undefined {
    const event = this.getEvent(eventId);
    if (!event) return undefined;
    event.memoriesEnabled = enabled;
    event.memoriesWindowHours = windowHours;
    return event;
  }

  /**
   * Every event the client sees needs goingUserIds/interestedUserIds attached — the client
   * reads them unconditionally (e.g. `event.goingUserIds.includes(...)`), so any endpoint that
   * returns a bare Event without this crashes the client on that response.
   */
  decorateEvent(eventId: string): (Event & { goingUserIds: string[]; interestedUserIds: string[] }) | undefined {
    const event = this.getEvent(eventId);
    if (!event) return undefined;
    return { ...event, goingUserIds: this.goingUserIds(eventId), interestedUserIds: this.interestedUserIds(eventId) };
  }
}

export const store = new Store();
