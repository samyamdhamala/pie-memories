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
  attended: boolean;
}

export type MemoriesWindow = 24 | 48 | 72 | 168;

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  creatorId: string;
  startTime: string;
  endTime: string;
  coverImageUrl: string;
  memoriesEnabled: boolean;
  memoriesWindowHours: MemoriesWindow;
  goingUserIds: string[];
  interestedUserIds: string[];
}

export type MemoryMediaType = "photo" | "video";

export interface Memory {
  id: string;
  eventId: string;
  authorId: string;
  mediaType: MemoryMediaType;
  mediaUrl: string;
  caption: string;
  createdAt: string;
  reported: boolean;
}

export interface MemoriesResponse {
  memories: Memory[];
  expiresAt: string;
  msUntilExpiry: number;
  windowOpen: boolean;
  canPost: boolean;
}
