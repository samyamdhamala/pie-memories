import type { Memory, User } from "../types";

interface AuthorBubble {
  authorId: string;
  items: Memory[]; // chronological (oldest first), so playback tells the story in order
}

/** Groups memories by author — like IG, one person's posts share a single bubble. */
function groupByAuthor(memories: Memory[]): AuthorBubble[] {
  const order: string[] = [];
  const byAuthor = new Map<string, Memory[]>();
  for (const m of memories) {
    if (!byAuthor.has(m.authorId)) {
      byAuthor.set(m.authorId, []);
      order.push(m.authorId);
    }
    byAuthor.get(m.authorId)!.push(m);
  }
  return order.map((authorId) => ({
    authorId,
    items: [...byAuthor.get(authorId)!].reverse(), // memories arrive newest-first; play oldest-first
  }));
}

function BubbleThumb({ item }: { item: Memory }) {
  return item.mediaType === "video" ? (
    <video src={item.mediaUrl} className="highlight-thumb" muted playsInline preload="metadata" />
  ) : (
    <img src={item.mediaUrl} alt={item.caption} className="highlight-thumb" />
  );
}

export function MemoriesGrid({
  memories,
  users,
  currentUserId,
  canPost,
  isCreator = false,
  onOpen,
  onAddClick,
}: {
  memories: Memory[];
  users: User[];
  currentUserId: string;
  canPost: boolean;
  /** Hosts see a small marker on bubbles containing a reported post, so they know to review. */
  isCreator?: boolean;
  onOpen: (items: Memory[]) => void;
  onAddClick: () => void;
}) {
  const bubbles = groupByAuthor(memories);
  const mine = bubbles.find((b) => b.authorId === currentUserId);
  const others = bubbles.filter((b) => b.authorId !== currentUserId);

  if (memories.length === 0 && !canPost) {
    return <p className="empty-state">No memories posted yet.</p>;
  }

  return (
    <div className="highlights-rail">
      {mine ? (
        <button className="highlight-circle" onClick={() => onOpen(mine.items)}>
          <div className="highlight-ring highlight-ring--mine">
            <BubbleThumb item={mine.items[mine.items.length - 1]} />
            {mine.items[mine.items.length - 1].mediaType === "video" && <span className="highlight-play">▶</span>}
            {mine.items.length > 1 && <span className="highlight-count">{mine.items.length}</span>}
            {isCreator && mine.items.some((m) => m.reported) && <span className="highlight-reported-dot" />}
            {canPost && (
              <span
                className="highlight-add-badge"
                role="button"
                tabIndex={0}
                aria-label="Add another memory"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onAddClick();
                  }
                }}
              >
                +
              </span>
            )}
          </div>
          <span className="highlight-name">You</span>
        </button>
      ) : (
        canPost && (
          <button className="highlight-circle" onClick={onAddClick}>
            <div className="highlight-ring highlight-ring--add">
              <span className="highlight-add-icon">+</span>
            </div>
            <span className="highlight-name">Your story</span>
          </button>
        )
      )}

      {others.map((bubble) => {
        const author = users.find((u) => u.id === bubble.authorId);
        const cover = bubble.items[bubble.items.length - 1];
        return (
          <button key={bubble.authorId} className="highlight-circle" onClick={() => onOpen(bubble.items)}>
            <div className="highlight-ring">
              <BubbleThumb item={cover} />
              {cover.mediaType === "video" && <span className="highlight-play">▶</span>}
              {bubble.items.length > 1 && <span className="highlight-count">{bubble.items.length}</span>}
              {isCreator && bubble.items.some((m) => m.reported) && <span className="highlight-reported-dot" />}
            </div>
            <span className="highlight-name">{author?.name ?? "Someone"}</span>
          </button>
        );
      })}
    </div>
  );
}
