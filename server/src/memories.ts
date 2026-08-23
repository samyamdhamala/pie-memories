import type { Event, Memory, Rsvp } from "./types.js";

const HOUR_MS = 60 * 60 * 1000;

/** The instant memories for this event stop being visible to anyone. */
export function memoriesExpireAt(event: Event): Date {
  return new Date(new Date(event.endTime).getTime() + event.memoriesWindowHours * HOUR_MS);
}

export function isMemoriesWindowOpen(event: Event, now: Date = new Date()): boolean {
  return event.memoriesEnabled && now < memoriesExpireAt(event);
}

export interface EligibilityResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Memories is a past-plans-only feature: posting only opens once the event has
 * actually ended, not while it's happening (that's what the existing plan chat is for).
 * Anyone who RSVP'd (going or interested) can post, as long as the creator hasn't
 * turned Memories off and the window hasn't closed. Matches the product intent:
 * you don't have to have physically attended to contribute or view — RSVPing is
 * what grants access.
 */
export function canPostMemory(event: Event, rsvp: Rsvp | undefined, now: Date = new Date()): EligibilityResult {
  if (!rsvp) return { allowed: false, reason: "You need to RSVP to this event before posting a memory." };
  if (!event.memoriesEnabled) return { allowed: false, reason: "The host has turned off Memories for this event." };
  if (now < new Date(event.endTime)) return { allowed: false, reason: "Memories open once the plan has happened." };
  if (now >= memoriesExpireAt(event)) return { allowed: false, reason: "The Memories window for this event has closed." };
  return { allowed: true };
}

export function canViewMemories(event: Event, rsvp: Rsvp | undefined, isCreator: boolean): EligibilityResult {
  if (!rsvp && !isCreator) {
    return { allowed: false, reason: "RSVP to this event to see its Memories." };
  }
  return { allowed: true };
}

export function visibleMemories(event: Event, memories: Memory[], now: Date = new Date()): Memory[] {
  if (!isMemoriesWindowOpen(event, now)) return [];
  return memories
    .filter((m) => m.eventId === event.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function msUntilExpiry(event: Event, now: Date = new Date()): number {
  return Math.max(0, memoriesExpireAt(event).getTime() - now.getTime());
}
