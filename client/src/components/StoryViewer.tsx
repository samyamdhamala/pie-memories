import { useEffect, useRef, useState } from "react";
import type { Memory, User } from "../types";

const SLIDE_MS = 10_000;

export function StoryViewer({
  memories,
  users,
  currentUserId,
  isCreator = false,
  startIndex = 0,
  onClose,
  showAdd = false,
  onAddClick,
  onReport,
  onRemove,
}: {
  memories: Memory[];
  users: User[];
  currentUserId: string;
  /** The event's host — hosts can remove any post on their own plan, not just their own. */
  isCreator?: boolean;
  startIndex?: number;
  onClose: () => void;
  /** Show a "+" in the header — only makes sense when viewing your own story and you're still allowed to post. */
  showAdd?: boolean;
  onAddClick?: () => void;
  onReport?: (memory: Memory) => Promise<void>;
  onRemove?: (memory: Memory) => Promise<void>;
}) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const rafRef = useRef<number>();
  const startedAtRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = memories[index];
  const author = users.find((u) => u.id === current?.authorId);

  const goTo = (next: number) => {
    if (next < 0) {
      setIndex(0);
      return;
    }
    if (next >= memories.length) {
      onClose();
      return;
    }
    setIndex(next);
  };

  useEffect(() => {
    setProgress(0);
    startedAtRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
    setMenuOpen(false);
  }, [index]);

  // Photo slides advance on a fixed timer; video slides advance on their own playback progress.
  useEffect(() => {
    if (paused || current?.mediaType !== "photo") return;

    const tick = () => {
      const elapsed = elapsedBeforePauseRef.current + (Date.now() - startedAtRef.current);
      const pct = Math.min(1, elapsed / SLIDE_MS);
      setProgress(pct);
      if (pct >= 1) {
        goTo(index + 1);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, current?.mediaType]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || current?.mediaType !== "video") return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [paused, current?.mediaType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!current) return null;

  const pause = () => {
    elapsedBeforePauseRef.current += Date.now() - startedAtRef.current;
    setPaused(true);
  };
  const resume = () => {
    startedAtRef.current = Date.now();
    setPaused(false);
  };

  const isMine = current.authorId === currentUserId;
  const canReport = !isMine && !!onReport;
  const canRemove = (isCreator || isMine) && !!onRemove;
  const alreadyReported = current.reported || reportedIds.has(current.id);

  return (
    <div className="story-viewer" onMouseDown={pause} onMouseUp={resume} onTouchStart={pause} onTouchEnd={resume}>
      <div className="story-progress-row">
        {memories.map((m, i) => (
          <div key={m.id} className="story-progress-track">
            <div
              className="story-progress-fill"
              style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="story-header">
        <div className="story-author">
          {author && <img src={author.avatarUrl} alt="" />}
          <span>{author?.name ?? "Someone"}</span>
          {isCreator && current.reported && <span className="story-reported-badge">reported</span>}
        </div>
        <div className="story-header-actions">
          {current.mediaType === "video" && (
            <button className="story-mute" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? "🔇" : "🔊"}
            </button>
          )}
          {showAdd && onAddClick && (
            <button
              className="story-add"
              onClick={() => {
                pause();
                onAddClick();
              }}
              aria-label="Add another memory"
            >
              +
            </button>
          )}
          {(canReport || canRemove) && (
            <div className="story-more-wrap">
              <button
                className="story-more"
                onClick={() => {
                  pause();
                  setMenuOpen((o) => !o);
                }}
                aria-label="More options"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="story-menu">
                  {canReport && (
                    <button
                      className="story-menu-item"
                      disabled={alreadyReported}
                      onClick={async () => {
                        await onReport!(current);
                        setReportedIds((s) => new Set(s).add(current.id));
                        setMenuOpen(false);
                      }}
                    >
                      {alreadyReported ? "Reported ✓" : "Report to host"}
                    </button>
                  )}
                  {canRemove && (
                    <button
                      className="story-menu-item story-menu-item--danger"
                      onClick={async () => {
                        setMenuOpen(false);
                        await onRemove!(current);
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <button className="story-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="story-media-wrap">
        {current.mediaType === "video" ? (
          <video
            key={current.id}
            ref={videoRef}
            src={current.mediaUrl}
            className="story-media"
            autoPlay
            muted={muted}
            playsInline
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onEnded={() => goTo(index + 1)}
          />
        ) : (
          <img key={current.id} src={current.mediaUrl} alt={current.caption} className="story-media" />
        )}
        {current.caption && <p className="story-caption">{current.caption}</p>}
      </div>

      <button className="story-tap-zone story-tap-left" onClick={() => goTo(index - 1)} aria-label="Previous" />
      <button className="story-tap-zone story-tap-right" onClick={() => goTo(index + 1)} aria-label="Next" />
    </div>
  );
}
