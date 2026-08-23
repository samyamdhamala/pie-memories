import { describe, expect, it } from "vitest";
import { canPostMemory, canViewMemories, isMemoriesWindowOpen, memoriesExpireAt, visibleMemories } from "../src/memories.js";
import type { Event, Memory, Rsvp } from "../src/types.js";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "e1",
    title: "Test Event",
    description: "",
    location: "",
    creatorId: "creator",
    startTime: "2026-01-01T18:00:00.000Z",
    endTime: "2026-01-01T21:00:00.000Z",
    coverImageUrl: "",
    memoriesEnabled: true,
    memoriesWindowHours: 24,
    ...overrides,
  };
}

function makeRsvp(overrides: Partial<Rsvp> = {}): Rsvp {
  return { id: "r1", eventId: "e1", userId: "u1", status: "going", attended: true, ...overrides };
}

describe("memoriesExpireAt", () => {
  it("adds the window hours to the event end time", () => {
    const event = makeEvent({ endTime: "2026-01-01T21:00:00.000Z", memoriesWindowHours: 24 });
    expect(memoriesExpireAt(event).toISOString()).toBe("2026-01-02T21:00:00.000Z");
  });

  it("supports a 48h window", () => {
    const event = makeEvent({ endTime: "2026-01-01T21:00:00.000Z", memoriesWindowHours: 48 });
    expect(memoriesExpireAt(event).toISOString()).toBe("2026-01-03T21:00:00.000Z");
  });

  it("supports a 72h window", () => {
    const event = makeEvent({ endTime: "2026-01-01T21:00:00.000Z", memoriesWindowHours: 72 });
    expect(memoriesExpireAt(event).toISOString()).toBe("2026-01-04T21:00:00.000Z");
  });

  it("supports a 7-day (168h) window", () => {
    const event = makeEvent({ endTime: "2026-01-01T21:00:00.000Z", memoriesWindowHours: 168 });
    expect(memoriesExpireAt(event).toISOString()).toBe("2026-01-08T21:00:00.000Z");
  });
});

describe("isMemoriesWindowOpen", () => {
  it("is open right after the event ends", () => {
    const event = makeEvent();
    expect(isMemoriesWindowOpen(event, new Date("2026-01-01T21:05:00.000Z"))).toBe(true);
  });

  it("is closed once the window has elapsed", () => {
    const event = makeEvent({ memoriesWindowHours: 24 });
    expect(isMemoriesWindowOpen(event, new Date("2026-01-02T21:01:00.000Z"))).toBe(false);
  });

  it("is closed if the creator disabled memories, even inside the window", () => {
    const event = makeEvent({ memoriesEnabled: false });
    expect(isMemoriesWindowOpen(event, new Date("2026-01-01T22:00:00.000Z"))).toBe(false);
  });
});

describe("canPostMemory", () => {
  const event = makeEvent();

  it("rejects a user with no RSVP", () => {
    const result = canPostMemory(event, undefined, new Date("2026-01-01T22:00:00.000Z"));
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/RSVP/);
  });

  it("rejects posting before the event has started", () => {
    const result = canPostMemory(event, makeRsvp(), new Date("2026-01-01T10:00:00.000Z"));
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/happened/);
  });

  it("rejects posting while the event is still happening", () => {
    const result = canPostMemory(event, makeRsvp(), new Date("2026-01-01T19:00:00.000Z"));
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/happened/);
  });

  it("allows posting after the event ends, within the window", () => {
    const result = canPostMemory(event, makeRsvp(), new Date("2026-01-02T20:00:00.000Z"));
    expect(result.allowed).toBe(true);
  });

  it("allows an 'interested' RSVP (not just 'going') to post", () => {
    const result = canPostMemory(event, makeRsvp({ status: "interested" }), new Date("2026-01-01T22:00:00.000Z"));
    expect(result.allowed).toBe(true);
  });

  it("rejects posting after the window closes", () => {
    const result = canPostMemory(event, makeRsvp(), new Date("2026-01-03T00:00:00.000Z"));
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/closed/);
  });

  it("rejects posting when the creator has memories disabled", () => {
    const off = makeEvent({ memoriesEnabled: false });
    const result = canPostMemory(off, makeRsvp(), new Date("2026-01-01T19:00:00.000Z"));
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/turned off/);
  });
});

describe("canViewMemories", () => {
  const event = makeEvent();

  it("lets an RSVP'd user view, even if they never attended in person", () => {
    const result = canViewMemories(event, makeRsvp({ attended: false }), false);
    expect(result.allowed).toBe(true);
  });

  it("lets the creator view without an RSVP record", () => {
    const result = canViewMemories(event, undefined, true);
    expect(result.allowed).toBe(true);
  });

  it("blocks a user who never RSVP'd", () => {
    const result = canViewMemories(event, undefined, false);
    expect(result.allowed).toBe(false);
  });
});

describe("visibleMemories", () => {
  const event = makeEvent();
  const memories: Memory[] = [
    { id: "m1", eventId: "e1", authorId: "u1", mediaType: "photo", mediaUrl: "a", caption: "", createdAt: "2026-01-01T21:30:00.000Z", reported: false },
    { id: "m2", eventId: "e2", authorId: "u1", mediaType: "photo", mediaUrl: "b", caption: "", createdAt: "2026-01-01T21:30:00.000Z", reported: false },
  ];

  it("only returns memories for this event", () => {
    const result = visibleMemories(event, memories, new Date("2026-01-01T22:00:00.000Z"));
    expect(result.map((m) => m.id)).toEqual(["m1"]);
  });

  it("returns nothing once the window has closed", () => {
    const result = visibleMemories(event, memories, new Date("2026-01-03T00:00:00.000Z"));
    expect(result).toEqual([]);
  });
});
