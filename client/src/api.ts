import type { Event, MemoriesResponse, MemoriesWindow, Memory, MemoryMediaType, Rsvp, RsvpStatus, User } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getUsers: () => fetch("/api/users").then((r) => json<User[]>(r)),

  getEvents: () => fetch("/api/events").then((r) => json<Event[]>(r)),

  getEvent: (id: string) => fetch(`/api/events/${id}`).then((r) => json<Event>(r)),

  rsvp: (eventId: string, userId: string, status: RsvpStatus) =>
    fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    }).then((r) => json<Rsvp>(r)),

  getMemories: (eventId: string, userId: string) =>
    fetch(`/api/events/${eventId}/memories?userId=${encodeURIComponent(userId)}`).then((r) => json<MemoriesResponse>(r)),

  postMemory: (eventId: string, userId: string, mediaType: MemoryMediaType, mediaUrl: string, caption: string) =>
    fetch(`/api/events/${eventId}/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, mediaType, mediaUrl, caption }),
    }).then((r) => json<Memory>(r)),

  updateMemoriesSettings: (eventId: string, userId: string, enabled: boolean, windowHours: MemoriesWindow) =>
    fetch(`/api/events/${eventId}/memories/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, enabled, windowHours }),
    }).then((r) => json<Event>(r)),

  reportMemory: (eventId: string, memoryId: string, userId: string) =>
    fetch(`/api/events/${eventId}/memories/${memoryId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => json<Memory>(r)),

  removeMemory: (eventId: string, memoryId: string, userId: string) =>
    fetch(`/api/events/${eventId}/memories/${memoryId}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) return r.json().then((body) => Promise.reject(new Error(body.error ?? `Request failed: ${r.status}`)));
    }),
};
