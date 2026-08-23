import type { Event, User } from "../types";
import { IconPin } from "./icons";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}
function formatTimeRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(start).toLocaleTimeString(undefined, opts)} - ${new Date(end).toLocaleTimeString(undefined, opts)}`;
}

export function EventList({
  events,
  users,
  onSelect,
}: {
  events: Event[];
  users: User[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="event-list">
      {events.map((e) => {
        const creator = users.find((u) => u.id === e.creatorId);
        const isPast = new Date(e.endTime).getTime() < Date.now();
        const going = e.goingUserIds.map((id) => users.find((u) => u.id === id)).filter(Boolean) as User[];

        return (
          <button key={e.id} className="plan-card" onClick={() => onSelect(e.id)}>
            <div className="plan-card-image" style={{ backgroundImage: `url(${e.coverImageUrl})` }}>
              {isPast && <span className="pill pill-muted plan-card-past">past</span>}
            </div>
            <div className="plan-card-details">
              <p className="plan-card-title">{e.title}</p>
              <div className="plan-card-creator">
                {creator && <img src={creator.avatarUrl} alt="" />}
                <div>
                  <span className="plan-card-creator-label">creator</span>
                  <p>{creator?.name}</p>
                </div>
              </div>
              {going.length > 0 && (
                <div className="plan-card-going">
                  {going.slice(0, 3).map((u) => (
                    <img key={u.id} src={u.avatarUrl} alt={u.name} />
                  ))}
                  <span>{going.length}</span>
                </div>
              )}
              <p className="plan-card-caption">
                <IconPin size={13} /> {formatDate(e.startTime)} · {formatTimeRange(e.startTime, e.endTime)} ·{" "}
                {e.location}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
