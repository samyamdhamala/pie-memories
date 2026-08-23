export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export type RsvpStatus = "going" | "interested";

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
  /** Set once the event has happened; distinguishes "RSVP'd but didn't show" from "was there". */
  attended: boolean;
}

export type MemoriesWindow = 24 | 48 | 72 | 168; // hours: 24h, 2 days, 3 days, or 7 days

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  creatorId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  coverImageUrl: string;
  memoriesEnabled: boolean;
  memoriesWindowHours: MemoriesWindow;
}

export type MemoryMediaType = "photo" | "video";

export interface Memory {
  id: string;
  eventId: string;
  authorId: string;
  mediaType: MemoryMediaType;
  mediaUrl: string;
  caption: string;
  createdAt: string; // ISO
  /** Flagged by a viewer for the host to review. Reactive, not a moderation queue — the host just sees it and can remove it. */
  reported: boolean;
}
