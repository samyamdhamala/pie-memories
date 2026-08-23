import { useEffect, useState } from "react";
import { api } from "../api";
import type { Event, MemoriesResponse, MemoriesWindow, Memory, Rsvp, User } from "../types";
import { CountdownBadge } from "./CountdownBadge";
import { IconBookmark, IconCalendar, IconCheck, IconClock, IconDollar, IconPin, IconShare, IconX } from "./icons";
import { MemoriesGrid } from "./MemoriesGrid";
import { MemoriesSettings } from "./MemoriesSettings";
import { MemoryComposerModal } from "./MemoryComposerModal";
import { StoryViewer } from "./StoryViewer";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}
function formatTimeRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(start).toLocaleTimeString(undefined, opts)} - ${new Date(end).toLocaleTimeString(undefined, opts)}`;
}

export function EventDetail({
  eventId,
  currentUser,
  users,
  onBack,
}: {
  eventId: string;
  currentUser: User;
  users: User[];
  onBack: () => void;
}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  const [memoriesData, setMemoriesData] = useState<MemoriesResponse | null>(null);
  const [memoriesError, setMemoriesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storyMemories, setStoryMemories] = useState<Memory[] | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const loadEvent = async () => {
    const ev = await api.getEvent(eventId);
    setEvent(ev);
  };

  const loadMemories = async () => {
    try {
      const data = await api.getMemories(eventId, currentUser.id);
      setMemoriesData(data);
      setMemoriesError(null);
    } catch (err) {
      setMemoriesData(null);
      setMemoriesError(err instanceof Error ? err.message : "Failed to load memories");
    }
  };

  useEffect(() => {
    setLoading(true);
    setRsvp(null);
    Promise.all([loadEvent(), loadMemories()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, currentUser.id]);

  if (loading || !event) return <p className="empty-state">Loading…</p>;

  const isCreator = event.creatorId === currentUser.id;
  const hasEnded = new Date(event.endTime).getTime() < Date.now();
  const isGoing = rsvp?.status === "going" || event.goingUserIds.includes(currentUser.id);

  const doRsvp = async (status: "going" | "interested") => {
    const r = await api.rsvp(event.id, currentUser.id, status);
    setRsvp(r);
    await Promise.all([loadEvent(), loadMemories()]);
  };

  const postMemory = async (mediaType: "photo" | "video", mediaUrl: string, caption: string) => {
    await api.postMemory(event.id, currentUser.id, mediaType, mediaUrl, caption);
    await loadMemories();
    // The open reel (if any) is a snapshot from before this post — close it rather than show stale data.
    setStoryMemories(null);
  };

  const changeSettings = async (enabled: boolean, windowHours: MemoriesWindow) => {
    const updated = await api.updateMemoriesSettings(event.id, currentUser.id, enabled, windowHours);
    setEvent(updated);
    await loadMemories();
  };

  const reportMemory = async (memory: Memory) => {
    await api.reportMemory(event.id, memory.id, currentUser.id);
  };

  const removeMemory = async (memory: Memory) => {
    await api.removeMemory(event.id, memory.id, currentUser.id);
    await loadMemories();
    // The open reel is a snapshot from before the removal — close it rather than show stale data.
    setStoryMemories(null);
  };

  const creator = users.find((u) => u.id === event.creatorId);
  const going = event.goingUserIds.map((id) => users.find((u) => u.id === id)).filter(Boolean) as User[];

  return (
    <div className="plan-detail">
      <button className="back-link" onClick={onBack}>
        ← discover
      </button>

      <div className="plan-detail-layout">
        <img src={event.coverImageUrl} alt="" className="plan-detail-image" />

        <div className="plan-detail-info">
          <div className="plan-detail-title-row">
            <h1>{event.title}</h1>
            <div className="plan-detail-title-actions">
              <button className="icon-btn" aria-label="Save">
                <IconBookmark />
              </button>
              <button className="icon-btn" aria-label="Share">
                <IconShare />
              </button>
            </div>
          </div>

          <div className="creator-card">
            {creator && <img src={creator.avatarUrl} alt="" />}
            <div>
              <span className="creator-card-label">creator</span>
              <p>{creator?.name}</p>
            </div>
          </div>

          <div className="meta-row">
            <IconCalendar />
            <span>{formatDate(event.startTime)}</span>
          </div>
          <div className="meta-row">
            <IconClock />
            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
          </div>
          <div className="meta-row">
            <IconPin />
            <div>
              <strong>{event.location}</strong>
            </div>
          </div>
          <div className="meta-row">
            <IconDollar />
            <span>Free</span>
          </div>

          <p className="plan-detail-desc">{event.description}</p>

          {going.length > 0 && (
            <div className="going-row">
              <span className="going-count">{going.length} going</span>
              <div className="going-avatars">
                {going.slice(0, 5).map((u) => (
                  <img key={u.id} src={u.avatarUrl} alt={u.name} title={u.name} />
                ))}
              </div>
            </div>
          )}

          {hasEnded ? (
            <p className="plan-over-badge">this plan's over</p>
          ) : isGoing ? (
            <div className="rsvp-confirmed">
              <p className="rsvp-confirmed-label">you're in!</p>
            </div>
          ) : (
            <div className="rsvp-row">
              <button className="pill-btn pill-btn-lime" onClick={() => doRsvp("going")}>
                <IconCheck size={16} /> i'm in
              </button>
              <button className="pill-btn pill-btn-lime" onClick={() => doRsvp("interested")}>
                maybe
              </button>
              <button className="pill-btn pill-btn-lime" onClick={onBack}>
                <IconX size={16} /> i'm out
              </button>
            </div>
          )}
        </div>
      </div>

      {isCreator && (
        <section className="section">
          <h3>Memories settings</h3>
          <MemoriesSettings event={event} onChange={changeSettings} />
        </section>
      )}

      {!memoriesError &&
        (hasEnded ? (
          <section className="section">
            <div className="section-header">
              <h3>Memories</h3>
              {memoriesData && <CountdownBadge expiresAt={memoriesData.expiresAt} />}
            </div>

            {memoriesData && (
              <MemoriesGrid
                memories={memoriesData.memories}
                users={users}
                currentUserId={currentUser.id}
                canPost={memoriesData.canPost}
                isCreator={isCreator}
                onOpen={setStoryMemories}
                onAddClick={() => setComposerOpen(true)}
              />
            )}
          </section>
        ) : (
          <p className="empty-state memories-not-yet">Memories opens up once this plan has happened.</p>
        ))}

      {storyMemories && (
        <StoryViewer
          memories={storyMemories}
          users={users}
          currentUserId={currentUser.id}
          isCreator={isCreator}
          onClose={() => setStoryMemories(null)}
          showAdd={storyMemories[0]?.authorId === currentUser.id && !!memoriesData?.canPost}
          onAddClick={() => setComposerOpen(true)}
          onReport={reportMemory}
          onRemove={removeMemory}
        />
      )}

      {composerOpen && (
        <MemoryComposerModal onSubmit={postMemory} onClose={() => setComposerOpen(false)} />
      )}
    </div>
  );
}
