import type { Event, Memory, Rsvp, User } from "../types.js";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
const hoursFromNow = (h: number) => new Date(now + h * 60 * 60 * 1000).toISOString();

export const users: User[] = [
  { id: "u1", name: "Sam", avatarUrl: "https://i.pravatar.cc/100?u=u1" },
  { id: "u2", name: "Priya", avatarUrl: "https://i.pravatar.cc/100?u=u2" },
  { id: "u3", name: "Jordan", avatarUrl: "https://i.pravatar.cc/100?u=u3" },
  { id: "u4", name: "Alex", avatarUrl: "https://i.pravatar.cc/100?u=u4" },
];

export const events: Event[] = [
  {
    id: "e1",
    title: "Rooftop Sunset Mixer",
    description: "Casual rooftop hang to kick off the weekend. BYO good vibes.",
    location: "West Loop, Chicago",
    creatorId: "u1",
    startTime: hoursAgo(30),
    endTime: hoursAgo(27),
    coverImageUrl: "https://picsum.photos/seed/rooftop/800/400",
    memoriesEnabled: true,
    memoriesWindowHours: 24,
  },
  {
    id: "e2",
    title: "Lakefront Volleyball Tournament",
    description: "3v3 bracket, winners get bragging rights and a free pie (the food).",
    location: "North Ave Beach",
    creatorId: "u2",
    startTime: hoursAgo(3),
    endTime: hoursAgo(1),
    coverImageUrl: "https://picsum.photos/seed/volleyball/800/400",
    memoriesEnabled: true,
    memoriesWindowHours: 168,
  },
  {
    id: "e3",
    title: "Board Game Night",
    description: "Catan, Codenames, and mild betrayal.",
    location: "Wicker Park",
    creatorId: "u3",
    startTime: hoursFromNow(20),
    endTime: hoursFromNow(23),
    coverImageUrl: "https://picsum.photos/seed/boardgames/800/400",
    memoriesEnabled: true,
    memoriesWindowHours: 24,
  },
  {
    id: "e4",
    title: "Sunday Farmers Market Crawl",
    description: "Coffee, produce, and whatever the honey guy is selling this week.",
    location: "Logan Square",
    creatorId: "u4",
    startTime: hoursAgo(41),
    endTime: hoursAgo(39),
    coverImageUrl: "https://picsum.photos/seed/farmersmarket/800/400",
    memoriesEnabled: true,
    memoriesWindowHours: 72,
  },
];

export const rsvps: Rsvp[] = [
  { id: "r1", eventId: "e1", userId: "u1", status: "going", attended: true },
  { id: "r2", eventId: "e1", userId: "u2", status: "going", attended: true },
  { id: "r3", eventId: "e1", userId: "u3", status: "interested", attended: false },
  { id: "r4", eventId: "e2", userId: "u2", status: "going", attended: true },
  { id: "r5", eventId: "e2", userId: "u1", status: "going", attended: true },
  { id: "r6", eventId: "e2", userId: "u4", status: "interested", attended: false },
  { id: "r7", eventId: "e3", userId: "u3", status: "going", attended: false },
  { id: "r8", eventId: "e3", userId: "u1", status: "going", attended: false },
  { id: "r9", eventId: "e4", userId: "u4", status: "going", attended: true },
  { id: "r10", eventId: "e4", userId: "u1", status: "going", attended: true },
  { id: "r11", eventId: "e4", userId: "u3", status: "interested", attended: false },
];

export const memories: Memory[] = [
  {
    id: "m1",
    eventId: "e1",
    authorId: "u1",
    mediaType: "photo",
    mediaUrl: "https://picsum.photos/seed/mem1/600/600",
    caption: "That sunset though 🌅",
    createdAt: hoursAgo(27.5),
    reported: false,
  },
  {
    id: "m2",
    eventId: "e1",
    authorId: "u2",
    mediaType: "photo",
    mediaUrl: "https://picsum.photos/seed/mem2/600/600",
    caption: "Rooftop crew",
    createdAt: hoursAgo(27.2),
    reported: false,
  },
  {
    id: "m3",
    eventId: "e2",
    authorId: "u2",
    mediaType: "photo",
    mediaUrl: "https://picsum.photos/seed/mem3/600/600",
    caption: "Match point!",
    createdAt: hoursAgo(1.1),
    // Seeded as already-reported so the host-review UI has something to show without extra clicks.
    reported: true,
  },
  {
    id: "m4",
    eventId: "e4",
    authorId: "u4",
    mediaType: "video",
    mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    caption: "The honey guy's setup",
    createdAt: hoursAgo(38.8),
    reported: false,
  },
  {
    id: "m5",
    eventId: "e4",
    authorId: "u1",
    mediaType: "photo",
    mediaUrl: "https://picsum.photos/seed/mem5/600/600",
    caption: "Haul of the day",
    createdAt: hoursAgo(38.5),
    reported: false,
  },
  {
    id: "m6",
    eventId: "e4",
    authorId: "u4",
    mediaType: "photo",
    mediaUrl: "https://picsum.photos/seed/mem6/600/600",
    caption: "",
    createdAt: hoursAgo(38.2),
    reported: false,
  },
];
